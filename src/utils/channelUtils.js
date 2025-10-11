// Kanal logoları için utility fonksiyonları

export const getChannelLogoPath = (channelName) => {
  if (!channelName) return '/chlogos/default.png';
  
  const channelMap = {
    // beIN Sports
    'bein sport 1': 'bein-sport-1.png',
    'bein sports 1': 'bein-sport-1.png',
    'beinsport 1': 'bein-sport-1.png',
    'bein sport 2': 'bein-sport-2.png',
    'bein sports 2': 'bein-sport-2.png',
    'beinsport 2': 'bein-sport-2.png',
    'bein sport 3': 'bein-sport-3.png',
    'bein sports 3': 'bein-sport-3.png',
    'beinsport 3': 'bein-sport-3.png',
    'bein sport 4': 'bein-sport-4.png',
    'bein sports 4': 'bein-sport-4.png',
    'beinsport 4': 'bein-sport-4.png',
    'bein sport 5': 'bein-sport-5.png',
    'bein sports 5': 'bein-sport-5.png',
    'beinsport 5': 'bein-sport-5.png',
    'bein sport 1 max': 'bein-sport-1-max.png',
    'bein sports 1 max': 'bein-sport-1-max.png',
    'bein sport 2 max': 'bein-sport-2-max.png',
    'bein sports 2 max': 'bein-sport-2-max.png',
    
    // A Spor
    'a spor': 'a-spor.png',
    'aspor': 'a-spor.png',
    'a sport': 'a-spor.png',
    
    // S Sport
    's sport': 's-sport.png',
    'ssport': 's-sport.png',
    's sport 1': 's-sport.png',
    's sport 2': 's-sport-2.png',
    'ssport 2': 's-sport-2.png',
    
    // TRT
    'trt spor': 'trt-spor.png',
    'trt sport': 'trt-spor.png',
    'trtspor': 'trt-spor.png',
    'trt 1': 'trt-1.png',
    'trt1': 'trt-1.png',
    'trt 2': 'trt-2.png',
    'trt2': 'trt-2.png',
    'trt yıldız': 'trt-yildiz.png',
    'trt yildiz': 'trt-yildiz.png',
    'trtyildiz': 'trt-yildiz.png',
    
    // Tivibu Spor
    'tivibu spor 1': 'tivibu-spor-1.png',
    'tivibu spor1': 'tivibu-spor-1.png',
    'tivibuspor 1': 'tivibu-spor-1.png',
    'tivibu spor 2': 'tivibu-spor-2.png',
    'tivibu spor2': 'tivibu-spor-2.png',
    'tivibuspor 2': 'tivibu-spor-2.png',
    'tivibu spor 3': 'tivibu-spor-3.png',
    'tivibu spor3': 'tivibu-spor-3.png',
    'tivibuspor 3': 'tivibu-spor-3.png',
    'tivibu spor 4': 'tivibu-spor-4.png',
    'tivibu spor4': 'tivibu-spor-4.png',
    'tivibuspor 4': 'tivibu-spor-4.png',
    
    // Spor Smart
    'spor smart': 'spor-smart.png',
    'sporsmart': 'spor-smart.png',
    'spor smart 1': 'spor-smart.png',
    'spor smart 2': 'spor-smart-2.png',
    'sporsmart 2': 'spor-smart-2.png',
    
    // Eurosport
    'eurosport 1': 'eurosport-1.png',
    'eurosport1': 'eurosport-1.png',
    'euro sport 1': 'eurosport-1.png',
    'eurosport 2': 'eurosport-2.png',
    'eurosport2': 'eurosport-2.png',
    'euro sport 2': 'eurosport-2.png',
    
    // Diğer kanallar
    'nba tv': 'nba-tv.png',
    'nbatv': 'nba-tv.png',
    'nba': 'nba-tv.png',
    'tv8': 'tv8.png',
    'tv 8': 'tv8.png',
    'tv8.5': 'tv8bucuk.png',
    'tv 8.5': 'tv8bucuk.png',
    'tv8 buçuk': 'tv8bucuk.png',
    'sky sports': 'skys.jpg',
    'skysports': 'skys.jpg',
    'sky sport': 'skys.jpg',
    'f1 tv': 'f1.png',
    'f1tv': 'f1.png',
    'f1': 'ff1.png',
    'formula 1': 'f1.png'
  };

  const normalizedName = channelName.toLowerCase().trim();
  
  // Önce tam eşleşme ara
  let fileName = channelMap[normalizedName];
  
  // Tam eşleşme yoksa kısmi eşleşme ara
  if (!fileName) {
    for (const [key, value] of Object.entries(channelMap)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        fileName = value;
        break;
      }
    }
  }
  
  return fileName ? `/chlogos/${fileName}` : '/chlogos/default.png';
};

// Maç için kanal tahmin etme fonksiyonu
export const getMatchChannel = (homeTeam, awayTeam, isLive = false) => {
  const bigTeams = ['galatasaray', 'fenerbahçe', 'beşiktaş', 'trabzonspor'];
  const home = homeTeam?.toLowerCase() || '';
  const away = awayTeam?.toLowerCase() || '';
  
  // Büyük takım maçları genelde beIN Sports'ta
  if (bigTeams.some(team => home.includes(team) || away.includes(team))) {
    return isLive ? 'beIN Sport 1' : 'beIN Sport 1';
  }
  
  // Diğer maçlar için rastgele kanal seçimi
  const channels = ['beIN Sport 2', 'beIN Sport 3', 'S Sport', 'TRT Spor'];
  return channels[Math.floor(Math.random() * channels.length)];
};