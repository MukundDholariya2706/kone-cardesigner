import deepCopy from 'deepcopy';
import { LOCAL_STORAGE_3D_QUALITY } from '../constants';
import { QUALITY_3D_HIGH, QUALITY_3D_LOW, QUALITY_3D_MEDIUM } from '../store/3d/3d-constants';
import { isMobile } from './device-utils';

/**
 * Converts an array of objects to hash table
 * @param {Array} obj Array of objects to be processed
 * @param {String} key Key in the objects to be used as key to the object
 * @returns {Object} Hashed array
 */
export function createObjectByProp(obj, key) {
  if (obj === null || obj.length < 1) return {};
  if (key === null || key === '') return {};
  let tmp = {};
  for (let i = 0; i < obj.length; i++) {
    tmp[obj[i][key]] = deepCopy(obj[i]);
  }
  return tmp;
}

export function sortLanguages(languages, getText) {
  return languages.sort((language1, language2) => {
    const lang1 = getText(`lang-${language1.code}`)
    const lang2 = getText(`lang-${language2.code}`)
    if (lang1 < lang2) return -1
    if (lang1 > lang2) return 1
    return 0
  })
}

export function sortCountries(countries, getText) {
  if (!countries) return []
  return countries.sort((country1, country2) => {
    // 'Other' should always be the last element
    if (country1.alpha3 === 'OTHER') return 1 
    if (country2.alpha3 === 'OTHER') return -1 
    const name1 = getText(`country-${country1.alpha3}`)
    const name2 = getText(`country-${country2.alpha3}`)
    if (name1 < name2) return -1
    if (name1 > name2) return 1
    return 0
  })
}

export function filterCountries(countries, continentCodes) {
  return (countries || []).filter(country => {
    return continentCodes.indexOf(country.regionCode) !== -1
  })
}

export function sortProducts(products, getText) {
  return products.sort((a, b) => {

    // Bigger weight goes to bottom
    if (a.sortingWeight < b.sortingWeight) return -1
    if (a.sortingWeight > b.sortingWeight) return 1
    
    const first = getText(a.name)
    const second = getText(b.name)

    if (first < second) return 1
    if (first > second) return -1
    return 0
  })
}

export function sortFinishes(finishes) {
  return finishes.sort((a, b) => {

    // Bigger weight goes to bottom
    if (a.id < b.id) return -1
    if (a.id > b.id) return 1
    return 0
  })
}

export function get3DQuality() {
  const ls3dQuality = localStorage.getItem(LOCAL_STORAGE_3D_QUALITY)
  
  return (ls3dQuality && [QUALITY_3D_LOW, QUALITY_3D_MEDIUM, QUALITY_3D_HIGH].indexOf(ls3dQuality) !== -1 && ls3dQuality) || (isMobile ? QUALITY_3D_LOW : QUALITY_3D_MEDIUM)
}

export function capitalizeString(str) {
  if(str.length<1) return null
  const lowStr = str.toLowerCase()
  return lowStr[0].toUpperCase() + lowStr.slice(1)
}

export function getDomainDefinition() {
  const host = window.location.hostname

  if(host === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    host === '[::1]' ||
    // 127.0.0.1/8 is considered localhost for IPv4.
    host.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
  ) {
    return 'localhost'
  }

  const hostArray = host.split('.')

  return hostArray[hostArray.length-1]
  
}

export function getLeadingZeros(number, maxZeros = 5){
  const absolute = Math.abs(number)
  // I figured out this funky trick to check leading zeros, there is probably a better one
  if (absolute <= 0){
    return maxZeros
  }
  let zeros = 0;
  let steppingNumber = number;
  while(zeros < maxZeros){
    // const modulo = 1.0 % steppingNumber;
    if (steppingNumber >= 1.0){
      return zeros;
    }
    steppingNumber *= 10.0;
    zeros++;
    // console.log(zeros, steppingNumber)
  }
  return zeros;
}

export function copy(val) {
  if (!val) return val
  return JSON.parse(JSON.stringify(val))
}

export function getPhoneNumber(user = {}) {
  const { businessPhones, mobilePhone } = user
  if (Array.isArray(businessPhones) && businessPhones.length > 0) {
    return businessPhones[0]
  }

  return mobilePhone
}

export function getDisplayNameAndRole(user = {}) {
  const { displayName, givenName, surname, jobTitle } = user

  let result = ''

  if (givenName && surname) {
    result += `${givenName} ${surname}`
  } else if (displayName) {
    result += `${displayName}`
  }

  // Only check role if there is some name to display as well
  if (result.length > 0) {
    if (jobTitle) {
      result += `, ${jobTitle}`
    }
  }

  return result
}

export function formatTime(time) {
  const date = new Date(time)
  let day = date.getUTCDate()
  let month = date.getUTCMonth() + 1
  const year = date.getUTCFullYear()

  if (day < 10) {
    day = `0${day}`
  }

  if (month < 10) {
    month = `0${month}`
  }

  // Indian date notation hardcoded in for now.
  // If the same logic is ever needed for other countries, recreate with proper logic.
  return `${day}-${month}-${year}`
}