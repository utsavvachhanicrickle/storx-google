export interface ReservedBucketUsage {
  bucketName: string;
  storage?: number;
  egress?: number;
  objectCount?: number;
  segmentCount?: number;
  projectID?: string;
  createdAt?: string;
  since?: string;
  before?: string;
}

export interface VaultBrowserObject {
  key: string;
  name: string;
  size: number;
  lastModified?: Date;
  type: "file" | "folder";
}

export interface EdgeCredentials {
  accessKeyId: string;
  secretKey: string;
  endpoint: string;
}

export interface SatelliteConfig {
  csrfToken: any;
  apiBaseURL: string;
  gatewayCredentialsRequestURL?: string;
  satelliteNodeURL?: string;
}
