// OPFS Web Worker for SyncAccessHandle operations
// This worker handles synchronous file operations to prevent main thread blocking

// Type declarations for OPFS SyncAccessHandle API
interface FileSystemSyncAccessHandle {
  read(buffer: ArrayBuffer, options?: { at: number }): number;
  write(buffer: ArrayBuffer, options?: { at: number }): number;
  getSize(): number;
  truncate(size: number): void;
  flush(): void;
  close(): void;
}

// Extend FileSystemFileHandle to include SyncAccessHandle method
interface ExtendedFileSystemFileHandle extends FileSystemFileHandle {
  createSyncAccessHandle(): Promise<FileSystemSyncAccessHandle>;
}

// Error parsing utility (duplicate from main thread for worker isolation)
const parseOPFSError = (error: any, operation: string) => {
  if (error.name === 'NotFoundError') {
    return {
      type: 'NOT_FOUND',
      message: `File or directory not found during ${operation}`,
      originalError: { name: error.name, message: error.message }
    };
  }
  
  if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
    return {
      type: 'ACCESS_DENIED',
      message: `Permission denied during ${operation}`,
      originalError: { name: error.name, message: error.message }
    };
  }
  
  if (error.name === 'QuotaExceededError') {
    return {
      type: 'QUOTA_EXCEEDED',
      message: `Storage quota exceeded during ${operation}`,
      originalError: { name: error.name, message: error.message }
    };
  }
  
  return {
    type: 'UNKNOWN',
    message: `Unknown error during ${operation}: ${error.message}`,
    originalError: { name: error.name, message: error.message }
  };
};

// Initialize OPFS root
let opfsRoot: FileSystemDirectoryHandle | null = null;

const initializeOPFS = async (): Promise<FileSystemDirectoryHandle> => {
  if (!opfsRoot) {
    opfsRoot = await navigator.storage.getDirectory();
  }
  return opfsRoot;
};

// Message handler for all OPFS operations
self.onmessage = async (e) => {
  const message = e.data;
  
  try {
    await initializeOPFS();
    
    switch (message.type) {
      case 'GET_FILE':
        await handleGetFile(message);
        break;
        
      case 'SAVE_FILE':
        await handleSaveFile(message);
        break;
        
      case 'DELETE_FILE':
        await handleDeleteFile(message);
        break;
        
      default:
        self.postMessage({
          id: message.id,
          success: false,
          error: {
            type: 'UNKNOWN',
            message: `Unknown operation type: ${message.type}`
          }
        });
    }
  } catch (error) {
    self.postMessage({
      id: message.id,
      success: false,
      error: parseOPFSError(error, message.type)
    });
  }
};

// Handle GET_FILE operations with SyncAccessHandle
const handleGetFile = async (message: any) => {
  try {
    const dir = await opfsRoot!.getDirectoryHandle(message.dirName);
    const fileHandle = await dir.getFileHandle(message.fileName) as ExtendedFileSystemFileHandle;
    
    // Use SyncAccessHandle for better performance
    const accessHandle = await fileHandle.createSyncAccessHandle();
    
    try {
      const size = accessHandle.getSize();
      const buffer = new ArrayBuffer(size);
      const bytesRead = accessHandle.read(buffer, { at: 0 });
      
      self.postMessage({
        id: message.id,
        success: true,
        data: buffer.slice(0, bytesRead) // Ensure exact size
      });
    } finally {
      // Always close the access handle
      accessHandle.close();
    }
  } catch (error: any) {
    if (error.name === 'NotFoundError') {
      // File not found is normal - return null
      self.postMessage({
        id: message.id,
        success: true,
        data: null
      });
    } else {
      throw error;
    }
  }
};

// Handle SAVE_FILE operations with SyncAccessHandle
const handleSaveFile = async (message: any) => {
  const dir = await opfsRoot!.getDirectoryHandle(message.dirName, { create: true });
  const fileHandle = await dir.getFileHandle(message.fileName, { create: true }) as ExtendedFileSystemFileHandle;
  
  // Use SyncAccessHandle for better performance
  const accessHandle = await fileHandle.createSyncAccessHandle();
  
  try {
    // Clear existing content and write new data
    accessHandle.truncate(0);
    const bytesWritten = accessHandle.write(message.fileData, { at: 0 });
    
    // Ensure data is persisted to disk
    accessHandle.flush();
    
    self.postMessage({
      id: message.id,
      success: true,
      data: undefined
    });
  } finally {
    // Always close the access handle
    accessHandle.close();
  }
};

// Handle DELETE_FILE operations
const handleDeleteFile = async (message: any) => {
  const dir = await opfsRoot!.getDirectoryHandle(message.dirName);
  await dir.removeEntry(message.fileName);
  
  self.postMessage({
    id: message.id,
    success: true,
    data: undefined
  });
};

// Handle worker errors
self.onerror = (error) => {
  console.error('OPFS Worker error:', error);
};

self.onunhandledrejection = (event) => {
  console.error('OPFS Worker unhandled rejection:', event.reason);
};