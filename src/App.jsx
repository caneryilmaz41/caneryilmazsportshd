import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import VideoPlayer from './components/VideoPlayer';
import TabSelector from './components/TabSelector';
import MatchList from './components/MatchList';
import ChannelList from './components/ChannelList';

import { useStreamData } from './hooks/useStreamData';
import { useStreamPlayer } from './hooks/useStreamPlayer';

function App() {
  const [activeTab, setActiveTab] = useState("matches");
  const [logoState, setLogoState] = useState({});
  
  const { matches, channels, loading } = useStreamData();
  const {
    selectedMatch,
    streamLoading,
    handleMatchSelect,
    toggleFullscreen
  } = useStreamPlayer();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const filteredChannelsCount = channels.filter((channel) => {
    const name = channel.name?.toLowerCase() || '';
    const hasVs = name.includes(' vs ') || name.includes(' - ') || name.includes(' x ');
    const hasTeamNames = name.includes('galatasaray') || name.includes('fenerbahçe') || name.includes('beşiktaş') || name.includes('trabzonspor');
    const isChannel = name.includes('tv') || name.includes('spor') || name.includes('kanal') || name.includes('sport');
    return !hasVs && !hasTeamNames && (isChannel || channel.status?.includes('/'));
  }).length;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-3 lg:px-6 pt-4 lg:pt-0">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-3 lg:gap-4">
          <div className="lg:col-span-2 space-y-3 lg:space-y-4">
            <div className="bg-slate-800 rounded-lg overflow-hidden border border-green-500/30">
              <VideoPlayer
                selectedMatch={selectedMatch}
                streamLoading={streamLoading}
                logoState={logoState}
                setLogoState={setLogoState}
                toggleFullscreen={toggleFullscreen}
              />
            </div>
          </div>

          <div className="space-y-3 lg:space-y-4">
            <TabSelector
              activeTab={activeTab}
              onTabChange={handleTabChange}
              matchesCount={matches.length}
              channelsCount={filteredChannelsCount}
            />

            <div className="bg-slate-800 rounded-lg border border-slate-600 overflow-hidden">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-slate-300 text-sm">Yükleniyor...</p>
                </div>
              ) : (
                <div
                  className="max-h-80 lg:max-h-96 overflow-y-auto"
                  style={{ WebkitOverflowScrolling: "touch" }}
                >
                  {activeTab === "matches" ? (
                    <MatchList
                      matches={matches}
                      selectedMatch={selectedMatch}
                      onMatchSelect={handleMatchSelect}
                      logoState={logoState}
                      setLogoState={setLogoState}
                    />
                  ) : (
                    <ChannelList
                      channels={channels}
                      selectedMatch={selectedMatch}
                      onChannelSelect={handleMatchSelect}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      
      <Footer />
    </div>
  );
}

export default App;
