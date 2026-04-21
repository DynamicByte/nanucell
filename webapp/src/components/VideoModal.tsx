'use client'

import { useState, useEffect, useRef } from 'react'

export default function VideoModal() {
  const [isOpen, setIsOpen] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const hasSeenVideo = localStorage.getItem('nanucell_video_seen')
    if (!hasSeenVideo) {
      setIsOpen(true)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    localStorage.setItem('nanucell_video_seen', 'true')
    if (videoRef.current) {
      videoRef.current.pause()
    }
  }

  const handleChatClick = () => {
    handleClose()
    const chatSection = document.getElementById('clinical-concierge')
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="aspect-video bg-black">
          <video
            ref={videoRef}
            src="/Doc_CJ.mp4"
            controls
            autoPlay
            muted
            playsInline
            className="w-full h-full object-contain"
          />
        </div>

        <div className="p-6 text-center">
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Meet Dr. CJ, Your AI Health Guide
          </h3>
          <p className="text-slate-600 mb-4">
            Get personalized health recommendations and answers to your questions 24/7.
          </p>
          <button
            onClick={handleChatClick}
            className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
          >
            Start Chatting with Dr. CJ
          </button>
        </div>
      </div>
    </div>
  )
}
