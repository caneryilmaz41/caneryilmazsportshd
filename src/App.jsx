import { useState, useMemo, useEffect, useRef } from 'react';
import Header from './components/Header';
import PrayerCountdown from './components/PrayerCountdown';
import Footer from './components/Footer';
import VideoPlayer from './components/VideoPlayer';
import MatchList from './components/MatchList';
import ChannelList from './components/ChannelList';
import LiveScoresSlider from './components/LiveScoresSlider';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import AppSplashScreen from './components/AppSplashScreen';
import StandaloneRefreshButton from './components/StandaloneRefreshButton';
import NewsTicker from './components/NewsTicker';
import ScrollToTopButton from './components/ScrollToTopButton';
import TabSelector from './components/TabSelector';
import ChannelHeaderSlider from './components/ChannelHeaderSlider';
import ScheduleList from './components/ScheduleList';
import MultiView from './components/MultiView';
import ReminderToast from './components/ReminderToast';

import { useStreamData } from './hooks/useStreamData';
import { useStreamPlayer } from './hooks/useStreamPlayer';
import { useRecentPicks } from './hooks/useRecentPicks';
import { parseMatchTeams } from './utils/teamUtils';
import RecentPicks from './components/RecentPicks';
import { useHlsMatchList } from './hooks/useHlsMatchList';
import { getFilteredChannels } from './utils/channelFilter';
import { getFilteredMatches } from './utils/matchFilter';
import { useFavorites, favKey } from './hooks/useFavorites';
import { useReminders } from './hooks/useReminders';
import { track } from './utils/analytics';

const SITE_TITLE = 'caneryılmazsports';

/** Favoriler üste; kendi aralarında ve diğerlerinde kaynak sırası korunur. */
function favoritesFirst(list, isFavItem) {
  const fav = [];
  const rest = [];
  for (const x of list) (isFavItem(x) ? fav : rest).push(x);
  return fav.length ? [...fav, ...rest] : list;
}

function App() {
  const [matchSearch, setMatchSearch] = useState("");
  const [channelKind, setChannelKind] = useState('tv');
  const [activeTab, setActiveTab] = useState('matches');
  const [logoState, setLogoState] = useState({});
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return localStorage.getItem('onboardingDismissed') !== '1';
    } catch {
      return true;
    }
  });
  
  const { matches: rawMatches, channels, belgeselChannels, loading } = useStreamData();
  const { favs, has: isFav, toggle: toggleFav } = useFavorites();
  const reminders = useReminders();
  const matches = useMemo(() => getFilteredMatches(rawMatches), [rawMatches]);
  const { hlsMatches } = useHlsMatchList(matches);
  const visibleMatches = useMemo(() => {
    // HLS probe boş dönerse liste tamamen kaybolmasın; ham maçları fallback göster.
    return hlsMatches.length > 0 ? hlsMatches : matches;
  }, [hlsMatches, matches]);
  const safeChannels = useMemo(() => {
    const merged = [...(channels || []), ...(belgeselChannels || [])];
    return getFilteredChannels(merged);
  }, [channels, belgeselChannels]);

  const tvSliderChannels = useMemo(() => getFilteredChannels(channels || []), [channels]);
  const belgeselSliderChannels = useMemo(
    () => getFilteredChannels(belgeselChannels || []),
    [belgeselChannels]
  );
  const headerSliderChannels = useMemo(
    () => (channelKind === 'tv' ? tvSliderChannels : belgeselSliderChannels),
    [channelKind, tvSliderChannels, belgeselSliderChannels]
  );

  const filteredMatches = useMemo(() => {
    const q = matchSearch.trim().toLowerCase();
    const isFavMatch = (m) => {
      const [h, a] = parseMatchTeams(m.name);
      return favs.has(favKey('team', h)) || favs.has(favKey('team', a));
    };
    if (!q) return favoritesFirst(visibleMatches, isFavMatch);
    return favoritesFirst(visibleMatches.filter((m) => {
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
    }), isFavMatch);
  }, [visibleMatches, matchSearch, favs]);
  const filteredChannels = useMemo(() => {
    const q = matchSearch.trim().toLowerCase();
    const isFavChannel = (c) => favs.has(favKey('channel', c.id));
    if (!q) return favoritesFirst(safeChannels, isFavChannel);
    return favoritesFirst(safeChannels.filter((c) => {
      const name = c.name?.toLowerCase() || "";
      const status = c.status?.toLowerCase() || "";
      const cat = c.category?.toLowerCase() || "";
      return name.includes(q) || status.includes(q) || cat.includes(q);
    }), isFavChannel);
  }, [safeChannels, matchSearch, favs]);
  const {
    selectedMatch,
    streamLoading,
    handleMatchSelect,
    retryStream,
  } = useStreamPlayer();

  // Çoklu izleme
  const [multiView, setMultiView] = useState(false);
  const [multiLayout, setMultiLayout] = useState(2);
  const [multiSlots, setMultiSlots] = useState([]);
  const [multiAudio, setMultiAudio] = useState(null);
  const [multiTarget, setMultiTarget] = useState(0);

  const addToMulti = (item) => {
    if (multiSlots.some((x) => x.id === item.id)) return;
    const next = [...multiSlots];
    if (next.length < multiLayout) {
      next.push(item);
      setMultiTarget(Math.min(next.length, multiLayout - 1));
    } else {
      next[Math.min(multiTarget, next.length - 1)] = item;
    }
    setMultiSlots(next);
    setMultiAudio((cur) => (cur != null && next.some((x) => x.id === cur) ? cur : item.id));
    track('multiview_add', { name: item.name });
  };
  const enterMultiView = () => {
    const seed = selectedMatch ? [{ ...selectedMatch }] : [];
    setMultiSlots(seed);
    setMultiAudio(seed[0]?.id ?? null);
    setMultiTarget(seed.length);
    setMultiView(true);
    track('multiview_open');
  };
  const removeFromMulti = (id) => {
    const next = multiSlots.filter((x) => x.id !== id);
    setMultiSlots(next);
    setMultiTarget(Math.min(next.length, multiLayout - 1));
    setMultiAudio((cur) => (cur === id ? null : cur));
  };
  const changeMultiLayout = (n) => {
    setMultiLayout(n);
    setMultiSlots((prev) => prev.slice(0, n));
    setMultiTarget((t) => Math.min(t, n - 1));
  };

  const { recent, addPick } = useRecentPicks();

  // Mobil/tablette oynatıcı listenin üstünde; seçim yapılınca oraya kaydır.
  const revealPlayer = () => {
    if (!window.matchMedia('(max-width: 1279px)').matches) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    requestAnimationFrame(() => {
      document.getElementById('player-section')?.scrollIntoView({
        behavior: reduce ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  };

  // Paylaşılabilir link: ?mac=<id> veya ?kanal=<id>
  const setShareParam = (kind, id) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('mac');
      url.searchParams.delete('kanal');
      if (id != null) url.searchParams.set(kind === 'channel' ? 'kanal' : 'mac', id);
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch {
      /* ignore */
    }
  };

  const openItem = (item, kind) => {
    const withKind = { ...item, kind };
    addPick({ id: item.id, name: item.name, kind });
    track(kind === 'channel' ? 'channel_select' : 'match_select', { name: item.name });
    if (multiView) {
      addToMulti(withKind);
      revealPlayer();
      return;
    }
    handleMatchSelect(withKind);
    setShareParam(kind, item.id);
    revealPlayer();
  };
  const selectMatch = (m) => openItem(m, 'match');
  const selectChannel = (c) => openItem(c, 'channel');

  // Linkle gelindiyse liste yüklenince o yayını aç (bir kez).
  const deepLinkDone = useRef(false);
  useEffect(() => {
    if (loading || deepLinkDone.current) return;
    deepLinkDone.current = true;
    const params = new URLSearchParams(window.location.search);
    const macId = params.get('mac');
    const kanalId = params.get('kanal');
    if (!macId && !kanalId) return;
    const found = macId
      ? visibleMatches.find((m) => String(m.id) === macId)
      : safeChannels.find((c) => String(c.id) === kanalId);
    if (found) {
      if (kanalId) setActiveTab('channels');
      openItem(found, macId ? 'match' : 'channel');
      track('deeplink_open', { name: found.name });
    } else {
      setShareParam(null, null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, visibleMatches, safeChannels]);

  // Sekme başlığı: izlenen yayın
  useEffect(() => {
    if (!selectedMatch?.name || multiView) {
      document.title = SITE_TITLE;
      return;
    }
    const teams = parseMatchTeams(selectedMatch.name);
    const label = selectedMatch.kind === 'match' && teams[0] && teams[1] ? `${teams[0]} – ${teams[1]}` : selectedMatch.name;
    document.title = `${label} canlı izle | ${SITE_TITLE}`;
  }, [selectedMatch?.name, selectedMatch?.kind, multiView]);

  // Klavye N/B ve oynatıcıdaki "Sonraki maç": görünen listede bir sonraki / önceki
  const stepSelection = (dir) => {
    const isChannel = selectedMatch?.kind === 'channel';
    const list = isChannel ? filteredChannels : filteredMatches;
    if (!list.length) return;
    const idx = list.findIndex((x) => x.id === selectedMatch?.id);
    const next = list[(idx + dir + list.length) % list.length];
    if (next) openItem(next, isChannel ? 'channel' : 'match');
  };

  const openFromReminder = (r) => {
    reminders.dismissToast();
    const m = visibleMatches.find((x) => x.id === r.id);
    if (m) {
      setActiveTab('matches');
      selectMatch(m);
    }
  };

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem('onboardingDismissed', '1');
  };

  const listPanelLoading = loading;
  const playerRailMatches = useMemo(() => {
    const source = filteredMatches.length > 0 ? filteredMatches : visibleMatches;
    if (!source.length) return [];

    const selectedId = selectedMatch?.id;
    const selectedItem = selectedId ? source.find((m) => m.id === selectedId) : null;
    const rest = source.filter((m) => m.id !== selectedId).slice(0, 7);
    return selectedItem ? [selectedItem, ...rest] : source.slice(0, 8);
  }, [filteredMatches, visibleMatches, selectedMatch]);

  return (
    <div className="min-h-screen pb-10 text-white antialiased sm:pb-11">
      <AppSplashScreen />
      <Header />
      <PrayerCountdown />

      <main className="mx-auto max-w-[1600px] px-3 pt-4 sm:px-4 lg:px-6 lg:pt-5">
        <div className="-mx-3 mb-4 sm:mx-0 lg:mb-5">
          <ChannelHeaderSlider
            channels={headerSliderChannels}
            selectedMatch={selectedMatch}
            onSelect={(c) => {
              setActiveTab('channels');
              selectChannel(c);
            }}
            channelKind={channelKind}
            onChannelKind={setChannelKind}
            showKindTabs={belgeselSliderChannels.length > 0}
            loading={loading}
          />
        </div>
        {/*
          Mobil: seçim yokken oynatıcı yok; maç/kanal seçilince oynatıcı üstte, liste altında.
          xl+: sol maç/kanallar | orta oynatıcı | sağ skorlar (seçim yokken de orta panel boş/placeholder)
        */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[minmax(270px,320px)_minmax(0,1fr)_minmax(250px,310px)] xl:items-start xl:gap-5">
          {/* Sol: sabit yükseklik + flex ile scroll her zaman çalışır */}
          <aside className="order-2 flex h-[min(560px,72dvh)] min-h-0 flex-col gap-3 xl:order-none xl:sticky xl:top-20 xl:h-[calc(100dvh-8.75rem)] xl:self-start">
            <div className="app-panel flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="app-panel-header flex shrink-0 items-center justify-between px-3.5 py-2.5">
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-300">
                  <span className="live-dot" aria-hidden />
                  {activeTab === 'matches' ? 'Canlı maçlar' : activeTab === 'program' ? 'Bugünün programı' : 'Canlı kanallar'}
                </span>
                <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-[10px] font-bold tabular-nums text-slate-400">
                  {activeTab !== 'channels'
                    ? (matchSearch.trim()
                      ? `${filteredMatches.length}/${visibleMatches.length}`
                      : visibleMatches.length)
                    : (matchSearch.trim()
                      ? `${filteredChannels.length}/${safeChannels.length}`
                      : safeChannels.length)}
                </span>
              </div>

              <div className="shrink-0 space-y-2 border-b border-white/[0.06] px-2.5 py-2.5">
                <TabSelector
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  matchesCount={visibleMatches.length}
                  channelsCount={safeChannels.length}
                />
                {multiView ? (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-2 py-1.5">
                    <p className="text-[11px] text-sky-200">Çoklu izleme açık: seçtiğin yayın kutulara eklenir.</p>
                    <button
                      type="button"
                      onClick={() => setMultiView(false)}
                      className="shrink-0 rounded px-1.5 text-[11px] font-semibold text-sky-200 hover:bg-sky-500/20"
                    >
                      Kapat
                    </button>
                  </div>
                ) : null}
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
                    className="w-full rounded-xl border border-white/[0.08] bg-slate-950/60 py-2 pl-8 pr-8 text-base text-slate-100 transition placeholder:text-slate-500 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 xl:text-xs"
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

              {listPanelLoading ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12">
                  <div className="h-9 w-9 animate-spin motion-reduce:animate-none rounded-full border-2 border-green-500/30 border-t-green-500 motion-reduce:border-green-500/50" />
                  <p className="text-xs font-medium text-slate-500">Liste yükleniyor…</p>
                </div>
              ) : (
                <div
                  className="stream-panel-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain"
                  style={{ WebkitOverflowScrolling: 'touch' }}
                >
                  {activeTab === 'matches' ? (
                    <>
                      <RecentPicks
                        kind="match"
                        recent={recent}
                        list={visibleMatches}
                        onPick={selectMatch}
                      />
                      <MatchList
                        matches={filteredMatches}
                        totalMatchesCount={visibleMatches.length}
                        sourceMatchTotal={matches.length}
                        searchQuery={matchSearch}
                        onClearSearch={() => setMatchSearch("")}
                        selectedMatch={selectedMatch}
                        onMatchSelect={selectMatch}
                        logoState={logoState}
                        setLogoState={setLogoState}
                        isFav={isFav}
                        onToggleFav={toggleFav}
                        hasReminder={reminders.has}
                        onToggleReminder={reminders.toggle}
                      />
                    </>
                  ) : activeTab === 'program' ? (
                    <ScheduleList
                      matches={filteredMatches}
                      selectedMatch={selectedMatch}
                      onMatchSelect={selectMatch}
                      isFav={isFav}
                      hasReminder={reminders.has}
                      onToggleReminder={reminders.toggle}
                    />
                  ) : (
                    <>
                      <RecentPicks
                        kind="channel"
                        recent={recent}
                        list={safeChannels}
                        onPick={selectChannel}
                      />
                      <ChannelList
                        channels={filteredChannels}
                        selectedMatch={selectedMatch}
                        onChannelSelect={selectChannel}
                        isFav={isFav}
                        onToggleFav={toggleFav}
                      />
                    </>
                  )}
                </div>
              )}
            </div>
          </aside>

          <section
            id="player-section"
            className={
              'order-1 min-w-0 scroll-mt-[4.5rem] md:col-span-2 xl:order-none xl:col-span-1 ' +
              (!selectedMatch && !multiView ? 'hidden xl:block' : '')
            }
          >
            <div className="app-panel relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-sky-500/[0.03]" />
              <div className="relative">
                {multiView ? (
                  <MultiView
                    slots={multiSlots}
                    layout={multiLayout}
                    onLayout={changeMultiLayout}
                    onRemove={removeFromMulti}
                    onExit={() => setMultiView(false)}
                    audioId={multiAudio}
                    onAudio={setMultiAudio}
                    targetIndex={multiTarget}
                    onTarget={setMultiTarget}
                  />
                ) : (
                  <VideoPlayer
                    selectedMatch={selectedMatch}
                    streamLoading={streamLoading}
                    logoState={logoState}
                    setLogoState={setLogoState}
                    playerMatches={playerRailMatches}
                    onRailMatchSelect={selectMatch}
                    onRetry={retryStream}
                    onStep={stepSelection}
                    onMultiView={enterMultiView}
                  />
                )}
              </div>
            </div>
          </section>

          <aside className="order-3 flex h-[min(560px,72dvh)] min-h-0 flex-col xl:order-none xl:sticky xl:top-20 xl:h-[calc(100dvh-8.75rem)] xl:self-start">
            <LiveScoresSlider variant="sidebar" />
          </aside>
        </div>
      </main>
      <Footer />
      <PWAInstallPrompt />
      <NewsTicker />
      <ScrollToTopButton />
      <StandaloneRefreshButton />
      <ReminderToast reminder={reminders.toast} onOpen={openFromReminder} onClose={reminders.dismissToast} />
    </div>
  );
}

export default App;
