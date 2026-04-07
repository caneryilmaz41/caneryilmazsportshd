import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

const HLSPlayer = ({ src, onError, onFatalError }) => {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const retryCount = useRef(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    retryCount.current = 0

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
      onFatalError?.()
      return
    }

    const hls = new Hls({
      enableWorker: false,
      lowLatencyMode: true,
      backBufferLength: 90,
      maxBufferLength: 30,
      fragLoadingMaxRetry: 3,
      manifestLoadingMaxRetry: 3,
      levelLoadingMaxRetry: 3,
      // Segment'lerin yanlış content-type (image/jpg) döndürmesini düzelt
      xhrSetup: (xhr) => {
        xhr.overrideMimeType('application/octet-stream')
      }
    })

    hlsRef.current = hls
    hls.loadSource(src)
    hls.attachMedia(video)

    hls.on(Hls.Events.MANIFEST_PARSED, safePlay)

    hls.on(Hls.Events.ERROR, (_e, data) => {
      if (!data.fatal) return

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR && retryCount.current < 2) {
        retryCount.current++
        setTimeout(() => hls.startLoad(), 1000)
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR && retryCount.current < 2) {
        retryCount.current++
        hls.recoverMediaError()
      } else {
        onFatalError?.()
      }
    })

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [src, onError, onFatalError])

  return (
    <video
      ref={videoRef}
      className="w-full h-full bg-black"
      controls
      autoPlay
      muted
      playsInline
    />
  )
}

export default HLSPlayer
