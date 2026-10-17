'use client'

import { TextVideoMask } from '@/registry/text-video-mask/text-video-mask'

export default function TextVideoMaskTestPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-16 space-y-20">
        <div>
          <h1 className="text-white text-4xl font-bold mb-8">Text Video Mask Examples</h1>
        </div>

        {/* Example 1: Basic Bold Text */}
        <div className="h-[400px] w-full">
          <TextVideoMask
            videoSrc="https://videos.pexels.com/video-files/1093662/1093662-hd_1280_720_30fps.mp4"
            textClassName="text-black text-6xl md:text-8xl font-black uppercase"
          >
            <span>Nature</span>
          </TextVideoMask>
        </div>

        {/* Example 2: Outlined/Transparent Text */}
        <div className="h-[400px] w-full">
          <TextVideoMask
            videoSrc="https://videos.pexels.com/video-files/3130284/3130284-hd_1280_720_25fps.mp4"
            textClassName="text-transparent text-6xl md:text-9xl font-black uppercase"
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 800 400"
              className="absolute inset-0"
              xmlns="http://www.w3.org/2000/svg"
            >
              <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                className="fill-transparent stroke-white stroke-[8px]"
                style={{ fontSize: '120px', fontWeight: 900 }}
              >
                Ocean
              </text>
            </svg>
          </TextVideoMask>
        </div>

        {/* Example 3: Multi-line/Complex HTML */}
        <div className="h-[500px] w-full">
          <TextVideoMask
            videoSrc="https://videos.pexels.com/video-files/3045163/3045163-hd_1920_1080_25fps.mp4"
            textClassName="w-full h-full"
          >
            <div className="text-center text-white">
              <h2 className="text-5xl md:text-7xl font-bold mb-4">Premium</h2>
              <p className="text-xl md:text-3xl font-light">Visual Experience</p>
            </div>
          </TextVideoMask>
        </div>

        {/* Example 4: Another Style */}
        <div className="h-[400px] w-full">
          <TextVideoMask
            videoSrc="https://videos.pexels.com/video-files/1998560/1998560-hd_1280_720_24fps.mp4"
            textClassName="text-white text-6xl md:text-8xl font-extrabold tracking-wider"
          >
            <span className="drop-shadow-lg">ABSTRACT</span>
          </TextVideoMask>
        </div>
      </div>
    </div>
  )
}
