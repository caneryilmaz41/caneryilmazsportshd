import { decodeStreamUrl, isBase64Encoded } from '../utils/streamUtils';

// Base64 URL decoder (fallback if import fails)
const decodeStreamUrlFallback = (encodedUrl) => {
  try {
    return atob(encodedUrl)
  } catch (error) {
    console.error('URL decode error:', error)
    return encodedUrl // Fallback to original if decode fails
  }
}

// Find active TRGoals domain
export const findActiveDomain = async () => {
  const currentNumber = 1424
  
  // Check current and next 10 numbers
  for (let i = 0; i <= 10; i++) {
    const testNumber = currentNumber + i
    try {
      const response = await fetch(`/api/checkDomain?baseNumber=${testNumber}`)
      const data = await response.json()
      
      if (data.active) {
        localStorage.setItem('activeTRGoalsDomain', data.domain)
        return data.domain
      }
    } catch (error) {
      console.error('Domain check error:', error)
    }
  }
  
  // Fallback to stored domain or default
  return localStorage.getItem('activeTRGoalsDomain') || 'https://trgoals1424.xyz'
}

// Get stream URL with Base64 decoding
export const getStreamUrl = async (channelId) => {
  // Check if channelId is Base64 encoded
  if (channelId && isBase64Encoded(channelId)) {
    const decodedUrl = decodeStreamUrl(channelId)
    if (decodedUrl !== channelId && decodedUrl.startsWith('http')) {
      return decodedUrl
    }
  }
  
  // Fallback to traditional URL construction
  const activeDomain = await findActiveDomain()
  return `${activeDomain}/channel.html?id=${channelId}`
}