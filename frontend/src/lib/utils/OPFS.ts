// Shared types for OPFS operations
export type OPFSError = {
  type: 'UNSUPPORTED' | 'NOT_FOUND' | 'ACCESS_DENIED' | 'QUOTA_EXCEEDED' | 'UNKNOWN';
  message: string;
  originalError?: Error;
};

export type OPFSResult<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: OPFSError;
};

// Worker message types
type WorkerMessage = 
  | { type: 'GET_FILE'; dirName: string; fileName: string; id: string }
  | { type: 'SAVE_FILE'; dirName: string; fileName: string; fileData: ArrayBuffer; id: string }
  | { type: 'DELETE_FILE'; dirName: string; fileName: string; id: string };

type WorkerResponse = {
  id: string;
  success: boolean;
  data?: ArrayBuffer | null;
  error?: OPFSError;
};

// Feature detection
const getOPFSCapability = async (): Promise<'SYNC_WORKER' | 'ASYNC_ONLY' | 'UNSUPPORTED'> => {
  // Step 1: basic OPFS support check
  if (!('storage' in navigator) || typeof (navigator.storage as { getDirectory?: unknown }).getDirectory !== 'function') {
    return 'UNSUPPORTED';
  }

  // Step 2: check SyncAccessHandle in a worker
  return new Promise(resolve => {
    const worker = new Worker(new URL('../../workers/feature-detection-worker.ts', import.meta.url));
    worker.onmessage = e => {
      resolve(e.data ? 'SYNC_WORKER' : 'ASYNC_ONLY');
      worker.terminate();
    };
    worker.postMessage(null); // Trigger the feature detection
  });
};

// UUID generation with fallback for older browsers
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Shared error parsing utility
const parseOPFSError = (error: unknown, operation: string): OPFSError => {
  const errorObj = error as { name?: string; message?: string };
  
  if (errorObj?.name === 'NotFoundError') {
    return {
      type: 'NOT_FOUND',
      message: `File or directory not found during ${operation}`,
      originalError: error as Error
    };
  }
  
  if (errorObj?.name === 'NotAllowedError' || errorObj?.name === 'SecurityError') {
    return {
      type: 'ACCESS_DENIED',
      message: `Permission denied during ${operation}`,
      originalError: error as Error
    };
  }
  
  if (errorObj?.name === 'QuotaExceededError') {
    return {
      type: 'QUOTA_EXCEEDED',
      message: `Storage quota exceeded during ${operation}`,
      originalError: error as Error
    };
  }
  
  return {
    type: 'UNKNOWN',
    message: `Unknown error during ${operation}: ${errorObj?.message || 'Unknown error'}`,
    originalError: error as Error
  };
};

// Shared async error handling wrapper
const withOPFSErrorHandling = async <T>(
  operation: string,
  fn: () => Promise<T>
): Promise<OPFSResult<T>> => {
  try {
    const result = await fn();
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: parseOPFSError(error, operation)
    };
  }
};

// Worker instance management
let worker: Worker | null = null;
const pendingRequests = new Map<string, (response: WorkerResponse) => void>();

const getWorker = (): Worker => {
  if (!worker) {
    worker = new Worker(new URL('../../workers/opfs-worker.ts', import.meta.url));
    worker.onmessage = (e) => {
      const response: WorkerResponse = e.data;
      const resolver = pendingRequests.get(response.id);
      if (resolver) {
        resolver(response);
        pendingRequests.delete(response.id);
      }
    };
    worker.onerror = (error) => {
      console.error('OPFS Worker error:', error);
      // Reject all pending requests
      pendingRequests.forEach((resolver, id) => {
        resolver({
          id,
          success: false,
          error: {
            type: 'UNKNOWN',
            message: 'Worker error occurred'
          }
        });
      });
      pendingRequests.clear();
    };
  }
  return worker;
};

// Tier 1: Web Worker + SyncAccessHandle implementation
const getFileWorkerSync = async (dirName: string, fileName: string): Promise<OPFSResult<File | null>> => {
  return new Promise((resolve) => {
    const id = generateUUID();
    const worker = getWorker();
    
    pendingRequests.set(id, (response) => {
      if (!response.success) {
        resolve({ success: false, error: response.error! });
        return;
      }
      
      if (response.data === null) {
        resolve({ success: true, data: null });
        return;
      }
      
      // Convert ArrayBuffer back to File
      const file = new File([response.data!], fileName, { type: 'image/jpeg' });
      resolve({ success: true, data: file });
    });
    
    worker.postMessage({
      type: 'GET_FILE',
      dirName,
      fileName,
      id
    } as WorkerMessage);
  });
};

const saveFileWorkerSync = async (dirName: string, fileName: string, file: File): Promise<OPFSResult<void>> => {
  return new Promise(async (resolve) => {
    const id = generateUUID();
    const worker = getWorker();
    
    pendingRequests.set(id, (response) => {
      if (!response.success) {
        resolve({ success: false, error: response.error! });
      } else {
        resolve({ success: true, data: undefined });
      }
    });
    
    // Convert File to ArrayBuffer for worker
    const fileData = await file.arrayBuffer();
    
    worker.postMessage({
      type: 'SAVE_FILE',
      dirName,
      fileName,
      fileData,
      id
    } as WorkerMessage);
  });
};

const deleteFileWorkerSync = async (dirName: string, fileName: string): Promise<OPFSResult<void>> => {
  return new Promise((resolve) => {
    const id = generateUUID();
    const worker = getWorker();
    
    pendingRequests.set(id, (response) => {
      if (!response.success) {
        resolve({ success: false, error: response.error! });
      } else {
        resolve({ success: true, data: undefined });
      }
    });
    
    worker.postMessage({
      type: 'DELETE_FILE',
      dirName,
      fileName,
      id
    } as WorkerMessage);
  });
};

// Tier 2: Async OPFS fallback implementation
const getFileAsync = async (dirName: string, fileName: string): Promise<OPFSResult<File | null>> => {
  return withOPFSErrorHandling('getFile', async () => {
    const opfsRoot = await navigator.storage.getDirectory();
    try {
      const dir = await opfsRoot.getDirectoryHandle(dirName);
      const fileHandle = await dir.getFileHandle(fileName);
      return await fileHandle.getFile();
    } catch (error: unknown) {
      const errorObj = error as { name?: string };
      if (errorObj?.name === 'NotFoundError') return null;
      throw error;
    }
  });
};

const saveFileAsync = async (dirName: string, fileName: string, file: File): Promise<OPFSResult<void>> => {
  return withOPFSErrorHandling('saveFile', async () => {
    const opfsRoot = await navigator.storage.getDirectory();
    const dir = await opfsRoot.getDirectoryHandle(dirName, { create: true });
    const fileHandle = await dir.getFileHandle(fileName, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(file);
    await writable.close();
  });
};

const deleteFileAsync = async (dirName: string, fileName: string): Promise<OPFSResult<void>> => {
  return withOPFSErrorHandling('deleteFile', async () => {
    const opfsRoot = await navigator.storage.getDirectory();
    const dir = await opfsRoot.getDirectoryHandle(dirName);
    await dir.removeEntry(fileName);
  });
};

// Main API functions with intelligent tier selection
export const getFile = async (dirName: string, fileName: string): Promise<OPFSResult<File | null>> => {
  const capability = await getOPFSCapability();
  
  switch (capability) {
    case 'SYNC_WORKER':
      return getFileWorkerSync(dirName, fileName);
      
    case 'ASYNC_ONLY':
      return getFileAsync(dirName, fileName);
      
    case 'UNSUPPORTED':
      return {
        success: false,
        error: {
          type: 'UNSUPPORTED',
          message: 'OPFS not supported in this browser'
        }
      };
  }
};

export const saveFile = async (dirName: string, fileName: string, file: File): Promise<OPFSResult<void>> => {
  const capability = await getOPFSCapability();
  console.log(`OPFS capability: ${capability}`);
  switch (capability) {
    case 'SYNC_WORKER':
      return saveFileWorkerSync(dirName, fileName, file);
      
    case 'ASYNC_ONLY':
      return saveFileAsync(dirName, fileName, file);
      
    case 'UNSUPPORTED':
      return {
        success: false,
        error: {
          type: 'UNSUPPORTED',
          message: 'OPFS not supported in this browser'
        }
      };
  }
};

export const deleteFile = async (dirName: string, fileName: string): Promise<OPFSResult<void>> => {
  const capability = await getOPFSCapability();

  switch (capability) {
    case 'SYNC_WORKER':
      return deleteFileWorkerSync(dirName, fileName);
      
    case 'ASYNC_ONLY':
      return deleteFileAsync(dirName, fileName);
      
    case 'UNSUPPORTED':
      return {
        success: false,
        error: {
          type: 'UNSUPPORTED',
          message: 'OPFS not supported in this browser'
        }
      };
  }
};