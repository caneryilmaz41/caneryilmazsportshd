import { useEffect, useRef } from 'react'
import Hls from 'hls.js'

const HLSPlayer = ({ src, onError }) => {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !src) return

    // Safari native HLS desteği
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
      video.play().catch(onError)
      return
    }

    // HLS.js desteği
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: false,
        lowLatencyMode: true,
        backBufferLength: 90
      })
      
      hlsRef.current = hls
      
      hls.loadSource(src)
      hls.attachMedia(video)
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(onError)
      })
      
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS Error:', data)
        if (data.fatal) {
          onError?.(new Error(`HLS Error: ${data.type} - ${data.details}`))
        }
      })
    } else {
      onError?.(new Error('HLS not supported'))
    }

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
      className="w-full h-full"
      controls
      autoPlay
      muted
      playsInline
    />
  )
}

export default HLSPlayer