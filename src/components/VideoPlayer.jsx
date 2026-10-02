import { useEffect, useMemo, useRef, useState } from 'react';
import TeamLogo from './TeamLogo';
import { parseMatchTeams } from '../utils/teamUtils';
import { SPLASH_BG } from './AppSplashScreen';
import ChannelLogoImg from './ChannelLogoImg';
import { isTrgoolSiteUrl } from '../utils/trgoolEmbedUrl';
import { useMatchScore } from '../hooks/useMatchScore';
import { reportStream, REPORT_REASONS, wasReportedRecently } from '../services/reportStream';
import { track } from '../utils/analytics';
import { CloseIcon, FlagIcon, GridIcon, KeyboardIcon, RefreshIcon, ShareIcon } from './icons';

const PLAYER_UI_VERSION = 'corner-big-ctrl-hide-2026-08-16';
const MAX_AUTO_RETRY = 2;
const MAX_TOTAL_ATTEMPTS = 5;

const SHORTCUTS = [
  ['F', 'Tam ekran'],
  ['M', 'Sesi aç / kapat'],
  ['K', 'Oynat / duraklat'],
  ['P', 'Küçük pencere (PiP)'],
  ['R', 'Yayını yenile'],
  ['N / B', 'Sonraki / önceki maç'],
];

function isTypingTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

function detectIsChannel(item) {
  if (!item) return false;
  if (item.kind === 'channel') return true;
  if (item.kind === 'match') return false;
  const name = item.name || '';
  const teams = parseMatchTeams(name);
  const hasMatchSeparator = name.includes(' vs ') || name.includes(' - ') || name.includes(' x ');
  const lower = name.toLowerCase();
  const looksLikeChannel = ['tv', 'spor', 'sport', 'kanal'].some((w) => lower.includes(w));
  return !hasMatchSeparator && (looksLikeChannel || !teams[0] || !teams[1]);
}

function scoreLabel(score) {
  if (!score) return null;
  if (score.isFinished) return 'MS';
  return score.minute || 'CANLI';
}

function Popover({ open, onClose, children, className = '' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Kapat" onClick={onClose} />
      <div
        className={`absolute right-0 top-full z-50 mt-2 w-60 rounded-xl border border-white/[0.1] bg-slate-900/95 p-2 shadow-2xl backdrop-blur ${className}`}
      >
        {children}
      </div>
    </>
  );
}

const barBtn =
  'inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-slate-200 transition hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-200';

const VideoPlayer = ({
  selectedMatch,
  streamLoading,
  logoState,
  setLogoState,
  playerMatches = [],
  onRailMatchSelect,
  onRetry,
  onStep,
  onMultiView,
}) => {
  const [reloadKey, setReloadKey] = useState(0);
  const [fakeFs, setFakeFs] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | playing | retrying | failed
  const [menu, setMenu] = useState(null); // 'report' | 'keys' | null
  const [notice, setNotice] = useState('');
  const [inView, setInView] = useState(true);
  const [miniClosed, setMiniClosed] = useState(false);
  const iframeRef = useRef(null);
  const boxRef = useRef(null);
  const failRef = useRef(0);
  const retryTimer = useRef(null);
  const noticeTimer = useRef(null);

  const isChannel = detectIsChannel(selectedMatch);
  const teams = useMemo(() => parseMatchTeams(selectedMatch?.name || ''), [selectedMatch?.name]);
  const score = useMatchScore(teams, Boolean(selectedMatch) && !isChannel);

  // Maç şeridi seçim anında dondurulur: favori ekleme / arama sırayı değiştirse de yayın yeniden yüklenmesin.
  const railPayload = useMemo(
    () =>
      (playerMatches || []).map((m) => ({
        id: m.id,
        name: m.name,
        league: m.league || '',
        time: m.time || '',
        homeLogo: m.homeLogo || '',
        awayLogo: m.awayLogo || '',
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedMatch?.id]
  );

  // Mesaj ve klavye dinleyicileri tek sefer bağlanır; güncel değerler ref'ten okunur.
  const latest = useRef({});
  latest.current = { selectedMatch, playerMatches, onRailMatchSelect, onRetry, onStep, isChannel };

  const flash = (text) => {
    setNotice(text);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(''), 2200);
  };

  const postCmd = (cmd) => {
    try {
      iframeRef.current?.contentWindow?.postMessage({ type: 'player:cmd', cmd }, '*');
    } catch {
      /* ignore */
    }
  };

  const reload = () => {
    clearTimeout(retryTimer.current);
    setStatus('idle');
    setReloadKey((prev) => prev + 1);
  };

  const runRetry = () => {
    const { onRetry: retry } = latest.current;
    clearTimeout(retryTimer.current);
    setStatus('retrying');
    retryTimer.current = setTimeout(() => {
      if (retry) retry();
      else reload();
    }, 1200);
  };

  useEffect(() => {
    const onMessage = (event) => {
      const data = event?.data;
      if (!data) return;
      const cur = latest.current;
      if (data.type === 'player:fake-fs') {
        setFakeFs(!!data.on);
        document.documentElement.classList.toggle('player-fake-fs', !!data.on);
        document.body.classList.toggle('player-fake-fs', !!data.on);
        return;
      }
      if (data.type === 'player:select-match') {
        if (!data.id || typeof cur.onRailMatchSelect !== 'function') return;
        const picked = (cur.playerMatches || []).find((m) => m.id === data.id);
        if (picked) cur.onRailMatchSelect(picked);
        return;
      }
      // Aşağıdakiler sadece bu oynatıcının iframe'inden gelirse geçerli.
      if (!iframeRef.current || event.source !== iframeRef.current.contentWindow) return;
      const m = cur.selectedMatch;
      if (data.type === 'player:playing') {
        failRef.current = 0;
        setStatus('playing');
        track('stream_play', { kind: cur.isChannel ? 'channel' : 'match', name: m?.name || '' });
      } else if (data.type === 'player:error') {
        const attempts = m?.attempt || 0;
        if (failRef.current < MAX_AUTO_RETRY && attempts < MAX_TOTAL_ATTEMPTS) {
          failRef.current += 1;
          runRetry();
        } else {
          setStatus('failed');
          track('stream_error', { name: m?.name || '' });
          reportStream({
            id: m?.id,
            name: m?.name,
            kind: cur.isChannel ? 'channel' : 'match',
            src: m?.url || '',
            reason: 'otomatik',
          });
        }
      } else if (data.type === 'player:key') {
        handleKey(data.key);
      }
    };

    const handleKey = (key) => {
      const k = String(key || '').toLowerCase();
      if (k === 'r') {
        reload();
        flash('Yayın yenileniyor');
      } else if (k === 'n' || k === 'arrowdown') latest.current.onStep?.(1);
      else if (k === 'b' || k === 'arrowup') latest.current.onStep?.(-1);
    };

    const onKey = (e) => {
      if (!latest.current.selectedMatch) return;
      if (e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return;
      const k = (e.key || '').toLowerCase();
      if (k === 'f') postCmd('fs');
      else if (k === 'm') postCmd('mute');
      else if (k === 'p') postCmd('pip');
      else if (k === 'k') postCmd('play');
      else if (k === '?') setMenu((v) => (v === 'keys' ? null : 'keys'));
      else if (k === 'r' || k === 'n' || k === 'b') handleKey(k);
      else return;
      e.preventDefault();
    };

    window.addEventListener('message', onMessage);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('message', onMessage);
      window.removeEventListener('keydown', onKey);
      clearTimeout(retryTimer.current);
      clearTimeout(noticeTimer.current);
      document.documentElement.classList.remove('player-fake-fs');
      document.body.classList.remove('player-fake-fs');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setReloadKey(0);
    setFakeFs(false);
    document.documentElement.classList.remove('player-fake-fs');
    document.body.classList.remove('player-fake-fs');
  }, [selectedMatch?.id, selectedMatch?.url, selectedMatch?.streamType]);

  useEffect(() => {
    failRef.current = 0;
    clearTimeout(retryTimer.current);
    setStatus('idle');
    setMenu(null);
    setMiniClosed(false);
  }, [selectedMatch?.id]);

  useEffect(() => {
    if (!fakeFs) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      setFakeFs(false);
      document.documentElement.classList.remove('player-fake-fs');
      document.body.classList.remove('player-fake-fs');
      try {
        iframeRef.current?.contentWindow?.postMessage({ type: 'player:exit-fake-fs' }, '*');
      } catch {
        /* ignore */
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fakeFs]);

  // Oynatıcı ekrandan çıkınca köşede mini oynatıcı olarak devam et.
  const hasSelection = Boolean(selectedMatch);
  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting) setMiniClosed(false);
      },
      { rootMargin: '-64px 0px 0px 0px', threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasSelection]);

  if (!selectedMatch) {
    return (
      <div>
        <div
          className="relative aspect-video flex flex-col justify-center text-center overflow-hidden"
          style={{
            backgroundImage:
              'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9)), url("https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="relative z-10 p-4 lg:p-12">
            <div className="mb-4 lg:mb-8">
              <img src="/logom.png" alt="Logo" className="h-10 lg:h-24 mx-auto opacity-90" />
            </div>
            <h2 className="text-lg lg:text-3xl font-light mb-3 lg:mb-6 text-white tracking-wide">
              YAYIN BAŞLIYOR
            </h2>
            <div className="w-16 lg:w-24 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent mx-auto mb-4 lg:mb-8"></div>
            <div className="inline-flex items-center gap-2 bg-black/30 border border-green-500/30 px-3 lg:px-4 py-1.5 lg:py-2 rounded-full mb-3 lg:mb-6">
              <span className="live-dot" aria-hidden />
              <span className="text-green-400 font-medium text-xs lg:text-sm tracking-wider">CANLI</span>
            </div>
            <p className="text-slate-300 text-xs lg:text-base font-light tracking-wide opacity-80 px-2">
              Bir maç veya kanal seçin
            </p>
            {onMultiView ? (
              <button type="button" onClick={onMultiView} className={`${barBtn} mx-auto mt-4 hidden md:inline-flex`}>
                <GridIcon /> Çoklu izle
              </button>
            ) : null}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-green-500/5 to-transparent pointer-events-none"></div>
        </div>
      </div>
    );
  }

  const hlsSrc = selectedMatch.url && !isTrgoolSiteUrl(selectedMatch.url) ? selectedMatch.url : '';
  const useOwnPlayer = selectedMatch.streamType === 'hls' && hlsSrc;
  const playerSrc = useOwnPlayer
    ? `/player.html?ui=${encodeURIComponent(PLAYER_UI_VERSION)}&src=${encodeURIComponent(hlsSrc)}&rail=${encodeURIComponent(JSON.stringify(railPayload))}&selected=${encodeURIComponent(selectedMatch.id || '')}`
    : '';
  const isInvalidPlayerSrc =
    !playerSrc ||
    playerSrc === '/' ||
    playerSrc === window.location.pathname ||
    playerSrc === window.location.href;

  const mini = !inView && !miniClosed && !fakeFs && !streamLoading && !isInvalidPlayerSrc;
  const kindParam = isChannel ? 'kanal' : 'mac';
  const shareUrl = `${window.location.origin}/?${kindParam}=${encodeURIComponent(selectedMatch.id)}`;
  const showScore = score && (score.isLive || score.isFinished) && score.homeScore != null;
  const [ourHome, ourAway] = showScore
    ? score.swapped
      ? [score.awayScore, score.homeScore]
      : [score.homeScore, score.awayScore]
    : [null, null];

  const share = async () => {
    const title = isChannel ? `${selectedMatch.name} canlı` : `${teams[0]} – ${teams[1]} canlı`;
    track('share', { name: selectedMatch.name });
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `${title} · caneryılmazsports`, url: shareUrl });
      } catch {
        /* kullanıcı vazgeçti */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      flash('Link kopyalandı');
    } catch {
      window.prompt('Linki kopyala:', shareUrl);
    }
  };

  const sendReport = async (reason) => {
    setMenu(null);
    if (wasReportedRecently(selectedMatch.id)) {
      flash('Bu yayın zaten bildirildi, teşekkürler');
      return;
    }
    const ok = await reportStream({
      id: selectedMatch.id,
      name: selectedMatch.name,
      kind: isChannel ? 'channel' : 'match',
      src: selectedMatch.url || '',
      reason,
    });
    flash(ok ? 'Bildirimin alındı, teşekkürler' : 'Bildirim gönderilemedi');
  };

  const scrollToPlayer = () => {
    boxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div>
      <div className="border-b border-white/[0.06] bg-slate-950/50 px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-300 ring-1 ring-red-500/30">
              <span className="live-dot !h-1.5 !w-1.5" aria-hidden />
              Canlı
            </span>
            {selectedMatch.league || selectedMatch.category ? (
              <span className="truncate text-[11px] font-medium text-slate-400">
                {selectedMatch.league || selectedMatch.category}
              </span>
            ) : null}
            {selectedMatch.special && (
              <span className="hidden shrink-0 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300 ring-1 ring-amber-500/25 sm:inline">
                ★ {selectedMatch.special}
              </span>
            )}
          </div>
          {!fakeFs ? (
            <div className="relative flex shrink-0 items-center gap-1.5">
              <button type="button" onClick={share} className={barBtn} title="Paylaş / linki kopyala" aria-label="Paylaş">
                <ShareIcon />
                <span className="hidden lg:inline">Paylaş</span>
              </button>
              <button
                type="button"
                onClick={() => setMenu((v) => (v === 'report' ? null : 'report'))}
                className={barBtn}
                title="Yayın sorununu bildir"
                aria-label="Sorun bildir"
                aria-expanded={menu === 'report'}
              >
                <FlagIcon />
                <span className="hidden lg:inline">Bildir</span>
              </button>
              <button
                type="button"
                onClick={() => setMenu((v) => (v === 'keys' ? null : 'keys'))}
                className={`${barBtn} hidden md:inline-flex`}
                title="Klavye kısayolları (?)"
                aria-label="Klavye kısayolları"
                aria-expanded={menu === 'keys'}
              >
                <KeyboardIcon />
              </button>
              {onMultiView ? (
                <button type="button" onClick={onMultiView} className={`${barBtn} hidden md:inline-flex`} title="Çoklu izle">
                  <GridIcon />
                  <span className="hidden xl:inline">Çoklu</span>
                </button>
              ) : null}
              <button type="button" onClick={reload} className={barBtn} title="Yayını yenile (R)">
                <RefreshIcon />
                <span className="hidden min-[380px]:inline">Yenile</span>
              </button>

              <Popover open={menu === 'report'} onClose={() => setMenu(null)}>
                <p className="px-2 pb-1.5 pt-1 text-[11px] font-semibold text-slate-300">Sorun nedir?</p>
                {REPORT_REASONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => sendReport(r.id)}
                    className="block w-full rounded-lg px-2 py-1.5 text-left text-xs text-slate-200 hover:bg-white/[0.06]"
                  >
                    {r.label}
                  </button>
                ))}
              </Popover>
              <Popover open={menu === 'keys'} onClose={() => setMenu(null)}>
                <p className="px-2 pb-1.5 pt-1 text-[11px] font-semibold text-slate-300">Klavye kısayolları</p>
                <ul className="space-y-1 px-2 pb-1">
                  {SHORTCUTS.map(([k, label]) => (
                    <li key={k} className="flex items-center justify-between gap-3 text-xs text-slate-300">
                      <span>{label}</span>
                      <kbd className="rounded border border-white/[0.15] bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-slate-200">
                        {k}
                      </kbd>
                    </li>
                  ))}
                </ul>
              </Popover>
            </div>
          ) : null}
        </div>

        {isChannel ? (
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-950/60 ring-1 ring-white/[0.08]">
              <ChannelLogoImg channelName={selectedMatch.name} className="h-7 w-7 object-contain" />
            </div>
            <span className="truncate text-base font-bold text-white sm:text-lg">{selectedMatch.name}</span>
          </div>
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4">
            <div className="flex min-w-0 items-center justify-end gap-2">
              <span className="truncate text-right text-sm font-bold text-white sm:text-base">{teams[0]}</span>
              {selectedMatch.homeLogo ? (
                <img src={selectedMatch.homeLogo} alt="" className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8" />
              ) : streamLoading ? (
                <div className="h-7 w-7 shrink-0 rounded-md bg-slate-600/30" />
              ) : teams[0] ? (
                <TeamLogo teamName={teams[0]} logoState={logoState} setLogoState={setLogoState} size="sm" />
              ) : null}
            </div>

            {showScore ? (
              <div
                className={`flex shrink-0 flex-col items-center justify-center rounded-lg px-3 py-1 ring-1 ${
                  score.isLive ? 'bg-red-500/10 ring-red-500/30' : 'bg-white/[0.05] ring-white/[0.08]'
                }`}
                aria-label={`Skor ${ourHome} - ${ourAway}`}
              >
                <span className="text-base font-extrabold tabular-nums leading-tight text-white sm:text-lg">
                  {ourHome} <span className="text-slate-500">-</span> {ourAway}
                </span>
                <span className={`text-[10px] font-bold tabular-nums ${score.isLive ? 'text-red-300' : 'text-slate-400'}`}>
                  {scoreLabel(score)}
                </span>
              </div>
            ) : (
              <div className="flex shrink-0 flex-col items-center justify-center rounded-lg bg-white/[0.05] px-2.5 py-1 ring-1 ring-white/[0.06]">
                <span className="text-[10px] font-bold tracking-wider text-slate-400">VS</span>
                {selectedMatch.time && (
                  <span className="text-[11px] font-bold tabular-nums text-emerald-300">{selectedMatch.time}</span>
                )}
              </div>
            )}

            <div className="flex min-w-0 items-center gap-2">
              {selectedMatch.awayLogo ? (
                <img src={selectedMatch.awayLogo} alt="" className="h-7 w-7 shrink-0 object-contain sm:h-8 sm:w-8" />
              ) : streamLoading ? (
                <div className="h-7 w-7 shrink-0 rounded-md bg-slate-600/30" />
              ) : teams[1] ? (
                <TeamLogo teamName={teams[1]} logoState={logoState} setLogoState={setLogoState} size="sm" />
              ) : null}
              <span className="truncate text-sm font-bold text-white sm:text-base">{teams[1]}</span>
            </div>
          </div>
        )}
      </div>

      <div ref={boxRef} className="relative aspect-video bg-black">
        {mini ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
            Yayın köşedeki mini oynatıcıda devam ediyor
          </div>
        ) : null}
        <div
          id="video-player"
          className={
            fakeFs
              ? 'player-shell-fs fixed inset-0 z-[2147483000] bg-black p-0'
              : mini
                ? 'fixed bottom-14 left-3 z-50 w-[min(64vw,340px)] overflow-hidden rounded-xl bg-black shadow-2xl shadow-black/60 ring-1 ring-white/15 sm:bottom-16 sm:left-4 sm:w-[360px]'
                : 'absolute inset-0'
          }
        >
          {mini ? (
            <div className="flex items-center gap-2 bg-slate-900/95 px-2 py-1">
              <span className="live-dot !h-1.5 !w-1.5 shrink-0" aria-hidden />
              <button
                type="button"
                onClick={scrollToPlayer}
                className="min-w-0 flex-1 truncate text-left text-[11px] font-semibold text-slate-200 hover:text-white"
                title="Oynatıcıya dön"
              >
                {selectedMatch.name}
              </button>
              <button
                type="button"
                onClick={() => setMiniClosed(true)}
                className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Mini oynatıcıyı kapat"
              >
                <CloseIcon />
              </button>
            </div>
          ) : null}
          <div
            className={
              fakeFs
                ? 'h-full w-full overflow-hidden'
                : mini
                  ? 'relative aspect-video w-full overflow-hidden'
                  : 'relative h-full w-full overflow-hidden'
            }
          >
            {streamLoading ? (
              <div
                className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden"
                style={{
                  backgroundImage: SPLASH_BG,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-slate-950/50 pointer-events-none" />
                <div className="relative z-10 w-full max-w-sm px-5 text-center">
                  <div className="rounded-2xl border border-white/12 bg-slate-900/55 px-6 py-6 shadow-2xl backdrop-blur-sm">
                    <img
                      src="/logom.png"
                      alt=""
                      className="mx-auto h-9 w-auto object-contain opacity-[0.97] sm:h-11"
                      decoding="async"
                    />
                    {isChannel ? (
                      <div className="mt-4 flex flex-col items-center gap-1.5">
                        <div className="flex items-center justify-center gap-2.5">
                          <div className="h-8 w-8 shrink-0">
                            <ChannelLogoImg channelName={selectedMatch.name} className="h-8 w-8 object-contain" />
                          </div>
                          <span className="line-clamp-2 text-left text-sm font-semibold text-slate-100">
                            {selectedMatch.name}
                          </span>
                        </div>
                      </div>
                    ) : teams[0] || teams[1] ? (
                      <p className="mt-4 line-clamp-2 text-sm font-semibold text-slate-100">
                        {[teams[0], teams[1]].filter(Boolean).join(' — ')}
                      </p>
                    ) : null}
                    <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-400/90">
                      {status === 'retrying'
                        ? `Yedek kaynak deneniyor (${failRef.current}/${MAX_AUTO_RETRY})`
                        : 'Yayın açılıyor'}
                    </p>
                    <div className="mt-3 h-0.5 w-36 max-w-full overflow-hidden rounded-full bg-slate-800/90">
                      <div className="relative h-full w-full">
                        <div className="stream-open-shine" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : isInvalidPlayerSrc ? (
              <div className="w-full h-full bg-slate-900 flex items-center justify-center text-center px-4">
                <div>
                  <p className="text-sm text-slate-200 font-medium">Yayın adresi alınamadı</p>
                  <p className="text-xs text-slate-400 mt-1">Lütfen başka bir maç veya kanal seçin</p>
                  {onRetry ? (
                    <button type="button" onClick={() => { failRef.current = 0; onRetry(); }} className={`${barBtn} mt-3`}>
                      <RefreshIcon /> Tekrar dene
                    </button>
                  ) : null}
                </div>
              </div>
            ) : (
              <>
                <iframe
                  ref={iframeRef}
                  key={`${selectedMatch.id || selectedMatch.url}-${reloadKey}-${selectedMatch.attempt || 0}`}
                  title="Canlı yayın"
                  src={playerSrc}
                  className="w-full h-full border-0 bg-black"
                  allowFullScreen
                  webkitallowfullscreen="true"
                  mozallowfullscreen="true"
                  allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                />
                {status === 'retrying' ? (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80 px-4 text-center backdrop-blur-sm">
                    <div>
                      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400 motion-reduce:animate-none" />
                      <p className="text-sm font-semibold text-slate-100">Yayın açılamadı, yedek kaynak deneniyor…</p>
                      <p className="mt-1 text-xs text-slate-400">Deneme {failRef.current}/{MAX_AUTO_RETRY}</p>
                    </div>
                  </div>
                ) : status === 'failed' ? (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/85 px-4 text-center backdrop-blur-sm">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">Bu yayın şu an açılmıyor</p>
                      <p className="mt-1 text-xs text-slate-400">Sorunu otomatik olarak bildirdik. Başka bir maç veya kanal deneyebilirsin.</p>
                      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                        <button type="button" onClick={() => { failRef.current = 0; runRetry(); }} className={barBtn}>
                          <RefreshIcon /> Tekrar dene
                        </button>
                        {onStep ? (
                          <button type="button" onClick={() => onStep(1)} className={barBtn}>
                            Sonraki maç →
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>

      {notice ? (
        <div
          role="status"
          className="pointer-events-none fixed left-1/2 top-20 z-[60] -translate-x-1/2 rounded-full border border-emerald-500/30 bg-slate-900/95 px-4 py-2 text-xs font-semibold text-emerald-200 shadow-xl backdrop-blur"
        >
          {notice}
        </div>
      ) : null}
    </div>
  );
};

export default VideoPlayer;
