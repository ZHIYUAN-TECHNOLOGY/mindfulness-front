export type { User } from "./schemas";

export interface Setting {
  key: string;
  value: unknown;
  updatedAt: string;
}

export interface MediaAsset {
  id: string;
  filename: string;
  r2Url: string;
  mimetype: string;
  sizeBytes: number;
  tags: string[];
  createdAt: string;
}
