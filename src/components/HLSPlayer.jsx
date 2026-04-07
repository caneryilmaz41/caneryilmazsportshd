import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

const HLSPlayer = ({ src, onError }) => {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    const safePlay = () => {
      const p = video.play()
      if (p) p.catch(() => {})
    }

    // Safari native HLS
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
      video.addEventListener('canplay', safePlay, { once: true })
      return () => video.removeEventListener('canplay', safePlay)
    }

    if (!Hls.isSupported()) {
      onError?.(new Error('HLS not supported'))
      return
    }

    const hls = new Hls({
      enableWorker: false,
      lowLatencyMode: true,
      backBufferLength: 90
    })

    hlsRef.current = hls
    hls.loadSource(src)
    hls.attachMedia(video)

    hls.on(Hls.Events.MANIFEST_PARSED, safePlay)

    hls.on(Hls.Events.ERROR, (_e, data) => {
      if (!data.fatal) return
      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad()
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError()
      } else {
        onError?.(new Error(`HLS Fatal: ${data.details}`))
      }
    })

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [src, onError])

  return (
    <video
      ref={videoRef}
      className="w-full h-full bg-black"
      controls
      autoPlay
      playsInline
    />
  )
}

export default HLSPlayer
