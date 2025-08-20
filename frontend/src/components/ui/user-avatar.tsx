import { cn } from '@/lib/utils/util'
import { User, RefreshCw, AlertCircle } from 'lucide-react'
import Image from 'next/image'

// Loadable state type from jotai/utils
type LoadableState<T> = 
  | { state: 'loading' }
  | { state: 'hasData'; data: T }
  | { state: 'hasError'; error: unknown }

interface UserAvatarProps {
  src?: string | null | LoadableState<string | null>
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallback?: string
  onClick?: () => void
  showLoadingState?: boolean
  showErrorFallback?: boolean
  onRetry?: () => void
}

const sizeClasses = {
  xs: 'w-6 h-6',      // 24px - navbar, mini contexts
  sm: 'w-10 h-10',    // 40px - comments, small cards
  md: 'w-16 h-16',    // 64px - user cards, order details
  lg: 'w-24 h-24',    // 96px - profile sections
  xl: 'w-32 h-32'     // 128px - profile edit, large displays
}

const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-5 h-5', 
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
}

export function UserAvatar({ 
  src, 
  alt = 'Avatar', 
  size = 'md', 
  className,
  fallback,
  onClick,
  showLoadingState = true,
  showErrorFallback = true,
  onRetry
}: UserAvatarProps) {
  const isClickable = !!onClick
  
  // Handle loadable state
  const getAvatarData = () => {
    // Check if src is a loadable state object
    if (src && typeof src === 'object' && 'state' in src) {
      return src
    }
    // If it's a string or null, wrap it as successful data
    return { state: 'hasData' as const, data: src }
  }
  
  const avatarState = getAvatarData()

  return (
    <div 
      className={cn(
        'relative rounded-full border border-gray-200 overflow-hidden bg-gray-100 flex-shrink-0',
        sizeClasses[size],
        isClickable && 'cursor-pointer hover:border-gray-300 transition-colors',
        className
      )}
      onClick={onClick}
    >
      {/* Loading State */}
      {avatarState.state === 'loading' && showLoadingState && (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <div className={cn(
            'animate-spin rounded-full border-2 border-gray-300 border-t-blue-500',
            size === 'xs' && 'w-3 h-3',
            size === 'sm' && 'w-4 h-4',
            size === 'md' && 'w-6 h-6',
            size === 'lg' && 'w-8 h-8',
            size === 'xl' && 'w-10 h-10'
          )} />
        </div>
      )}
      
      {/* Error State */}
      {avatarState.state === 'hasError' && showErrorFallback && (
        <div 
          className="w-full h-full flex items-center justify-center bg-red-50 group"
          onClick={(e) => {
            e.stopPropagation()
            onRetry?.()
          }}
        >
          {onRetry ? (
            <div className="flex flex-col items-center justify-center cursor-pointer">
              <RefreshCw className={cn(
                'text-red-400 group-hover:text-red-600 transition-colors',
                iconSizes[size]
              )} />
              {(size === 'lg' || size === 'xl') && (
                <span className="text-xs text-red-500 mt-1">Retry</span>
              )}
            </div>
          ) : (
            <AlertCircle className={cn('text-red-400', iconSizes[size])} />
          )}
        </div>
      )}
      
      {/* Success State with Image */}
      {avatarState.state === 'hasData' && (
        <>
          {avatarState.data ? (
            <Image
              src={avatarState.data}
              alt={alt}
              width={128}
              height={128}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Handle broken images by hiding the img element
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              {fallback ? (
                <span 
                  className={cn(
                    'font-medium text-gray-600 select-none',
                    size === 'xs' && 'text-xs',
                    size === 'sm' && 'text-sm', 
                    size === 'md' && 'text-base',
                    size === 'lg' && 'text-lg',
                    size === 'xl' && 'text-xl'
                  )}
                >
                  {fallback}
                </span>
              ) : (
                <User className={cn('text-gray-400', iconSizes[size])} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Utility function to generate initials from name
export function getInitials(name?: string): string {
  if (!name) return ''
  
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

// Pre-configured avatar components for common use cases
export function ProfileAvatar({ 
  user, 
  size = 'md', 
  className,
  onClick,
  showLoadingState,
  showErrorFallback,
  onRetry
}: { 
  user?: { name?: string; avatarUrl?: string | LoadableState<string | null> }
  size?: UserAvatarProps['size']
  className?: string
  onClick?: () => void
  showLoadingState?: boolean
  showErrorFallback?: boolean
  onRetry?: () => void
}) {
  return (
    <UserAvatar
      src={user?.avatarUrl}
      alt={user?.name ? `${user.name}'s avatar` : 'User avatar'}
      size={size}
      className={className}
      fallback={getInitials(user?.name)}
      onClick={onClick}
      showLoadingState={showLoadingState}
      showErrorFallback={showErrorFallback}
      onRetry={onRetry}
    />
  )
}

export function NavbarAvatar({ 
  user,
  onClick,
  onRetry
}: { 
  user?: { name?: string; avatarUrl?: string | LoadableState<string | null> }
  onClick?: () => void
  onRetry?: () => void
}) {
  return (
    <ProfileAvatar
      user={user}
      size="sm"
      className="ring-2 ring-white"
      onClick={onClick}
      showLoadingState={true}
      showErrorFallback={true}
      onRetry={onRetry}
    />
  )
}

export function OrderAvatar({ 
  user,
  onClick,
  onRetry
}: { 
  user?: { name?: string; avatarUrl?: string | LoadableState<string | null> }
  onClick?: () => void
  onRetry?: () => void
}) {
  return (
    <ProfileAvatar
      user={user}
      size="md"
      onClick={onClick}
      showLoadingState={true}
      showErrorFallback={true}
      onRetry={onRetry}
    />
  )
}