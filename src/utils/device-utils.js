// A bit naive method...
export const isMobile = 
  ((navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i)) !== null) ||
  // is iPadOs
  (navigator.userAgent.indexOf('Macintosh') > -1 && 'ontouchend' in document);