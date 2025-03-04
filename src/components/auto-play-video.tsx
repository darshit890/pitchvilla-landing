"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Volume2, VolumeX } from "lucide-react"

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
  const [isMobile, setIsMobile] = useState(false)
  const [isMuted, setIsMuted] = useState(true)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    // Initial check
    checkMobile()

    // Listen for resize events
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Always mute the video initially to improve autoplay chances
    video.muted = true
    setIsMuted(true)

    const attemptPlay = async () => {
      try {
        // Set playback attribute before attempting play
        video.setAttribute("playsinline", "")
        const playPromise = video.play()

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true)
              console.log("Autoplay successful")
            })
            .catch((error) => {
              console.error("Autoplay failed:", error)
              setIsPlaying(false)
              // If autoplay fails, we'll show the play button
            })
        }
      } catch (error) {
        console.error("Autoplay error:", error)
        setIsPlaying(false)
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        video.pause()
        setIsPlaying(false)
      } else if (!video.paused) {
        setIsPlaying(true)
      } else {
        // Only attempt to play if user has already interacted
        if (isPlaying) {
          attemptPlay()
        }
      }
    }

    const handleFocus = () => {
      // Only attempt to play if user has already interacted
      if (isPlaying) {
        attemptPlay()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleFocus)

    // Add user interaction listeners to enable autoplay after interaction
    const enableAutoplayOnInteraction = () => {
      if (!isPlaying) {
        attemptPlay()
      }

      // Remove the listeners after first interaction
      document.removeEventListener("click", enableAutoplayOnInteraction)
      document.removeEventListener("touchstart", enableAutoplayOnInteraction)
      document.removeEventListener("keydown", enableAutoplayOnInteraction)
    }

    document.addEventListener("click", enableAutoplayOnInteraction)
    document.addEventListener("touchstart", enableAutoplayOnInteraction)
    document.addEventListener("keydown", enableAutoplayOnInteraction)

    // Initial play attempt
    attemptPlay()

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleFocus)
      document.removeEventListener("click", enableAutoplayOnInteraction)
      document.removeEventListener("touchstart", enableAutoplayOnInteraction)
      document.removeEventListener("keydown", enableAutoplayOnInteraction)
    }
  }, [isPlaying])

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

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 min-w-full min-h-full w-auto h-auto object-cover"
        autoPlay
        playsInline
        muted
        loop
        controls={showControls && !isMobile} // Hide native controls on mobile
      >
        <source src={src} type={type} />
        Your browser does not support the video tag.
      </video>

      {overlay && <div className="absolute inset-0 bg-black/30" />}

      {!isPlaying && (
        <button
          aria-label="Play video"
          className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/50 text-white transition-all duration-300 hover:bg-black/40 focus:outline-none focus:ring-2 focus:ring-white/50"
          onClick={togglePlay}
        >
          <span className="sr-only">Play video</span>
          <div className="rounded-full bg-white/20 p-3 sm:p-4 md:p-5 backdrop-blur-sm transition-transform duration-300 hover:scale-110 active:scale-95">
            <Play className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12 text-white" />
          </div>
        </button>
      )}

      {isPlaying && (
        <div className="absolute bottom-4 right-4 z-10 flex space-x-2">
          {isMobile && (
            <button
              aria-label={isPlaying ? "Pause video" : "Play video"}
              className="bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition-all"
              onClick={togglePlay}
            >
              <span className="sr-only">{isPlaying ? "Pause video" : "Play video"}</span>
              {isPlaying ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                >
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <Play className="h-6 w-6" />
              )}
            </button>
          )}
          <button
            aria-label={isMuted ? "Unmute video" : "Mute video"}
            className="bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition-all"
            onClick={toggleMute}
          >
            <span className="sr-only">{isMuted ? "Unmute video" : "Mute video"}</span>
            {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          </button>
        </div>
      )}

      {/* Mobile orientation message */}
      <div className="fixed inset-0 bg-black/90 text-white flex-col items-center justify-center text-center p-4 z-50 hidden landscape:flex md:landscape:hidden">
        <p className="text-lg mb-2">For the best experience</p>
        <p className="text-xl font-bold">Please rotate your device to portrait mode</p>
      </div>
    </div>
  )
}

