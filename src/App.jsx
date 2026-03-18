import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import VideoPlayer from './components/VideoPlayer';
import TabSelector from './components/TabSelector';
import MatchList from './components/MatchList';
import ChannelList from './components/ChannelList';
import LiveScoresSlider from './components/LiveScoresSlider';

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
    <div className="min-h-screen text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-3 lg:px-6 pt-6 lg:pt-8">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 lg:gap-6">
          <div className="lg:col-span-2 space-y-4 lg:space-y-6">
            <div className="relative bg-slate-800/90 rounded-2xl overflow-hidden border border-green-500/20 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
              <div className="relative">
                <VideoPlayer
                  selectedMatch={selectedMatch}
                  streamLoading={streamLoading}
                  logoState={logoState}
                  setLogoState={setLogoState}
                  toggleFullscreen={toggleFullscreen}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 lg:space-y-6">
            <TabSelector
              activeTab={activeTab}
              onTabChange={handleTabChange}
              matchesCount={matches.length}
              channelsCount={filteredChannelsCount}
            />

            <div className="bg-slate-800/90 rounded-2xl border border-slate-600/50 overflow-hidden shadow-lg">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-10 h-10 border-2 border-green-500/50 border-t-green-500 rounded-full animate-spin mx-auto" />
                  <p className="text-slate-300 text-sm mt-4 font-medium">Yükleniyor...</p>
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

      <LiveScoresSlider />
      <Footer />
    </div>
  );
}

export default App;
