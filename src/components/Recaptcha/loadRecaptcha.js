const loadReCaptcha = siteKey => {
  if (!siteKey) return // This should be the case for Chinese domains
  const script = document.createElement('script')

  // script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
  script.src = `https://www.recaptcha.net/recaptcha/api.js?render=${siteKey}`

  document.body.appendChild(script)

  console.log("> Recaptcha loaded.")
}

export default loadReCaptcha
