import { useState, useEffect, useRef, useCallback } from 'react'

export default function ImageLightboxModal({
  isOpen,
  images = [],
  currentIndex = 0,
  onClose,
  onNavigate,
  title = 'Image Preview',
}) {
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const initialPosRef = useRef({ x: 0, y: 0 })
  const imageContainerRef = useRef(null)


  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  const handleZoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.5, 4))
  }, [])

  const handleZoomOut = useCallback(() => {
    setScale((prev) => {
      const next = Math.max(prev - 0.5, 1)
      if (next === 1) setPosition({ x: 0, y: 0 })
      return next
    })
  }, [])

  const handleResetZoom = useCallback(() => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const handlePrev = useCallback(() => {
    if (images.length <= 1) return
    const prevIdx = (currentIndex - 1 + images.length) % images.length
    onNavigate?.(prevIdx)
  }, [currentIndex, images.length, onNavigate])

  const handleNext = useCallback(() => {
    if (images.length <= 1) return
    const nextIdx = (currentIndex + 1) % images.length
    onNavigate?.(nextIdx)
  }, [currentIndex, images.length, onNavigate])

  // Keyboard navigation & shortcuts
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn()
      } else if (e.key === '-') {
        handleZoomOut()
      } else if (e.key === '0') {
        handleResetZoom()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, handlePrev, handleNext, handleZoomIn, handleZoomOut, handleResetZoom])

  // Mouse wheel zoom
  const handleWheel = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(prev + 0.3, 4))
    } else {
      setScale((prev) => {
        const next = Math.max(prev - 0.3, 1)
        if (next === 1) setPosition({ x: 0, y: 0 })
        return next
      })
    }
  }

  // Double click / tap toggle zoom
  const handleDoubleClick = (e) => {
    e.stopPropagation()
    if (scale > 1) {
      setScale(1)
      setPosition({ x: 0, y: 0 })
    } else {
      setScale(2)
    }
  }

  // Pointer / Drag to Pan handlers
  const handlePointerDown = (e) => {
    if (scale <= 1) return
    e.preventDefault()
    setIsDragging(true)
    dragStartRef.current = { x: e.clientX, y: e.clientY }
    initialPosRef.current = { ...position }
  }

  const handlePointerMove = (e) => {
    if (!isDragging || scale <= 1) return
    e.preventDefault()
    const dx = e.clientX - dragStartRef.current.x
    const dy = e.clientY - dragStartRef.current.y
    setPosition({
      x: initialPosRef.current.x + dx,
      y: initialPosRef.current.y + dy,
    })
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  if (!isOpen || images.length === 0) return null

  const currentImage = images[currentIndex]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image preview gallery"
      className="fixed inset-0 z-[250] bg-black/92 backdrop-blur-md flex flex-col justify-between select-none overflow-hidden animate-fadeIn"
      onClick={() => {
        // Close when clicking directly on backdrop
        if (!isDragging) onClose?.()
      }}
    >
      {/* Top Bar: Title, Counter & Close Button */}
      <div
        className="w-full flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 text-white z-20 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-3">
          <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-zinc-300">
            {title}
          </span>
          {images.length > 1 && (
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-zinc-300 font-mono text-xs">
              {currentIndex + 1} / {images.length}
            </span>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all duration-200 cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Main Image Stage */}
      <div
        ref={imageContainerRef}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden touch-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Image Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handlePrev()
            }}
            aria-label="Previous image"
            className="absolute left-3 sm:left-6 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/40 hover:bg-white/20 active:scale-95 text-white border border-white/10 flex items-center justify-center transition-all duration-200 cursor-pointer"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* The Displayed Image with Pan & Zoom Transform */}
        <div
          onDoubleClick={handleDoubleClick}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
          }}
          className={`relative max-w-[90vw] max-h-[78vh] flex items-center justify-center will-change-transform ${
            scale > 1
              ? isDragging
                ? 'cursor-grabbing'
                : 'cursor-grab'
              : 'cursor-zoom-in'
          }`}
        >
          <img
            src={currentImage}
            alt={`${title} detail full preview`}
            draggable={false}
            className="w-auto h-auto max-w-[88vw] max-h-[76vh] object-contain rounded-lg shadow-2xl pointer-events-none select-none"
          />
        </div>

        {/* Next Image Button */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleNext()
            }}
            aria-label="Next image"
            className="absolute right-3 sm:right-6 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/40 hover:bg-white/20 active:scale-95 text-white border border-white/10 flex items-center justify-center transition-all duration-200 cursor-pointer"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <div
        className="w-full flex items-center justify-center px-4 py-4 sm:py-6 z-20 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-2 sm:space-x-3 bg-zinc-900/90 border border-white/10 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-2xl backdrop-blur-md">
          {/* Zoom Out Button */}
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 1}
            aria-label="Zoom out"
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-all"
            title="Zoom out (-)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          {/* Zoom Percentage Label / Reset Button */}
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-3 py-1 text-xs font-mono font-medium rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Reset Zoom (0)"
          >
            {Math.round(scale * 100)}%
          </button>

          {/* Zoom In Button */}
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 4}
            aria-label="Zoom in"
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed transition-all"
            title="Zoom in (+)"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          <div className="h-4 w-px bg-white/20 mx-1 hidden sm:block" />

          {/* Interactive Hint */}
          <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline px-1">
            Scroll to zoom • Drag to pan
          </span>
        </div>
      </div>
    </div>
  )
}
