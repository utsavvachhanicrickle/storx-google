"use client";

import React from "react";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { VaultBrowserObject } from "@/types/vault";

function formatBytes(bytes: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

interface VaultObjectBrowserProps {
  bucketName: string;
  prefix: string;
  objects: VaultBrowserObject[];
  loading?: boolean;
  onNavigatePrefix: (prefix: string) => void;
  onOpenFolder: (prefix: string) => void;
}

export default function VaultObjectBrowser({
  bucketName,
  prefix,
  objects,
  loading = false,
  onNavigatePrefix,
  onOpenFolder,
}: VaultObjectBrowserProps) {
  const crumbs = ["", ...prefix.split("/").filter(Boolean)];

  const buildPrefixForIndex = (index: number) => {
    if (index === 0) return "";
    return `${crumbs.slice(1, index + 1).join("/")}/`;
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-1 border-b border-(--border) px-4 py-3 text-xs font-bold text-(--text-muted)">
        <span className="text-(--text-primary)">{bucketName}</span>
        {crumbs.slice(1).map((part, index) => (
          <React.Fragment key={`${part}-${index}`}>
            <ChevronRightIcon sx={{ fontSize: 14 }} />
            <button
              onClick={() => onNavigatePrefix(buildPrefixForIndex(index + 1))}
              className="text-(--primary) hover:underline cursor-pointer"
            >
              {part}
            </button>
          </React.Fragment>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-40 items-center justify-center text-sm text-(--text-muted)">
            Loading vault items...
          </div>
        ) : objects.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-sm text-(--text-muted)">
            <span className="text-2xl mb-2">📂</span>
            No items in this folder
          </div>
        ) : (
          <div className="divide-y divide-(--border)">
            {objects.map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  if (item.type === "folder") onOpenFolder(item.key);
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-(--bg-secondary) ${
                  item.type === "folder" ? "cursor-pointer" : "cursor-default"
                }`}
              >
                {item.type === "folder" ? (
                  <FolderIcon sx={{ fontSize: 20 }} className="text-amber-500" />
                ) : (
                  <InsertDriveFileIcon
                    sx={{ fontSize: 20 }}
                    className="text-(--text-muted)"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-(--text-primary)">
                    {item.name}
                  </div>
                  {item.lastModified && (
                    <div className="text-xs text-(--text-muted)">
                      {item.lastModified.toLocaleString()}
                    </div>
                  )}
                </div>
                {item.type === "file" && (
                  <div className="text-xs font-bold text-(--text-muted)">
                    {formatBytes(item.size)}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
