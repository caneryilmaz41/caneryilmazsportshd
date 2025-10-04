import { useState, useEffect } from 'react'
import { getStreamUrl } from './components/StreamService'
import { scrapeMatches, getFallbackData } from './components/MatchScraper'

function App() {
  const [activeTab, setActiveTab] = useState('matches')
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [matches, setMatches] = useState([])
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const scrapedData = await scrapeMatches()
        if (scrapedData.matches.length > 0) {
          setMatches(scrapedData.matches)
          setChannels(scrapedData.channels)
          localStorage.setItem('lastUpdate', Date.now().toString())
        } else {
          const fallbackData = getFallbackData()
          setMatches(fallbackData.matches)
          setChannels(fallbackData.channels)
        }
      } catch (error) {
        const fallbackData = getFallbackData()
        setMatches(fallbackData.matches)
        setChannels(fallbackData.channels)
      }
      setLoading(false)
    }
    
    // İlk yükleme
    loadData()
    
    // 1 saatte bir güncelle (Free Plan için çok güvenli)
    const interval = setInterval(() => {
      const lastUpdate = localStorage.getItem('lastUpdate')
      const now = Date.now()
      
      // Son güncelleme 1 saatten eskiyse güncelle
      if (!lastUpdate || now - parseInt(lastUpdate) > 60 * 60 * 1000) {
        loadData()
      }
    }, 60 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const handleMatchSelect = async (match) => {
    const streamUrl = await getStreamUrl(match.id)
    setSelectedMatch({ ...match, url: streamUrl })
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSearchTerm('')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="text-center py-3 lg:py-6 border-b border-slate-700 lg:border-0">
        <img src="/logom.png" alt="Logo" className="h-6 lg:h-12 mx-auto" />
      </div>

      <div className="max-w-7xl mx-auto px-3 lg:px-6">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-3 lg:gap-4">
          
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-3 lg:space-y-4">
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              {selectedMatch ? (
                <div>
                  <div className="bg-slate-700 px-3 py-2 lg:px-4">
                    <h2 className="font-bold text-sm lg:text-base truncate">{selectedMatch.name}</h2>
                    <span className="text-xs lg:text-sm text-slate-400">{selectedMatch.time}</span>
                  </div>
                  <div className="aspect-video relative">
                    <iframe 
                      src={selectedMatch.url}
                      className="w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                      scrolling="no"
                      sandbox="allow-scripts allow-same-origin allow-presentation allow-popups-to-escape-sandbox"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      allow="autoplay; fullscreen"
                    />
                    <style dangerouslySetInnerHTML={{
                      __html: `
                        [class*="ad"], [id*="ad"], [class*="banner"], [id*="banner"],
                        [class*="popup"], [id*="popup"], [class*="overlay"], [id*="overlay"] {
                          display: none !important;
                          visibility: hidden !important;
                          opacity: 0 !important;
                          height: 0 !important;
                          width: 0 !important;
                        }
                      `
                    }} />
                  </div>
                </div>
              ) : (
                <div className="p-6 lg:p-8 text-center aspect-video flex flex-col justify-center">
                  <h2 className="text-lg lg:text-2xl font-bold mb-4">YAYIN BAŞLIYOR</h2>
                  <div className="w-16 h-16 lg:w-32 lg:h-32 mx-auto border-4 border-slate-600 rounded-full flex items-center justify-center mb-4">
                    <div className="w-0 h-0 border-l-[12px] lg:border-l-[20px] border-l-white border-t-[8px] lg:border-t-[15px] border-t-transparent border-b-[8px] lg:border-b-[15px] border-b-transparent ml-1"></div>
                  </div>
                  <p className="text-slate-400 text-sm px-4">Aşağıdan bir maç veya kanal seçin</p>
                </div>
              )}
            </div>
            
            <div className="bg-slate-800 rounded-lg h-64 hidden lg:block"></div>
          </div>

          {/* Sidebar */}
          <div className="space-y-3 lg:space-y-4">
            {/* Desktop Tabs */}
            <div className="lg:flex lg:bg-slate-700 lg:rounded-lg lg:p-1 hidden">
              <button
                onClick={() => handleTabChange('matches')}
                className={`flex-1 py-3 px-2 rounded text-sm font-medium flex items-center justify-center gap-1 transition-all duration-300 ${
                  activeTab === 'matches' ? 'bg-slate-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-600'
                }`}
              >
                <span className="text-blue-400">⚽</span>
                <span>MAÇLAR</span>
                <span className="bg-slate-500 text-xs px-2 py-1 rounded-full">{matches.length}</span>
              </button>
              <button
                onClick={() => handleTabChange('channels')}
                className={`flex-1 py-3 px-2 rounded text-sm font-medium flex items-center justify-center gap-1 transition-all duration-300 ${
                  activeTab === 'channels' ? 'bg-slate-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-600'
                }`}
              >
                <span className="text-blue-400">📺</span>
                <span>KANALLAR</span>
                <span className="bg-slate-500 text-xs px-2 py-1 rounded-full">{channels.length}</span>
              </button>
            </div>

            {/* Mobile Tabs - Basit */}
            <div className="flex bg-slate-800 rounded-lg p-1 lg:hidden">
              <button
                onClick={() => handleTabChange('matches')}
                className={`flex-1 py-3 px-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'matches' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span>⚽</span>
                <span>MAÇLAR</span>
                <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded font-bold">{matches.length}</span>
              </button>
              <button
                onClick={() => handleTabChange('channels')}
                className={`flex-1 py-3 px-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'channels' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span>📺</span>
                <span>KANALLAR</span>
                <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded font-bold">{channels.length}</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={activeTab === 'matches' ? 'Maç ara...' : 'Kanal ara...'}
                className="w-full bg-slate-800 text-white px-4 py-3 pl-10 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400 text-sm"
              />
              <span className="absolute left-3 top-3.5 text-slate-400">🔍</span>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3.5 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* List - Mobile Optimized */}
            <div className="bg-slate-800 rounded-lg border border-slate-600 overflow-hidden">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-slate-300 text-sm">Yükleniyor...</p>
                </div>
              ) : (
                <div className="max-h-80 lg:max-h-96 overflow-y-auto" style={{WebkitOverflowScrolling: 'touch'}}>
                  {activeTab === 'matches' ? (
                    <div className="divide-y divide-slate-700">
                      {matches
                        .filter(match => match.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(match => (
                        <button
                          key={match.id}
                          onClick={() => handleMatchSelect(match)}
                          className={`w-full text-left p-4 hover:bg-slate-700 transition-colors ${
                            selectedMatch?.id === match.id ? 'bg-blue-600/20 border-l-4 border-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-white truncate">{match.name}</div>
                              <div className="text-xs text-slate-400 mt-1">{match.time}</div>
                            </div>
                            {selectedMatch?.id === match.id && (
                              <div className="text-blue-400 ml-2">▶️</div>
                            )}
                          </div>
                        </button>
                      ))}
                      {matches
                        .filter(match => match.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .length === 0 && (
                        <div className="p-6 text-center text-slate-400 text-sm">
                          {searchTerm ? 'Maç bulunamadı' : 'Henüz maç yok'}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-700">
                      {channels
                        .filter(channel => channel.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map(channel => (
                        <button
                          key={channel.id}
                          onClick={() => handleMatchSelect(channel)}
                          className={`w-full text-left p-4 hover:bg-slate-700 transition-colors ${
                            selectedMatch?.id === channel.id ? 'bg-blue-600/20 border-l-4 border-blue-500' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-white truncate">{channel.name}</div>
                              <div className="text-xs text-slate-400 mt-1">{channel.status}</div>
                            </div>
                            {selectedMatch?.id === channel.id && (
                              <div className="text-blue-400 ml-2">▶️</div>
                            )}
                          </div>
                        </button>
                      ))}
                      {channels
                        .filter(channel => channel.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .length === 0 && (
                        <div className="p-6 text-center text-slate-400 text-sm">
                          {searchTerm ? 'Kanal bulunamadı' : 'Henüz kanal yok'}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App