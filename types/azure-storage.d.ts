export interface BlobStorageRequest {
  storageUri: string;
  storageAccessToken: string;
}

export interface BlobContainerRequest extends BlobStorageRequest {
  containerName: string;
}

export interface BlobFileRequest extends BlobContainerRequest {
  blobName: string;
}
