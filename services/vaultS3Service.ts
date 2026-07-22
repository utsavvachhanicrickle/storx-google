import {
  ListObjectsV2Command,
  S3Client,
  type S3ClientConfig,
} from "@aws-sdk/client-s3";
import { SignatureV4 } from "@smithy/signature-v4";
import type { EdgeCredentials, VaultBrowserObject } from "@/types/vault";

export function createS3Client(credentials: EdgeCredentials): S3Client {
  const config: S3ClientConfig = {
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretKey,
    },
    endpoint: credentials.endpoint,
    forcePathStyle: true,
    region: "us-east-1",
  };

  (config as S3ClientConfig & { signerConstructor?: typeof SignatureV4 }).signerConstructor =
    SignatureV4;

  return new S3Client(config);
}

function parseObjectKey(key: string, prefix: string): VaultBrowserObject {
  const relative = prefix ? key.slice(prefix.length) : key;
  const name = relative.replace(/\/$/, "").split("/").pop() || relative;
  const isFolder = key.endsWith("/") || relative.includes("/");
  return {
    key,
    name,
    size: 0,
    type: isFolder && key.endsWith("/") ? "folder" : "file",
  };
}

export async function listVaultObjects(
  client: S3Client,
  bucket: string,
  prefix = "",
): Promise<VaultBrowserObject[]> {
  try {
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Delimiter: "/",
        Prefix: prefix,
        MaxKeys: 500,
      }),
    );

    const folders: VaultBrowserObject[] = (response.CommonPrefixes ?? []).map(
      (entry) => ({
        key: entry.Prefix ?? "",
        name: (entry.Prefix ?? "").replace(/\/$/, "").split("/").pop() || entry.Prefix || "",
        size: 0,
        type: "folder" as const,
      }),
    );

    const files: VaultBrowserObject[] = (response.Contents ?? [])
      .filter((item) => item.Key && item.Key !== prefix)
      .map((item) => ({
        key: item.Key ?? "",
        name: parseObjectKey(item.Key ?? "", prefix).name,
        size: item.Size ?? 0,
        lastModified: item.LastModified,
        type: "file" as const,
      }));

    return [...folders, ...files].sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  } catch (err: any) {
    if (
      err.name === "NoSuchBucket" ||
      err.Code === "NoSuchBucket" ||
      err.message?.includes("NoSuchBucket") ||
      err.$metadata?.httpStatusCode === 404
    ) {
      return [];
    }
    throw err;
  }
}
