'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface TextVideoMaskProps extends React.HTMLAttributes<HTMLDivElement> {
  videoSrc: string
  children: React.ReactNode
  textClassName?: string
}

export function TextVideoMask({
  videoSrc,
  children,
  className,
  textClassName,
  ...props
}: TextVideoMaskProps) {
  return (
    <div
      className={cn(
        'relative isolate w-full h-full overflow-hidden bg-black',
        className
      )}
      {...props}
    >
      {/* The Video Element */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* The Mask Layer — white reveals the video, black hides it */}
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center bg-black mix-blend-multiply',
          textClassName
        )}
      >
        {children}
      </div>
    </div>
  )
}
