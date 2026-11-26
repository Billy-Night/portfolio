// Settings of the cookie consent component. Everything specific to this site
// is in this file; to use the component on another site, change these values.
// How the component works: ./README.md

export const consentConfig = {
  /**
   * The addresses of the live site. Analytics run only there, so previews and
   * local builds never send visits, whatever the visitor chose.
   */
  productionHosts: ['billynightingale.com', 'www.billynightingale.com'],

  /** Google Analytics measurement ID. Leave empty ('') to go without Google Analytics. */
  googleAnalyticsId: 'G-LVZ55QWZGE',

  /** Microsoft Clarity project ID. Leave empty ('') to go without Clarity. */
  clarityProjectId: 'wpv1qvf7nc',

  /**
   * Where the visitor's choice is kept in the browser (localStorage): 'true'
   * after "Accept", 'false' after "Deny". Changing this name makes every
   * visitor choose again.
   */
  storageKey: 'cookiesAccepted',

  /**
   * The beginnings of the names of the cookies the two tools place on this
   * site. These are deleted when a visitor has not accepted, or withdraws.
   * Add to this list when adding a tool.
   */
  cookiePrefixes: ['_ga', '_gid', '_gat', '_gcl', '_clck', '_clsk'],
}
