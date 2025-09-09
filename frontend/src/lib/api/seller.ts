import apiClient from './client';
import type { components } from '@/lib/types/api';

type AvatarUploadRequest = components["schemas"]["GenerateAvatarUploadUrlRequest"];
type UploadUrlResponse = components["schemas"]["UploadUrlResponse"];
type SellerProfileDto = components["schemas"]["SellerProfileDto"];
type CreateSellerProfileRequest = components["schemas"]["CreateSellerProfileRequest"];
type SellerDashboardDto = components['schemas']['SellerDashboardDto'];

export const getPresignedUrl = async (blob: Blob): Promise<UploadUrlResponse | undefined> => {
    const data: AvatarUploadRequest = {
        FileName: `avatar.${blob.type.split('/')[1]}`, // Generate a unique file name
        FileSize: blob.size,
        ContentType: blob.type,
    };
    console.log('Requesting presigned URL with data:', data);
    const response = await apiClient.post('sellers/profile/avatar/upload-url', data);
    console.log(response)
    return response.data.Data as UploadUrlResponse ;
};

export const createSellerProfile = async (data: CreateSellerProfileRequest): Promise<SellerProfileDto | undefined> => {
    const response = await apiClient.post('sellers/profile', data);
    return response.data.Data as SellerProfileDto;
};

/**
 * Get seller dashboard data
 * @returns Promise resolving to seller dashboard data
 * @throws Will throw axios error if request fails
 */
export async function getSellerDashboard(): Promise<SellerDashboardDto> {
    const response = await apiClient.get('/sellers/dashboard');
    console.log('Fetched seller dashboard data:', response.data['Data']);
    return response.data.Data as SellerDashboardDto;
}
