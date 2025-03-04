"use client"

import { useEffect, useRef, useState } from "react"

interface FullScreenVideoProps {
  src: string
  type?: string
  showControls?: boolean
  overlay?: boolean
}

export function FullScreenVideo({
  src,
  type = "video/mp4",
  showControls = true,
  overlay = false,
}: FullScreenVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const attemptPlay = async () => {
      try {
        await video.play()
        setIsPlaying(true)
      } catch (error) {
        console.error("Autoplay failed:", error)
        setIsPlaying(false)
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause()
      } else {
        attemptPlay()
      }
    }

    const handleFocus = () => {
      attemptPlay()
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)

    attemptPlay()

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
    }
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
      setIsPlaying(true)
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 min-w-full min-h-full w-auto h-auto object-cover"
        autoPlay
        playsInline
        loop
        controls={showControls}
      >
        <source src={src} type={type} />
        Your browser does not support the video tag.
      </video>
      {overlay && <div className="absolute inset-0 bg-black/30" />}
      {!isPlaying && (
        <button
          className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/50 text-white text-6xl"
          onClick={togglePlay}
        >
          ▶
        </button>
      )}
    </div>
  )
}

