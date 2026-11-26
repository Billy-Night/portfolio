# Cookie consent

The cookie banner and everything behind it. Google Analytics and Microsoft Clarity load only after the visitor clicks "Accept", only on the live site, and their cookies are removed if the visitor has not accepted or changes their mind.

It is one component, used once, in [BaseLayout.astro](../../layouts/BaseLayout.astro):

```astro
<CookieConsent lang={lang} />
```

| File | What it holds |
|---|---|
| [config.ts](config.ts) | The settings: analytics IDs, the live site's addresses, the cookie names. The only file to change for another site. |
| [CookieConsent.astro](CookieConsent.astro) | The banner: its text in English and French, its two buttons, its styles. |
| [consent.js](consent.js) | The behaviour: loading the tools, telling Clarity, deleting cookies, showing and hiding the banner. |

## What happens, step by step

The visitor's choice is kept in their browser's local storage under `cookiesAccepted`: `'true'` after "Accept", `'false'` after "Deny", nothing before any choice.

### 1. A page loads

- **No "Accept" on record:** nothing is loaded. No analytics script, no cookie, no data sent. Any analytics cookie found is deleted (step 3 explains why).
- **No choice on record at all:** the banner is shown.
- **"Accept" on record, on the live site:** both tools load, as in step 2.

### 2. The visitor clicks "Accept"

1. The choice is saved, so the banner does not come back on later pages or visits.
2. Clarity's script is loaded, and Clarity is told what was accepted: analytics storage granted, advertising storage denied. It then sets `_clck` and `_clsk`.
3. Google Analytics' script is loaded. It sets `_ga` and `_ga_<measurement ID>`.

### 3. The visitor clicks "Deny"

- **On a first visit:** the choice is saved and the banner closes. Nothing was loaded, so there is nothing to undo.
- **After having accepted** (withdrawal), in this order:
  1. The choice is saved as denied.
  2. Clarity is told. It deletes its own cookies and ends the session.
  3. The site deletes every analytics cookie.
  4. The page reloads, so the analytics scripts that were running stop.
  5. On the reloaded page, the deletion described in step 1 removes what Google Analytics wrote during the reload.

### 4. The visitor changes their mind

Any element with the attribute `data-cookie-settings` shows the banner again and puts the keyboard focus on "Accept". The footer has one on every page, and the privacy policy has one in its cookies section:

```html
<button type="button" class="btn__link" data-cookie-settings>Cookie settings</button>
```

Accepting after a withdrawal starts step 2 afresh, with new identifiers. Nothing links the new visit to the old one.

## What the cookies look like at each step

Checked on the live site on 2026-11-26.

| State | Cookies on the site's domain |
|---|---|
| No choice yet | `cf_clearance` |
| After "Accept" | `cf_clearance`, `_ga`, `_ga_LVZ55QWZGE`, `_clck`, `_clsk` |
| After "Deny" | `cf_clearance` |

`cf_clearance` is Cloudflare's security cookie. It is not set by this component, it is not an analytics cookie, and it needs no consent. Cookies listed under Google's own domain in the browser's tools (`__Secure-ENID`, `SEARCH_SAMESITE`) come from the visitor's own use of Google: the site neither sets nor can delete them.

## Three things that are easy to get wrong

Each of these was a fault found on the live site.

- **Clarity needs to be told about consent.** Since 31 October 2025, Clarity waits for an explicit signal before setting cookies for visitors in the EEA, the UK and Switzerland. Loading its script only after "Accept" is not enough: without the signal it counts every page view as a separate anonymous visit. The call is `window.clarity('consentv2', { ad_Storage, analytics_Storage })`, with `'granted'` or `'denied'` for each. Source: [Clarity consent API v2](https://learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-consent-api-v2).
- **Google Analytics writes a cookie back while the page reloads.** Deleting the cookies when "Deny" is clicked removes `_ga`, but `_ga_<measurement ID>` reappears, written by the script that is still running. This is why cookies are also deleted on every page load without consent, when no analytics script is running.
- **A cookie is only deleted when its domain is named.** The tools set their cookies on `.example.com`, not on `www.example.com`, so the deletion is tried for each form of the domain.

## Advertising storage is denied on purpose

The banner and the privacy policy say the cookies measure the audience, and nothing else. Granting `ad_Storage` to Clarity would let Microsoft set its advertising cookies. Changing it means changing the banner text and the privacy policy too.

## Keep these in step

- **The banner text** must say what `consent.js` does.
- **The privacy policy**, in both languages ([privacy-policy.astro](../../pages/privacy-policy.astro), [politique-de-confidentialite.astro](../../pages/fr/politique-de-confidentialite.astro)), names the two tools and describes withdrawal.
- **The security headers** in [public/_headers](../../../public/_headers) list the addresses the two tools load from.

## Testing

```bash
npm run build && node scripts/dev/consent_test.mjs      # must end with "0 failed"
```

The test runs the built script in a fake browser: what loads for each address and saved choice, what Clarity is told, which cookies are deleted, when the banner shows. It needs no network. The live address and the two IDs are written in the test too, so a change to [config.ts](config.ts) needs the same change there.

The real tools run only on the live site, so after a change that touches them, check there in the browser's developer tools (Application, then Cookies) that the three states in the table above still hold.

## Using it on another site

1. **Copy this folder** into the other project's components.
2. **Edit [config.ts](config.ts):** the live site's addresses, the two IDs (leave one empty to go without that tool), and the cookie names if the tools differ.
3. **Add it to the layout,** once, after the page content: `<CookieConsent lang={lang} />`.
4. **Add a "Cookie settings" button** somewhere on every page, with the attribute `data-cookie-settings`.
5. **Adapt what belongs to this site** in [CookieConsent.astro](CookieConsent.astro):
   - the banner's text and languages;
   - the link to the privacy policy, which comes from this site's `src/i18n/routes.ts`;
   - the styles, which use this site's design tokens (`--space-4`, `--page-gutter`, `--corner-rad`, `--white`) and shared classes (`dark__glass-back`, `btn__primary`, `btn__prim--light`, `btn__second`, `btn__second--light`, `cta-container`).
6. **Allow the tools in the Content Security Policy,** if the site has one.
7. **Write the privacy policy** to match.

Adding a third tool means a loader in [consent.js](consent.js) next to the two that are there, called in the same two places, and its cookie names in [config.ts](config.ts).
