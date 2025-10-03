// TRGoals domain checker
const checkDomain = async (baseNumber) => {
  const domain = `https://trgoals${baseNumber}.xyz`
  try {
    const response = await fetch(`${domain}/channel.html?id=yayin1`, { 
      method: 'HEAD',
      mode: 'no-cors'
    })
    return domain
  } catch {
    return null
  }
}

// Find active TRGoals domain
export const findActiveDomain = async () => {
  const currentNumber = 1424
  
  // Check current and next 10 numbers
  for (let i = 0; i <= 10; i++) {
    const testNumber = currentNumber + i
    const domain = await checkDomain(testNumber)
    if (domain) {
      localStorage.setItem('activeTRGoalsDomain', domain)
      return domain
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