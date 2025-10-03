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

// Get stream URL
export const getStreamUrl = async (channelId) => {
  const activeDomain = await findActiveDomain()
  return `${activeDomain}/channel.html?id=${channelId}`
}