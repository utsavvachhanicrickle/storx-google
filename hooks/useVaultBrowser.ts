"use client";

import { useCallback, useRef, useState } from "react";
import {
  accessGrantService,
  FILE_BROWSER_AG_NAME,
} from "@/services/accessGrantService";
import { configService } from "@/services/configService";
import { projectService } from "@/services/projectService";
import { createS3Client, listVaultObjects } from "@/services/vaultS3Service";
import type { EdgeCredentials, VaultBrowserObject } from "@/types/vault";
import type { S3Client } from "@aws-sdk/client-s3";
import toast from "@/components/Toast";

let workerInstance: Worker | null = null;
let workerReadyPromise: Promise<void> | null = null;

function postToWorker<T = unknown>(
  worker: Worker,
  message: Record<string, unknown>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    worker.onmessage = (event) => {
      if (event.data instanceof Error) {
        reject(event.data);
        return;
      }
      if (event.data?.error) {
        reject(new Error(String(event.data.error)));
        return;
      }
      resolve(event.data as T);
    };
    worker.onerror = (err) => reject(new Error(err.message));
    worker.postMessage(message);
  });
}

async function ensureAccessGrantWorker(): Promise<Worker> {
  if (workerInstance && workerReadyPromise) {
    await workerReadyPromise;
    return workerInstance;
  }

  workerInstance = new Worker("/static/accessGrant.worker.js");
  workerReadyPromise = postToWorker<string>(workerInstance, {
    type: "Setup",
  }).then((result) => {
    if (result !== "configured") {
      throw new Error("Failed to configure access grant worker");
    }
  });

  await workerReadyPromise;
  return workerInstance;
}

import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

async function unlockVaultWithPassphrase(
  projectId: string,
  passphrase: string,
): Promise<{ credentials: EdgeCredentials; accessGrant: string }> {
  const worker = await ensureAccessGrantWorker();
  const [globalConfig, salt] = await Promise.all([
    configService.getConfig(),
    projectService.getProjectSalt(projectId),
  ]);

  const gatewayUrl = globalConfig?.gatewayCredentialsRequestURL;
  const satelliteNodeURL =
    globalConfig?.satelliteNodeURL ||
    "12GL4EkBstUrvwonxsfBzUQ6PV7HSAsS5fSVVDuoiLdXsdgT7Uq@[::]:10000";

  let apiKeys: any[] = [];
  try {
    apiKeys = await accessGrantService.listAPIKeys(projectId);
  } catch (err) {
    console.warn("Failed to fetch existing API keys:", err);
  }

  const cleanName = (n: string) => (n || "").replace(/^["']|["']$/g, "").trim();

  // Generate a persistent unique ID for this browser session to prevent multi-browser/concurrency collisions
  const browserId = typeof window !== "undefined"
    ? (localStorage.getItem("vault_browser_id") || (() => {
        const newId = Math.random().toString(36).substring(2, 10);
        localStorage.setItem("vault_browser_id", newId);
        return newId;
      })())
    : "";

  const keyName = browserId ? `${FILE_BROWSER_AG_NAME}-${browserId}` : FILE_BROWSER_AG_NAME;

  const isFileBrowserKey = (name: string) => {
    const cleaned = cleanName(name);
    return (
      cleaned === keyName ||
      cleaned.startsWith(`${keyName} `)
    );
  };

  const isMatchedName = (name: string) => isFileBrowserKey(name);

  // 1. Check if there is an existing key in the list by name, prioritizing this browser's specific key name
  const existingKey = apiKeys.find((k: any) => isFileBrowserKey(k.name));

  let apiKey: { id: string; name: string; secret: string } | null = null;

  if (existingKey) {
    const cleanedName = cleanName(existingKey.name);
    // Try to get the cached secret by name (which is stable across recreate/id changes)
    const cachedSecret = typeof window !== "undefined" ? localStorage.getItem(`api_key_secret_${cleanedName}`) : null;
    if (cachedSecret) {
      apiKey = {
        id: existingKey.id,
        name: existingKey.name,
        secret: cachedSecret,
      };
    }
  }

  // 2. If we don't have the secret cached, we must create a new key
  if (!apiKey) {
    // Only delete keys that belong to this browser to avoid colliding with other active browsers/sessions
    const keysToDelete = apiKeys.filter((k: any) => isFileBrowserKey(k.name));
    for (const key of keysToDelete) {
      try {
        await accessGrantService.deleteByNameAndProjectId(
          key.name, // Use the exact name returned by backend list (including any quotes)
          projectId,
        );
      } catch (err) {
        console.warn(`Cleanup deletion failed for key ${key.name}:`, err);
      }
    }

    // Also send a fallback delete for the specific browser key to be safe
    try {
      await accessGrantService.deleteByNameAndProjectId(
        keyName,
        projectId,
      );
    } catch (err) {
      // Fallback ignore
    }

    // Create a new API key with the browser-unique keyName
    apiKey = await accessGrantService.createAccessGrant(
      projectId,
      keyName,
    );

    // Save its secret to localStorage by name for future stable reuse
    if (typeof window !== "undefined" && apiKey?.name && apiKey?.secret) {
      const cleanedName = cleanName(apiKey.name);
      localStorage.setItem(`api_key_secret_${cleanedName}`, apiKey.secret);
    }
  }

  if (!apiKey) {
    throw new Error("Failed to retrieve or create API key");
  }

  const inThreeDays = new Date();
  inThreeDays.setDate(inThreeDays.getDate() + 3);

  console.log("restrictedApiKey", apiKey);

  const permissionResult = await postToWorker<{ value?: string } | string>(
    worker,
    {
      type: "SetPermission",
      isDownload: true,
      isUpload: false,
      isList: true,
      isDelete: false,
      notAfter: inThreeDays.toISOString(),
      buckets: JSON.stringify(["gmail", "google-drive", "google-photos", "google-calendar", "google-contacts"]),
      apiKey: apiKey.secret,
    },
  );

  const restrictedApiKey =
    typeof permissionResult === "string"
      ? permissionResult
      : (permissionResult?.value ?? apiKey.secret);

  const accessGrantResult = await postToWorker<{ value?: string } | string>(
    worker,
    {
      type: "GenerateAccess",
      apiKey: restrictedApiKey,
      passphrase,
      salt,
      satelliteNodeURL,
    },
  );

  const accessGrant =
    typeof accessGrantResult === "string"
      ? accessGrantResult
      : (accessGrantResult?.value ?? "");

  if (!accessGrant) {
    throw new Error("Failed to generate vault access grant");
  }

  const credentials = await accessGrantService.getGatewayCredentials(
    accessGrant,
    gatewayUrl || "",
  );

  return { credentials, accessGrant };
}

export function useVaultBrowser() {
  const s3ClientRef = useRef<S3Client | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [listing, setListing] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unlock = useCallback(async (projectId: string, passphrase: string) => {
    setUnlocking(true);
    setError(null);
    try {
      const { credentials, accessGrant } = await unlockVaultWithPassphrase(
        projectId,
        passphrase,
      );
      s3ClientRef.current = createS3Client(credentials);
      setIsUnlocked(true);
      return { credentials, accessGrant };
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as any).response?.data?.error || (err as any).response?.data?.message || (err as any).message
          : err instanceof Error
          ? err.message
          : "Failed to unlock vault";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setUnlocking(false);
    }
  }, []);

  const getDownloadUrl = useCallback(
    async (bucket: string, key: string): Promise<string> => {
      if (!s3ClientRef.current) {
        throw new Error("Vault is locked. Enter your passphrase first.");
      }
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });
      return await getSignedUrl(s3ClientRef.current, command, { expiresIn: 3600 });
    },
    []
  );

  const listObjects = useCallback(
    async (bucket: string, prefix = ""): Promise<VaultBrowserObject[]> => {
      if (!s3ClientRef.current) {
        throw new Error("Vault is locked. Enter your passphrase first.");
      }
      setListing(true);
      setError(null);
      try {
        return await listVaultObjects(s3ClientRef.current, bucket, prefix);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to list vault objects";
        setError(message);
        throw err;
      } finally {
        setListing(false);
      }
    },
    [],
  );

  const lock = useCallback(() => {
    s3ClientRef.current = null;
    setIsUnlocked(false);
  }, []);

  return {
    unlock,
    listObjects,
    lock,
    getDownloadUrl,
    unlocking,
    listing,
    isUnlocked,
    error,
  };
}
