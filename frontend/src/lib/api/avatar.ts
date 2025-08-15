import apiClient from './client';
import type { components } from '@/lib/types/api';

type AvatarUploadRequest = components["schemas"]["GenerateAvatarUploadUrlRequest"];
type AvatarUploadResponse = components["schemas"]["AvatarUploadResponse"];
type ConfirmAvatarUploadRequest = components["schemas"]["ConfirmAvatarUploadRequest"];
type UploadUrlResponse = components["schemas"]["UploadUrlResponse"];

export const getPresignedUrl = async (blob: Blob): Promise<UploadUrlResponse | undefined> => {
    const data: AvatarUploadRequest = {
        FileName: `avatar.${blob.type.split('/')[1]}`, // Generate a unique file name
        FileSize: blob.size,
        ContentType: blob.type,
    };
    const response = await apiClient.post('user/profile/avatar/upload-url', data);
    return response.data.Data as UploadUrlResponse ;
};

export const confirmAvatarUpload = async (r2Url: string, originalFileName?: string): Promise<AvatarUploadResponse> => {
    const data: ConfirmAvatarUploadRequest = {
        R2Url: r2Url,
        OriginalFileName: originalFileName,
    };
    const response = await apiClient.post('user/profile/avatar/confirm', data);
    return response.data;
};

