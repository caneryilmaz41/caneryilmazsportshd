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
      <div className="text-center py-6">
        <img src="/src/assets/logom.png" alt="Logo" className="h-12 mx-auto" />
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-3 gap-4">
          
          <div className="col-span-2 space-y-4">
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
                <div className="p-8 text-center aspect-video flex flex-col justify-center">
                  <h2 className="text-2xl font-bold mb-8">YAYIN BAŞLIYOR</h2>
                  <div className="w-32 h-32 mx-auto border-4 border-slate-600 rounded-full flex items-center justify-center mb-6">
                    <div className="w-0 h-0 border-l-[20px] border-l-white border-t-[15px] border-t-transparent border-b-[15px] border-b-transparent ml-2"></div>
                  </div>
                  <p className="text-slate-400">Aşağıdaki listelerden bir maç veya kanal seçin.</p>
                </div>
              )}
            </div>
            
            <div className="bg-slate-800 rounded-lg h-64"></div>
          </div>

          <div className="space-y-4">
            <div className="flex bg-slate-700 rounded-lg p-1">
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

            <div className="relative">
              <input
                type="text"
                placeholder="Maç ara..."
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 hover:bg-slate-600"
              />
              <span className="absolute right-3 top-3 text-blue-400">🔍</span>
            </div>

            <div className="bg-slate-700 rounded-lg max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-slate-400 text-sm">Maçlar yüklüyor...</p>
                </div>
              ) : (
                activeTab === 'matches' ? (
                  <div className="space-y-1 p-2">
                    {matches.map(match => (
                      <button
                        key={match.id}
                        onClick={() => handleMatchSelect(match)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-300 hover:bg-slate-600 ${
                          selectedMatch?.id === match.id ? 'bg-slate-600' : 'bg-slate-800'
                        }`}
                      >
                        <div className="font-medium text-sm">{match.name}</div>
                        <div className="text-xs text-slate-400">{match.time}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {channels.map(channel => (
                      <button
                        key={channel.id}
                        onClick={() => handleMatchSelect(channel)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-300 hover:bg-slate-600 ${
                          selectedMatch?.id === channel.id ? 'bg-slate-600' : 'bg-slate-800'
                        }`}
                      >
                        <div className="font-medium text-sm">{channel.name}</div>
                        <div className="text-xs text-slate-400">{channel.status}</div>
                      </button>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App