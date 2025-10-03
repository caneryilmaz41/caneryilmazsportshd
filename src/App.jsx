import { useState, useEffect } from 'react'
import { getStreamUrl } from './components/StreamService'
import { scrapeMatches, getFallbackData } from './components/MatchScraper'

function App() {
  const [activeTab, setActiveTab] = useState('matches')
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [matches, setMatches] = useState([])
  const [channels, setChannels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const scrapedData = await scrapeMatches()
        if (scrapedData.matches.length > 0) {
          setMatches(scrapedData.matches)
          setChannels(scrapedData.channels)
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
    
    loadData()
    const interval = setInterval(loadData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleMatchSelect = async (match) => {
    const streamUrl = await getStreamUrl(match.id)
    setSelectedMatch({ ...match, url: streamUrl })
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="text-center py-4 lg:py-6">
        <img src="/logom.png" alt="Logo" className="h-8 lg:h-12 mx-auto" />
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4">
          
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-800 rounded-lg overflow-hidden">
              {selectedMatch ? (
                <div>
                  <div className="bg-slate-700 px-4 py-2 flex justify-between items-center">
                    <h2 className="font-bold">{selectedMatch.name}</h2>
                    <span className="text-sm text-slate-400">{selectedMatch.time}</span>
                  </div>
                  <div className="aspect-video">
                    <iframe 
                      src={selectedMatch.url}
                      className="w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                      scrolling="no"
                    />
                  </div>
                </div>
              ) : (
                <div className="p-4 lg:p-8 text-center aspect-video flex flex-col justify-center">
                  <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-8">YAYIN BAŞLIYOR</h2>
                  <div className="w-20 h-20 lg:w-32 lg:h-32 mx-auto border-4 border-slate-600 rounded-full flex items-center justify-center mb-4 lg:mb-6">
                    <div className="w-0 h-0 border-l-[15px] lg:border-l-[20px] border-l-white border-t-[10px] lg:border-t-[15px] border-t-transparent border-b-[10px] lg:border-b-[15px] border-b-transparent ml-1 lg:ml-2"></div>
                  </div>
                  <p className="text-slate-400 text-sm lg:text-base px-4">Aşağıdaki listelerden bir maç veya kanal seçin.</p>
                </div>
              )}
            </div>
            
            <div className="bg-slate-800 rounded-lg h-64 hidden lg:block"></div>
          </div>

          <div className="space-y-4">
            {/* Mobile: Modern Design, Desktop: Classic */}
            <div className="lg:flex lg:bg-slate-700 lg:rounded-lg lg:p-1 hidden">
              <button
                onClick={() => setActiveTab('matches')}
                className={`flex-1 py-3 px-2 rounded text-sm font-medium flex items-center justify-center gap-1 transition-all duration-300 ${
                  activeTab === 'matches' ? 'bg-slate-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-600'
                }`}
              >
                <span className="text-blue-400">⚽</span>
                <span>MAÇLAR</span>
                <span className="bg-slate-500 text-xs px-2 py-1 rounded-full">{matches.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('channels')}
                className={`flex-1 py-3 px-2 rounded text-sm font-medium flex items-center justify-center gap-1 transition-all duration-300 ${
                  activeTab === 'channels' ? 'bg-slate-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-600'
                }`}
              >
                <span className="text-blue-400">📺</span>
                <span>KANALLAR</span>
                <span className="bg-slate-500 text-xs px-2 py-1 rounded-full">{channels.length}</span>
              </button>
            </div>

            {/* Mobile Modern Tabs */}
            <div className="flex bg-slate-800/80 backdrop-blur-sm rounded-2xl p-1 shadow-xl border border-slate-700/50 lg:hidden">
              <button
                onClick={() => setActiveTab('matches')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                  activeTab === 'matches' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span className="text-lg">⚽</span>
                <span>MAÇLAR</span>
                <span className="bg-white/20 text-xs px-2 py-1 rounded-full font-bold">{matches.length}</span>
              </button>
              <button
                onClick={() => setActiveTab('channels')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                  activeTab === 'channels' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span className="text-lg">📺</span>
                <span>KANALLAR</span>
                <span className="bg-white/20 text-xs px-2 py-1 rounded-full font-bold">{channels.length}</span>
              </button>
            </div>

            {/* Search - Desktop Classic, Mobile Modern */}
            <div className="relative">
              <input
                type="text"
                placeholder="Maç ara..."
                className="w-full text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 lg:bg-slate-700 lg:hover:bg-slate-600 bg-slate-800/80 backdrop-blur-sm pl-12 rounded-2xl border border-slate-700/50 focus:ring-blue-500/50 focus:border-blue-500/50 placeholder-slate-400 shadow-lg lg:pl-4 lg:rounded-lg lg:border-0 lg:shadow-none"
              />
              <span className="absolute top-3 text-blue-400 lg:hidden left-4 text-lg">🔍</span>
              <span className="absolute right-3 top-3 text-blue-400 hidden lg:inline">🔍</span>
            </div>

            {/* List - Desktop Classic, Mobile Modern */}
            <div className="rounded-lg overflow-hidden lg:bg-slate-700 lg:max-h-96 bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-700/50 max-h-80">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-2 lg:w-6 lg:h-6 w-8 h-8 border-3 border-blue-500 mb-4"></div>
                  <p className="text-slate-400 text-sm lg:text-slate-400 text-slate-300 font-medium">Maçlar yüklüyor...</p>
                </div>
              ) : (
                <div className="overflow-y-auto lg:max-h-96 max-h-80">
                  {activeTab === 'matches' ? (
                    <div className="lg:space-y-1 lg:p-2 p-2 space-y-2">
                      {matches.map(match => (
                        <button
                          key={match.id}
                          onClick={() => handleMatchSelect(match)}
                          className={`w-full text-left transition-all duration-300 lg:p-3 lg:rounded-lg lg:hover:bg-slate-600 p-4 rounded-xl group ${
                            selectedMatch?.id === match.id 
                              ? 'lg:bg-slate-600 bg-gradient-to-r from-blue-600/20 to-blue-500/20 border border-blue-500/30 shadow-lg' 
                              : 'lg:bg-slate-800 bg-slate-700/50 hover:bg-slate-600/60 border border-transparent hover:border-slate-500/50'
                          }`}
                        >
                          <div className="lg:block flex items-center justify-between">
                            <div className="lg:block flex-1">
                              <div className="font-medium text-sm lg:text-sm text-white group-hover:text-blue-300 transition-colors">{match.name}</div>
                              <div className="text-xs text-slate-400 lg:text-xs lg:text-slate-400 text-sm mt-1 flex items-center gap-2">
                                <span className="text-xs lg:hidden">🕐</span>
                                {match.time}
                              </div>
                            </div>
                            {selectedMatch?.id === match.id && (
                              <div className="text-blue-400 text-lg lg:hidden">▶️</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="lg:space-y-1 lg:p-2 p-2 space-y-2">
                      {channels.map(channel => (
                        <button
                          key={channel.id}
                          onClick={() => handleMatchSelect(channel)}
                          className={`w-full text-left transition-all duration-300 lg:p-3 lg:rounded-lg lg:hover:bg-slate-600 p-4 rounded-xl group ${
                            selectedMatch?.id === channel.id 
                              ? 'lg:bg-slate-600 bg-gradient-to-r from-blue-600/20 to-blue-500/20 border border-blue-500/30 shadow-lg' 
                              : 'lg:bg-slate-800 bg-slate-700/50 hover:bg-slate-600/60 border border-transparent hover:border-slate-500/50'
                          }`}
                        >
                          <div className="lg:block flex items-center justify-between">
                            <div className="lg:block flex-1">
                              <div className="font-medium text-sm lg:text-sm text-white group-hover:text-blue-300 transition-colors">{channel.name}</div>
                              <div className="text-xs text-slate-400 lg:text-xs lg:text-slate-400 text-sm mt-1 flex items-center gap-2">
                                <span className="text-xs lg:hidden">📡</span>
                                {channel.status}
                              </div>
                            </div>
                            {selectedMatch?.id === channel.id && (
                              <div className="text-blue-400 text-lg lg:hidden">▶️</div>
                            )}
                          </div>
                        </button>
                      ))}
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