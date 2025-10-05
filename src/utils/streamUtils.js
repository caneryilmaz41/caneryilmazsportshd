// Base64 stream URL utilities

// Encode stream URL to Base64
export const encodeStreamUrl = (url) => {
  try {
    return btoa(url)
  } catch (error) {
    console.error('URL encode error:', error)
    return url
  }
}

// Decode Base64 stream URL
export const decodeStreamUrl = (encodedUrl) => {
  try {
    return atob(encodedUrl)
  } catch (error) {
    console.error('URL decode error:', error)
    return encodedUrl
  }
}

// Check if string is Base64 encoded
export const isBase64Encoded = (str) => {
  try {
    return btoa(atob(str)) === str
  } catch (error) {
    return false
  }
}

// Browser compatibility check for stream blocking
export const checkBrowserCompatibility = () => {
  const userAgent = navigator.userAgent
  const warnings = []
  
  if (userAgent.includes('Brave')) {
    warnings.push('Brave tarayıcısında kalkan simgesine tıklayıp "Shields down" yapın')
  }
  
  if (userAgent.includes('SamsungBrowser')) {
    warnings.push('Samsung Internet tarayıcısında sorun yaşıyorsanız, Chrome veya Firefox kullanmayı deneyin')
  }
  
  if (userAgent.includes('Opera')) {
    warnings.push('Opera\'da reklam engelleyici kapalı olduğundan emin olun')
  }
  
  return warnings
}

// Show browser warning if needed
export const showBrowserWarning = () => {
  const warnings = checkBrowserCompatibility()
  
  if (warnings.length > 0) {
    const warningDiv = document.createElement('div')
    warningDiv.className = 'browser-warning'
    warningDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(239, 68, 68, 0.95);
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 9999;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      ">
        <div style="font-weight: bold; margin-bottom: 8px;">⚠️ Tarayıcı Uyarısı</div>
        ${warnings.map(warning => `<div style="margin-bottom: 4px;">• ${warning}</div>`).join('')}
        <button onclick="this.parentElement.parentElement.remove()" style="
          position: absolute;
          top: 8px;
          right: 8px;
          background: none;
          border: none;
          color: white;
          font-size: 16px;
          cursor: pointer;
        ">×</button>
      </div>
    `
    
    document.body.appendChild(warningDiv)
    
    // Auto remove after 10 seconds
    setTimeout(() => {
      if (warningDiv.parentElement) {
        warningDiv.remove()
      }
    }, 10000)
  }
}