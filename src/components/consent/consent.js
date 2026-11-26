// Cookie consent: the behaviour of CookieConsent.astro. It loads Google
// Analytics and Microsoft Clarity only after "Accept", only on the live site,
// and removes their cookies when the visitor has not accepted or withdraws.
// The settings are in ./config.ts and the whole flow is described in ./README.md.
import { consentConfig } from './config'

const { productionHosts, googleAnalyticsId, clarityProjectId, storageKey, cookiePrefixes } = consentConfig

const isProduction = productionHosts.includes(window.location.hostname)
const hasAccepted = () => localStorage.getItem(storageKey) === 'true'

// Each tool is loaded at most once per page
const loaded = { clarity: false, googleAnalytics: false }

function loadClarity() {
  if (loaded.clarity || !clarityProjectId || !isProduction || !hasAccepted()) return
  // Clarity's own queue: calls made before its script has loaded wait here
  window.clarity =
    window.clarity ||
    function () {
      ;(window.clarity.q = window.clarity.q || []).push(arguments)
    }
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.clarity.ms/tag/${clarityProjectId}`
  document.head.appendChild(script)
  // Tell Clarity the visitor accepted. Since 31 October 2025 Clarity waits
  // for this signal before setting its cookies (_clck, _clsk) for visitors
  // in the EEA, the UK and Switzerland; without it every page view is a
  // separate anonymous visit. Audience measurement only: advertising storage
  // stays denied.
  // https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2
  window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'granted' })
  loaded.clarity = true
}

function loadGoogleAnalytics() {
  if (loaded.googleAnalytics || !googleAnalyticsId || !isProduction || !hasAccepted()) return
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`
  document.head.appendChild(script)
  window.dataLayer = window.dataLayer || []
  // Google's own snippet: it must push the `arguments` object, not an array
  function gtag() {
    window.dataLayer.push(arguments)
  }
  gtag('js', new Date())
  gtag('config', googleAnalyticsId)
  loaded.googleAnalytics = true
}

/** Tell Clarity that a visitor who had accepted now refuses: it deletes its cookies and ends the session */
function withdrawClarityConsent() {
  if (!loaded.clarity) return
  window.clarity('consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' })
}

/** Delete the analytics cookies */
function clearAnalyticsCookies() {
  const host = window.location.hostname
  // A cookie is only deleted when the domain it was set for is named
  const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`]
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.split('=')[0].trim()
    if (!cookiePrefixes.some((prefix) => name.startsWith(prefix))) return
    domains.forEach((domain) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domain ? `; domain=${domain}` : ''}`
    })
  })
}

// On every page load. With consent: load the tools. Without: no analytics
// cookie may stay. Deleting them when "Deny" is pressed is not enough on its
// own: Google Analytics, still running on that page, writes its session cookie
// (_ga_<id>) again as the page reloads. On the reloaded page no analytics
// script runs, so this deletion is final.
if (hasAccepted()) {
  loadClarity()
  loadGoogleAnalytics()
} else {
  clearAnalyticsCookies()
}

// The banner
const banner = document.querySelector('.cookie-banner')
const acceptButton = document.querySelector('#cookie-accept')
const denyButton = document.querySelector('#cookie-deny')

if (banner && acceptButton && denyButton) {
  const showBanner = () => {
    banner.style.display = 'block'
  }
  const hideBanner = () => {
    banner.style.display = 'none'
  }

  // Shown until the visitor has chosen, either way
  if (!['true', 'false'].includes(localStorage.getItem(storageKey))) showBanner()

  acceptButton.addEventListener('click', () => {
    localStorage.setItem(storageKey, 'true')
    hideBanner()
    loadClarity()
    loadGoogleAnalytics()
  })

  denyButton.addEventListener('click', () => {
    const hadAccepted = hasAccepted()
    localStorage.setItem(storageKey, 'false')
    hideBanner()
    if (hadAccepted) {
      // Consent withdrawn: tell Clarity, remove the cookies, then reload so
      // the analytics scripts already running on this page stop.
      withdrawClarityConsent()
      clearAnalyticsCookies()
      window.location.reload()
    }
  })

  // Any element with the attribute data-cookie-settings (the footer's "Cookie
  // settings" button, and the one in the privacy policy) shows the banner
  // again, so a visitor can change their choice.
  document.querySelectorAll('[data-cookie-settings]').forEach((button) => {
    button.addEventListener('click', () => {
      showBanner()
      // Keyboard and screen reader users land on the choice
      acceptButton.focus()
    })
  })
}
