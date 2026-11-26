// Cookie banner: show it until the visitor chooses, remember the choice, and load
// analytics on accept. updateCookiesAccepted(), loadClarity() and loadGoogleAnalytics()
// are globals defined by src/components/Analytics.astro.
// Used by src/components/CookieBanner.astro.
//
// Any element with the attribute data-cookie-settings (the footer's "Cookie
// settings" button, and the one in the privacy policy) shows the banner again,
// so a visitor can change their choice.

const cookieBannerAcceptBtn = document.querySelector('#cookie-accept')
const cookieBannerDenyBtn = document.querySelector('#cookie-deny')
const cookieBanner = document.querySelector('.cookie-banner')
const cookieSettingsButtons = document.querySelectorAll('[data-cookie-settings]')

// The cookies placed by Google Analytics and Microsoft Clarity on this site
const analyticsCookiePrefixes = ['_ga', '_gid', '_gat', '_gcl', '_clck', '_clsk']

/** Delete the analytics cookies, for a visitor who withdraws their consent */
const clearAnalyticsCookies = () => {
  const host = window.location.hostname
  // A cookie is only deleted when the domain it was set for is named
  const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`]
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim()
    if (!analyticsCookiePrefixes.some((prefix) => name.startsWith(prefix))) return
    domains.forEach((domain) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ''}`
    })
  })
}

// Without consent, no analytics cookie may stay. Deleting them when "Deny" is
// pressed is not enough on its own: Google Analytics, still running on that
// page, writes its session cookie (_ga_<id>) again as the page reloads. On the
// reloaded page no analytics script runs, so this deletion is final.
if (localStorage.getItem('cookiesAccepted') !== 'true') {
  clearAnalyticsCookies()
}

if (cookieBannerAcceptBtn && cookieBannerDenyBtn && cookieBanner) {
  const hideCookieBanner = () => {
    cookieBanner.style.display = 'none'
  }

  const showCookieBanner = () => {
    cookieBanner.style.display = 'block'
  }

  if (localStorage.getItem('cookiesAccepted') !== 'true') {
    showCookieBanner()
  } else {
    hideCookieBanner()
  }

  const handleCookieAccept = () => {
    localStorage.setItem('cookiesAccepted', 'true')
    updateCookiesAccepted()
    hideCookieBanner()
    loadClarity()
    loadGoogleAnalytics()
  }

  const handleCookieDeny = () => {
    const hadAccepted = localStorage.getItem('cookiesAccepted') === 'true'
    localStorage.setItem('cookiesAccepted', 'false')
    hideCookieBanner()
    if (hadAccepted) {
      // Consent withdrawn: tell Clarity, remove the cookies, then reload so
      // the analytics scripts already running on this page stop.
      withdrawClarityConsent()
      clearAnalyticsCookies()
      window.location.reload()
    }
  }

  cookieBannerAcceptBtn.addEventListener('click', handleCookieAccept)
  cookieBannerDenyBtn.addEventListener('click', handleCookieDeny)

  // Check if the user has already made a choice regarding cookies
  const cookiesAccepted = localStorage.getItem('cookiesAccepted')
  if (cookiesAccepted === 'true' || cookiesAccepted === 'false') {
    hideCookieBanner()
  }

  cookieSettingsButtons.forEach((button) => {
    button.addEventListener('click', () => {
      showCookieBanner()
      // Keyboard and screen reader users land on the choice
      cookieBannerAcceptBtn.focus()
    })
  })
}
