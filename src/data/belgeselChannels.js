/**
 * iptv-org tr.m3u / kamusal yayınlardan derlenen belgesel + doğa kanalları.
 * teletv3 id zinciri yok; doğrudan HLS (hlsUrl) ile oynatılır.
 */
export const belgeselChannels = [
  {
    id: 'ext-iptv-trt-belgesel',
    name: 'TRT Belgesel',
    status: '7/24',
    category: 'belgesel',
    hlsUrl: 'https://tv-trtbelgesel.medya.trt.com.tr/master.m3u8',
  },
  {
    id: 'ext-iptv-cgtn-documentary',
    name: 'CGTN Documentary',
    status: '7/24',
    category: 'belgesel',
    hlsUrl: 'https://mn-nl.mncdn.com/dogusdyg_drone/cgtn/playlist.m3u8',
  },
  {
    id: 'ext-iptv-nat-geo',
    name: 'National Geographic',
    status: '7/24',
    category: 'belgesel',
    hlsUrl: 'https://saran-live.ercdn.net/natgeohd/index.m3u8',
  },
  {
    id: 'ext-iptv-nat-geo-wild',
    name: 'National Geographic Wild',
    status: '7/24',
    category: 'belgesel',
    hlsUrl: 'https://saran-live.ercdn.net/natgeowild/index.m3u8',
  },
  {
    id: 'ext-iptv-natural-tv',
    name: 'Natural TV',
    status: '7/24',
    category: 'belgesel',
    hlsUrl: 'https://edge1.socialsmart.tv/naturaltv/bant1/playlist.m3u8',
  },
  {
    id: 'ext-iptv-tarih-tv',
    name: 'Tarih TV',
    status: '7/24',
    category: 'belgesel',
    hlsUrl: 'https://tv1.arectv30.sbs/live/tarihtv.m3u8',
  },
  {
    id: 'ext-iptv-tgrt-belgesel',
    name: 'TGRT Belgesel',
    status: '7/24',
    category: 'belgesel',
    hlsUrl: 'https://tv.ensonhaber.com/tv/tr/tgrtbelgesel/index.m3u8',
  },
  {
    id: 'ext-iptv-tarim',
    name: 'Tarım TV',
    status: '7/24',
    category: 'belgesel',
    hlsUrl: 'https://content.tvkur.com/l/c7e1da7mm25p552d9u9g/master.m3u8',
  },
  {
    id: 'ext-iptv-viasat-explore',
    name: 'Viasat Explore',
    status: '7/24',
    category: 'belgesel',
    hlsUrl: 'https://tv.arectv29.sbs/live/viasathistory.m3u8',
  },
];
