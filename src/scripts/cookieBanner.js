// Cookie banner: show it until the visitor chooses, remember the choice, and load
// analytics on accept. updateCookiesAccepted(), loadClarity() and loadGoogleAnalytics()
// are globals defined by src/components/Analytics.astro.
// Used by src/components/CookieBanner.astro.

const cookieBannerAcceptBtn = document.querySelector('#cookie-accept')
const cookieBannerDenyBtn = document.querySelector('#cookie-deny')
const cookieBanner = document.querySelector('.cookie-banner')

if (cookieBannerAcceptBtn && cookieBannerDenyBtn && cookieBanner) {
  const hideCookieBanner = () => {
    cookieBanner.style.display = 'none'
  }

  if (localStorage.getItem('cookiesAccepted') !== 'true') {
    cookieBanner.style.display = 'block'
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
    localStorage.setItem('cookiesAccepted', 'false')
    hideCookieBanner()
  }

  cookieBannerAcceptBtn.addEventListener('click', handleCookieAccept)
  cookieBannerDenyBtn.addEventListener('click', handleCookieDeny)

  // Check if the user has already made a choice regarding cookies
  const cookiesAccepted = localStorage.getItem('cookiesAccepted')
  if (cookiesAccepted === 'true' || cookiesAccepted === 'false') {
    hideCookieBanner()
  }
}
