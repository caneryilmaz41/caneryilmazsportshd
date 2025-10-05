import { encodeStreamUrl } from '../utils/streamUtils';

// Base64 URL encoder (fallback if import fails)
const encodeStreamUrlFallback = (url) => {
  try {
    return btoa(url)
  } catch (error) {
    console.error('URL encode error:', error)
    return url // Fallback to original if encode fails
  }
}

// Process matches/channels with Base64 encoding
const processStreamData = (data) => {
  if (data.matches) {
    data.matches = data.matches.map(match => ({
      ...match,
      id: match.streamUrl ? encodeStreamUrl(match.streamUrl) : match.id
    }))
  }
  
  if (data.channels) {
    data.channels = data.channels.map(channel => ({
      ...channel,
      id: channel.streamUrl ? encodeStreamUrl(channel.streamUrl) : channel.id
    }))
  }
  
  return data
}

// TRGoals'dan maç listesini çek
export const scrapeMatches = async () => {
  try {
    const activeDomain = localStorage.getItem('activeTRGoalsDomain') || 'https://trgoals1424.xyz'
    
    // Kendi API'mizi kullan
    const response = await fetch(`/api/scrapeMatches?domain=${encodeURIComponent(activeDomain)}`)
    const data = await response.json()
    
    if (data.matches || data.channels) {
      const processedData = processStreamData({
        matches: data.matches || [], 
        channels: data.channels || [] 
      })
      return processedData
    } else {
      return getFallbackData()
    }
  } catch (error) {
    console.error('Scraping error:', error)
    return getFallbackData()
  }
}

// Fallback data with Base64 encoded URLs
export const getFallbackData = () => {
  const fallbackUrls = {
    'yayin1': 'aHR0cHM6Ly90cmdvYWxzMTQyNC54eXovY2hhbm5lbC5odG1sP2lkPXlheWluMQ==', // https://trgoals1424.xyz/channel.html?id=yayin1
    'yayinb2': 'aHR0cHM6Ly90cmdvYWxzMTQyNC54eXovY2hhbm5lbC5odG1sP2lkPXlheWluYjI=', // https://trgoals1424.xyz/channel.html?id=yayinb2
    'yayint3': 'aHR0cHM6Ly90cmdvYWxzMTQyNC54eXovY2hhbm5lbC5odG1sP2lkPXlheWludDM=', // https://trgoals1424.xyz/channel.html?id=yayint3
    'yayinss': 'aHR0cHM6Ly90cmdvYWxzMTQyNC54eXovY2hhbm5lbC5odG1sP2lkPXlheWluc3M='  // https://trgoals1424.xyz/channel.html?id=yayinss
  }
  
  return {
    matches: [
      { id: fallbackUrls['yayin1'], name: 'Galatasaray - Fenerbahçe', time: '20:00' },
      { id: fallbackUrls['yayinb2'], name: 'Real Madrid - Barcelona ', time: '20:00' },
      { id: fallbackUrls['yayint3'], name: 'Kocaelispor - Beşiktaş', time: '19:30' }
    ],
    channels: [
      { id: fallbackUrls['yayin1'], name: 'BeIN Sports 1', status: '7/24' },
      { id: fallbackUrls['yayinb2'], name: 'BeIN Sports 2', status: '7/24' },
      { id: fallbackUrls['yayinss'], name: 'S Sport', status: '7/24' }
    ]
  }
}