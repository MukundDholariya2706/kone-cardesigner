
export const getLink = (design = {}, edited) => {

  
  const parts = window.location.hash.split('/').slice(1) // cut out the hash #
  
  // Link from gendoc viewer
  if (parts[0] === 'doc') {
    return getDesignSpecificationURL(design, edited)
  }

  // '/edit' --> '/specification'
  const editIndex = parts.findIndex(val => val === 'edit')
  parts[editIndex] = 'specification'
  
  if (edited) {
    // '/:sapId' --> '/custom'
    const lastIndex = parts.length - 1
    parts[lastIndex] = 'custom'
  }

  return '/' + parts.join('/')
}

export const getShareLink = (hiddenId, isMarine, domainCountry) => {
  if (!hiddenId) return
  const specifier = domainCountry.requireAuth ? 'doc' : 'share'
  return `${window.location.origin}/#/${isMarine ? 'marine/' : ''}${specifier}/${hiddenId}`
}

/**
 * Gets the url for the design specification page of a given design.
 */
export function getDesignSpecificationURL(design = {}, edited, ktocRenderDone) {
  let url = ''

  if (!design.country || !design.productId || !design.sapId) {
    console.error('Design is missing "country", "productId" or "sapId"')
    return url
  }

  // For marine, design country is 'marine' so the marine building type
  // should not be added
  if (design.buildingsType && design.buildingsType !== 'marine') {
    url += `/${design.buildingsType}`
  }

  url += `/${design.country.toLowerCase()}/${design.productId}`

  if (design.releaseId) {
    url += `/${design.releaseId}`
  }

  url += `/specification`

  if (edited) {
    url += '/custom'
  } else {
    url += `/${design.sapId}`
  }

  if(design.ktoc && !design.designImages && !ktocRenderDone) {
    url += '/render'
  }

  return url
}
