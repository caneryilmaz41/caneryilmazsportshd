import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

const HLSPlayer = ({ src, onFatalError }) => {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    // Safari native HLS
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
      video.play().catch(() => {})
      return
    }

    if (!Hls.isSupported()) {
      onFatalError?.()
      return
    }

    const hls = new Hls({
      xhrSetup: (xhr) => xhr.overrideMimeType('application/octet-stream')
    })

    hlsRef.current = hls
    hls.loadSource(src)
    hls.attachMedia(video)

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      video.play().catch(() => {})
    })

    hls.on(Hls.Events.ERROR, (_e, data) => {
      if (!data.fatal) return
      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
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
  }, [src, onFatalError])

  return (
    <video
      ref={videoRef}
      style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
      controls
      autoPlay
      muted
      playsInline
    />
  )
}

export default HLSPlayer
