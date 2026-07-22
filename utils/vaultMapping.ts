/** Maps Google auto-sync job `method` to reserved CyberLs S3 vault bucket name. */
export const JOB_METHOD_TO_VAULT_BUCKET: Record<string, string> = {
  gmail: "gmail",
  google_drive: "google-drive",
  drive: "google-drive",
  google_photos: "google-photos",
  photos: "google-photos",
  google_calendar: "google-calendar",
  calendar: "google-calendar",
  google_contacts: "google-contacts",
  contacts: "google-contacts",
};

export function getVaultBucketForMethod(method?: string): string | null {
  if (!method) return null;
  const normalized = method.toLowerCase().trim();
  return JOB_METHOD_TO_VAULT_BUCKET[normalized] ?? null;
}

export function getVaultBucketForServiceId(serviceId?: string): string | null {
  if (!serviceId) return null;
  const map: Record<string, string> = {
    gmail: "gmail",
    drive: "google-drive",
    photos: "google-photos",
    calendar: "google-calendar",
    contacts: "google-contacts",
  };
  return map[serviceId] ?? null;
}
