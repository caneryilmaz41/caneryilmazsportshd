import { useState } from 'react';
import Header from './components/Header';
import PrayerCountdown from './components/PrayerCountdown';
import Footer from './components/Footer';
import VideoPlayer from './components/VideoPlayer';
import TabSelector from './components/TabSelector';
import MatchList from './components/MatchList';
import ChannelList from './components/ChannelList';
import LiveScoresSlider from './components/LiveScoresSlider';
import PWAInstallPrompt from './components/PWAInstallPrompt';

import { useStreamData } from './hooks/useStreamData';
import { useStreamPlayer } from './hooks/useStreamPlayer';

function App() {
  const [activeTab, setActiveTab] = useState("matches");
  const [logoState, setLogoState] = useState({});
  
  const { matches, channels, loading } = useStreamData();
  const {
    selectedMatch,
    streamLoading,
    handleMatchSelect
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
      <PrayerCountdown />

      <div className="mx-auto max-w-[1600px] px-3 pt-6 lg:px-6 lg:pt-8">
        {/*
          Mobil: önce oynatıcı, sonra maç/kanallar, en altta skorlar.
          xl+: sol maç/kanallar | orta oynatıcı | sağ skorlar
        */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(260px,300px)_minmax(0,1fr)_minmax(240px,300px)] xl:items-start xl:gap-5">
          {/* Sol: sabit yükseklik + flex ile scroll her zaman çalışır */}
          <aside className="order-2 flex h-[min(420px,52dvh)] min-h-0 flex-col gap-3 xl:order-none xl:h-[calc(100vh-5.5rem)] xl:max-h-[calc(100vh-5.5rem)] xl:sticky xl:top-4 xl:self-start">
            <TabSelector
              activeTab={activeTab}
              onTabChange={handleTabChange}
              matchesCount={matches.length}
              channelsCount={filteredChannelsCount}
            />

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-600/45 bg-gradient-to-b from-slate-800/95 to-slate-900/90 shadow-xl ring-1 ring-white/[0.04]">
              <div className="flex shrink-0 items-center justify-between border-b border-slate-600/40 bg-slate-900/40 px-3 py-2 backdrop-blur-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {activeTab === 'matches' ? 'Canlı yayınlar' : 'TV kanalları'}
                </span>
                <span className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-bold tabular-nums text-slate-500">
                  {activeTab === 'matches' ? matches.length : filteredChannelsCount}
                </span>
              </div>

              {loading ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12">
                  <div className="h-9 w-9 animate-spin rounded-full border-2 border-green-500/30 border-t-green-500" />
                  <p className="text-xs font-medium text-slate-500">Liste yükleniyor…</p>
                </div>
              ) : (
                <div
                  className="stream-panel-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {activeTab === 'matches' ? (
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
          </aside>

          <section className="order-1 min-w-0 xl:order-none">
            <div className="relative overflow-hidden rounded-2xl border border-green-500/20 bg-slate-800/90 shadow-lg">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
              <div className="relative">
                <VideoPlayer
                  selectedMatch={selectedMatch}
                  streamLoading={streamLoading}
                  logoState={logoState}
                  setLogoState={setLogoState}
                />
              </div>
            </div>
          </section>

          <aside className="order-3 flex min-h-0 h-[min(400px,50dvh)] flex-col xl:order-none xl:h-[calc(100vh-5.5rem)] xl:max-h-[calc(100vh-5.5rem)] xl:self-start xl:sticky xl:top-4">
            <LiveScoresSlider variant="sidebar" />
          </aside>
        </div>
      </div>
      <Footer />
      <PWAInstallPrompt />
    </div>
  );
}

export default App;
