// Feature detection worker for OPFS SyncAccessHandle capability
// This worker checks if SyncAccessHandle is available in the current environment

self.onmessage = () => {
  // Check if SyncAccessHandle is available on FileSystemFileHandle prototype
  const hasSyncAccessHandle = 'createSyncAccessHandle' in FileSystemFileHandle.prototype;
  self.postMessage(hasSyncAccessHandle);
};