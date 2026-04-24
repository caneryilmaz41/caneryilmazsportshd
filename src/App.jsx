import { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import PrayerCountdown from './components/PrayerCountdown';
import Footer from './components/Footer';
import VideoPlayer from './components/VideoPlayer';
import TabSelector from './components/TabSelector';
import MatchList from './components/MatchList';
import ChannelList from './components/ChannelList';
import LiveScoresSlider from './components/LiveScoresSlider';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import AppSplashScreen from './components/AppSplashScreen';
import StandaloneRefreshButton from './components/StandaloneRefreshButton';
import NewsTicker from './components/NewsTicker';
import ScrollToTopButton from './components/ScrollToTopButton';

import { useStreamData } from './hooks/useStreamData';
import { useStreamPlayer } from './hooks/useStreamPlayer';
import { useRecentPicks } from './hooks/useRecentPicks';
import { parseMatchTeams } from './utils/teamUtils';
import RecentPicks from './components/RecentPicks';
import ChannelHeaderSlider from './components/ChannelHeaderSlider';
import { getFilteredChannels } from './utils/channelFilter';
import { useHlsMatchList } from './hooks/useHlsMatchList';

function App() {
  const [activeTab, setActiveTab] = useState("matches");
  const [matchSearch, setMatchSearch] = useState("");
  const [logoState, setLogoState] = useState({});
  const [channelKindTab, setChannelKindTab] = useState('tv');
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return localStorage.getItem('onboardingDismissed') !== '1';
    } catch {
      return true;
    }
  });
  
  const { matches, channels, belgeselChannels, loading } = useStreamData();
  const { hlsMatches, hlsProbing } = useHlsMatchList(matches);

  const filteredMatches = useMemo(() => {
    const q = matchSearch.trim().toLowerCase();
    if (!q) return hlsMatches;
    return hlsMatches.filter((m) => {
      const name = m.name?.toLowerCase() || "";
      const league = m.league?.toLowerCase() || "";
      const cat = m.category?.toLowerCase() || "";
      const teams = parseMatchTeams(m.name);
      const t0 = (teams[0] || "").toLowerCase();
      const t1 = (teams[1] || "").toLowerCase();
      return (
        name.includes(q) ||
        league.includes(q) ||
        cat.includes(q) ||
        t0.includes(q) ||
        t1.includes(q)
      );
    });
  }, [hlsMatches, matchSearch]);
  const {
    selectedMatch,
    streamLoading,
    handleMatchSelect
  } = useStreamPlayer();

  const { recent, addPick } = useRecentPicks();

  const selectMatch = (m) => {
    addPick({ id: m.id, name: m.name, kind: 'match' });
    handleMatchSelect(m);
  };

  const selectChannel = (c) => {
    addPick({ id: c.id, name: c.name, kind: 'channel' });
    handleMatchSelect(c);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('onboardingDismissed', '1');
  };

  const tvChannelsFiltered = useMemo(() => getFilteredChannels(channels), [channels]);
  const hasBelgesel = belgeselChannels.length > 0;
  const hasTv = tvChannelsFiltered.length > 0;

  const activeChannelList = useMemo(() => {
    if (hasBelgesel && !hasTv) {
      return belgeselChannels;
    }
    if (!hasBelgesel && hasTv) {
      return tvChannelsFiltered;
    }
    return channelKindTab === 'belgesel' ? belgeselChannels : tvChannelsFiltered;
  }, [hasBelgesel, hasTv, belgeselChannels, tvChannelsFiltered, channelKindTab]);

  const allChannelsFlat = useMemo(
    () => [...tvChannelsFiltered, ...belgeselChannels],
    [belgeselChannels, tvChannelsFiltered]
  );

  const filteredChannelsCount = allChannelsFlat.length;

  useEffect(() => {
    if (channelKindTab === 'belgesel' && !hasBelgesel) {
      setChannelKindTab('tv');
    }
    if (loading) return;
    if (channelKindTab === 'tv' && !hasTv && hasBelgesel) {
      setChannelKindTab('belgesel');
    }
  }, [channelKindTab, hasBelgesel, hasTv, loading]);

  const listPanelLoading = loading || (activeTab === 'matches' && hlsProbing);

  return (
    <div className="min-h-screen pb-9 text-white antialiased sm:pb-10">
      <AppSplashScreen />
      <Header />
      <PrayerCountdown />
      {loading || activeChannelList.length > 0 ? (
        <ChannelHeaderSlider
          channels={activeChannelList}
          selectedMatch={selectedMatch}
          onSelect={selectChannel}
          channelKind={channelKindTab}
          onChannelKind={setChannelKindTab}
          showKindTabs={hasBelgesel && hasTv}
          loading={loading}
        />
      ) : null}

      <div className="mx-auto max-w-[1600px] px-3 pt-4 lg:px-6 lg:pt-6">
        {/*
          Mobil: seçim yokken oynatıcı yok; maç/kanal seçilince oynatıcı üstte, liste altında.
          xl+: sol maç/kanallar | orta oynatıcı | sağ skorlar (seçim yokken de orta panel boş/placeholder)
        */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(260px,300px)_minmax(0,1fr)_minmax(240px,300px)] xl:items-start xl:gap-5">
          {/* Sol: sabit yükseklik + flex ile scroll her zaman çalışır */}
          <aside className="order-2 flex h-[min(420px,52dvh)] min-h-0 flex-col gap-3 xl:order-none xl:h-[calc(100vh-5.5rem)] xl:max-h-[calc(100vh-5.5rem)] xl:sticky xl:top-4 xl:self-start">
            <TabSelector
              activeTab={activeTab}
              onTabChange={handleTabChange}
              matchesCount={hlsMatches.length}
              channelsCount={filteredChannelsCount}
            />

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-600/45 bg-gradient-to-b from-slate-800/95 to-slate-900/90 shadow-xl ring-1 ring-white/[0.04]">
              <div className="flex shrink-0 items-center justify-between border-b border-slate-600/40 bg-slate-900/40 px-3 py-2 backdrop-blur-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {activeTab === 'matches'
                    ? 'Canlı yayınlar'
                    : hasBelgesel && hasTv
                      ? channelKindTab === 'belgesel'
                        ? 'Belgesel'
                        : 'TV & Spor'
                      : 'TV kanalları'}
                </span>
                <span className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[10px] font-bold tabular-nums text-slate-500">
                  {activeTab === 'matches'
                    ? matchSearch.trim()
                      ? `${filteredMatches.length}/${hlsMatches.length}`
                      : hlsMatches.length
                    : activeChannelList.length}
                </span>
              </div>

              {activeTab === 'matches' ? (
                <div className="shrink-0 space-y-2 border-b border-slate-700/35 bg-slate-900/30 px-2 py-2">
                  {showOnboarding ? (
                    <div className="flex items-start justify-between gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5">
                      <p className="text-[11px] text-emerald-200">Bir maç seç, yayın player alanında hemen açılır.</p>
                      <button
                        type="button"
                        onClick={dismissOnboarding}
                        className="rounded px-1 text-[11px] text-emerald-300 hover:bg-emerald-500/20"
                      >
                        ✕
                      </button>
                    </div>
                  ) : null}
                  <div className="relative">
                    <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    <input
                      type="search"
                      value={matchSearch}
                      onChange={(e) => setMatchSearch(e.target.value)}
                      placeholder="Takım, lig ara…"
                      autoComplete="off"
                      className="w-full rounded-lg border border-slate-600/50 bg-slate-900/70 py-1.5 pl-8 pr-8 text-xs text-slate-100 placeholder:text-slate-500 focus:border-green-500/40 focus:outline-none focus:ring-1 focus:ring-green-500/30"
                    />
                    {matchSearch ? (
                      <button
                        type="button"
                        onClick={() => setMatchSearch("")}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-700/60 hover:text-slate-200"
                        aria-label="Aramayı temizle"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {listPanelLoading ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12">
                  <div className="h-9 w-9 animate-spin motion-reduce:animate-none rounded-full border-2 border-green-500/30 border-t-green-500 motion-reduce:border-green-500/50" />
                  <p className="text-xs font-medium text-slate-500">
                    {loading ? 'Liste yükleniyor…' : 'Yayın uyumluluğu kontrol ediliyor…'}
                  </p>
                </div>
              ) : (
                <div
                  className="stream-panel-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {activeTab === 'matches' ? (
                    <RecentPicks
                      kind="match"
                      recent={recent}
                      list={hlsMatches}
                      onPick={selectMatch}
                    />
                  ) : (
                    <RecentPicks
                      kind="channel"
                      recent={recent}
                      list={allChannelsFlat}
                      onPick={selectChannel}
                    />
                  )}

                  {activeTab === 'matches' ? (
                    <MatchList
                      matches={filteredMatches}
                      totalMatchesCount={hlsMatches.length}
                      sourceMatchTotal={matches.length}
                      searchQuery={matchSearch}
                      onClearSearch={() => setMatchSearch("")}
                      selectedMatch={selectedMatch}
                      onMatchSelect={selectMatch}
                      logoState={logoState}
                      setLogoState={setLogoState}
                    />
                  ) : (
                    <ChannelList
                      channels={activeChannelList}
                      selectedMatch={selectedMatch}
                      onChannelSelect={selectChannel}
                    />
                  )}
                </div>
              )}
            </div>
          </aside>

          <section
            className={
              'order-1 min-w-0 xl:order-none ' + (!selectedMatch ? 'hidden xl:block' : '')
            }
          >
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
      <NewsTicker />
      <ScrollToTopButton />
      <StandaloneRefreshButton />
    </div>
  );
}

export default App;
