'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface AvatarItem {
  name: string
  imageUrl: string
  href?: string
}

export interface AvatarCirclesProps extends React.HTMLAttributes<HTMLDivElement> {
  avatars: AvatarItem[]
  numPeople?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  overlap?: number
  radius?: 'sm' | 'md' | 'lg' | 'full'
  bordered?: boolean
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

const radiusClasses = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  full: 'rounded-full',
}

export function AvatarCircles({
  avatars,
  numPeople,
  size = 'md',
  overlap = 16,
  radius = 'full',
  bordered = true,
  className,
  ...props
}: AvatarCirclesProps) {
  const showCounter = numPeople !== undefined && numPeople > 0

  return (
    <div className={cn('flex items-center', className)} {...props}>
      {avatars.map((avatar, index) => {
        const style = index === 0 ? {} : { marginLeft: `-${overlap}px` }
        const zIndex = 10 + index

        const avatarContent = (
          <div
            className={cn(
              'relative flex-shrink-0 flex items-center justify-center bg-dead-elevated text-dead-muted transition-all duration-200',
              sizeClasses[size],
              radiusClasses[radius],
              bordered && 'border-2 border-dead-surface',
              avatar.href && 'hover:z-50 hover:scale-110 hover:border-dead-red cursor-pointer'
            )}
            style={{ zIndex }}
          >
            <img
              src={avatar.imageUrl}
              alt={avatar.name}
              className={cn('w-full h-full object-cover', radiusClasses[radius])}
            />
          </div>
        )

        return (
          <React.Fragment key={avatar.name + index}>
            {avatar.href ? (
              <a href={avatar.href} title={avatar.name} style={style}>
                {avatarContent}
              </a>
            ) : (
              <div style={style} title={avatar.name}>
                {avatarContent}
              </div>
            )}
          </React.Fragment>
        )
      })}

      {showCounter && (
        <div
          className={cn(
            'relative flex-shrink-0 flex items-center justify-center bg-dead-red text-white font-medium transition-all duration-200',
            sizeClasses[size],
            radiusClasses[radius],
            bordered && 'border-2 border-dead-surface'
          )}
          style={{ marginLeft: `-${overlap}px`, zIndex: 10 + avatars.length }}
        >
          +{numPeople}
        </div>
      )}
    </div>
  )
}