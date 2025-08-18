import { atom } from 'jotai'
import { atomWithStorage, loadable } from 'jotai/utils'
import { userProfileAtom } from './profile'
import store from './store'
import { getFile, saveFile } from '@/lib/utils/OPFS'
import { fileToUsableBlobUrl, convertToWebP } from "@/lib/utils/imageUtils"

// ================== PERSISTENT AVATAR URL ATOM ==================

export const userAvatarUrlAtom = atomWithStorage<string | null>(
  'userAvatarUrl',
  null,
  undefined,
  { getOnInit: true }
)

// ================== AVATAR FILE SYSTEM ==================
// In-memory storage for WebP avatar files (buyer/seller separation)

interface AvatarFileState {
  buyer?: File | null
  seller?: File | null
}

// Memory-only atom for WebP files (not persisted to localStorage)
export const avatarFileAtom = atom<AvatarFileState>({
  buyer: null,
  seller: null
})

// Helper atom to update specific role's avatar
export const updateAvatarFileAtom = atom(
  null,
  (get, set, update: { role: 'buyer' | 'seller'; file: File | null }) => {
    const current = get(avatarFileAtom)
    set(avatarFileAtom, {
      ...current,
      [update.role]: update.file
    })

    console.log(`🖼️ Avatar file updated for ${update.role}:`, {
      hasFile: !!update.file,
      fileName: update.file?.name,
      fileSize: update.file ? `${(update.file.size / 1024).toFixed(1)}KB` : 'N/A'
    })
  }
)

// ================== REACTIVE AVATAR SYSTEM ==================
// Boolean toggle for avatar invalidation - prevents overflow and always triggers change
const avatarInvalidationAtom = atom(false)

// Action atom to trigger avatar re-evaluation
export const invalidateAvatarAtom = atom(
  null,
  (get, set) => {
    set(avatarInvalidationAtom, prev => !prev) // Toggle true↔false
    console.log('🔄 Avatar atom invalidated')
  }
)

// Base async atom for avatar processing
const baseUserProfileAvatarAtom = atom(async (get) => {
  const userProfile = get(userProfileAtom)
  const storagePicUrl = get(userAvatarUrlAtom)
  if (!userProfile?.data?.AvatarUrl) {
    return null
  }
  else {
    if (storagePicUrl && (userProfile?.data?.AvatarUrl === storagePicUrl)) {
      const file = await getFile("buyer-avatars", "avatar.webp")
      if (file.success && file.data) {
        return fileToUsableBlobUrl(file.data)
      }
    }
    const file = await convertToWebP(userProfile.data.AvatarUrl)
    if (file) {
      const result = await saveFile("buyer-avatars", "avatar.webp", file)
      if (result.success) {
        store.set(userAvatarUrlAtom, userProfile.data.AvatarUrl)
        return fileToUsableBlobUrl(file)
      }
    }
  }
  return null
})

const baseDraftUserProfileAvatarAtom = atom(async (get) => {
  get(avatarInvalidationAtom) // Subscribe to invalidation trigger - any change forces re-evaluation
  
  const file = await getFile("drafts-buyer-avatars", "avatar.webp")
  if (file.success && file.data) {
    console.log('📁 Draft avatar found in OPFS')
    return fileToUsableBlobUrl(file.data)
  }
  
  console.log('📁 No draft avatar, falling back to profile avatar')
  return null
})

// Loadable wrapper that provides loading/error states
export const userProfileAvatarAtom = loadable(baseUserProfileAvatarAtom)
export const userDraftProfileAvatarAtom = loadable(baseDraftUserProfileAvatarAtom)
export const isDraftNoAvatarAtom = atomWithStorage<boolean>('isDraftNoAvatar', 
  false, undefined, { getOnInit: true })