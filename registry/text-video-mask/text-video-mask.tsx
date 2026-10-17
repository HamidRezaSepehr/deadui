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
  const maskId = React.useId()

  return (
    <div className={cn('relative w-full h-full overflow-hidden', className)} {...props}>
      {/* The Video Element */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          mask: `url(#${maskId})`,
          WebkitMask: `url(#${maskId})`,
        }}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* The SVG Mask Definition */}
      <svg className="absolute w-0 h-0">
        <defs>
          <mask id={maskId}>
            {/* White reveals the video, black hides it */}
            <rect width="100%" height="100%" fill="white" />
            <foreignObject width="100%" height="100%">
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                className={cn(
                  'w-full h-full flex items-center justify-center',
                  textClassName
                )}
              >
                {children}
              </div>
            </foreignObject>
          </mask>
        </defs>
      </svg>
    </div>
  )
}
