/* Everything that describes the site to machines rather than to people:
 * search engines, the crawlers behind AI answer engines, and the link
 * unfurlers in LinkedIn, Slack and WhatsApp.
 *
 * This module is imported by `vite.config.ts` at build time, not by the app.
 * Nothing here ships in the JavaScript bundle — it is baked into index.html
 * during the build, which is the point: a <meta> tag added by React arrives
 * too late for a crawler that read the document and moved on.
 *
 * The same content rules as content.ts apply, and one more that matters more
 * here than anywhere else: everything below has to be true. Structured data
 * is a set of claims made to Google in a machine-readable form, and inventing
 * an address, a phone number, a rating or a client is the kind of thing that
 * earns a manual action rather than a ranking. If a fact is not on the page
 * and not confirmed, it is not in this file.
 */

export const SITE_URL = "https://backstageconsultancy.com";

/** The legal/company name. Used as the schema.org entity name.
 *
 *  "Backstage" alone is unwinnable as a search term — Spotify's Backstage
 *  developer portal and Backstage.com, the casting site, own it, and both are
 *  enormous. The entity has to be "Backstage Consultancy" everywhere it is
 *  written down, consistently, or there is nothing for Google to attach a
 *  brand to. Hence: full name in schema, short name as alternateName. */
export const ORG_NAME = "Backstage Consultancy";
export const ORG_SHORT = "Backstage";

/* ~55 characters. The service term leads because nobody is searching the
   brand yet, and the brand is ambiguous besides. */
export const TITLE = "Backstage — AI consultancy, UK. We build it, we run it.";

/* ~150 characters, which is about where Google truncates. Drawn from the
   page's own opening rather than written fresh, so the snippet matches what
   somebody sees when they arrive. */
export const DESCRIPTION =
  "Backstage is a UK AI consultancy. Tell us which process is eating your week — we build whatever fixes it, we run it, and we hand back the finished work.";

export const LOCALE = "en_GB";
export const LANG = "en-GB";

export const OG_IMAGE = `${SITE_URL}/og.png`;
export const OG_IMAGE_ALT = "Backstage — AI consultancy, UK";

/** Light and dark, so the browser chrome on mobile is the page colour rather
 *  than white. These are `--bg` from tokens.css converted out of oklch:
 *  oklch(0.985 0.005 250) and oklch(0.135 0.012 285). Hex rather than oklch
 *  because older mobile browsers ignore a theme-color they cannot parse and
 *  fall back to white, which is the exact thing this is here to prevent.
 *  If --bg changes, recompute these. */
export const THEME_COLOR = { light: "#F8FAFD", dark: "#08080D" };

/** Written into <html data-…> nothing; used only to build the JSON-LD. */
export function structuredData(contactEmail: string) {
  const org = {
    "@type": ["Organization", "ProfessionalService"],
    "@id": `${SITE_URL}/#organization`,
    name: ORG_NAME,
    alternateName: ORG_SHORT,
    url: SITE_URL,
    email: contactEmail,
    description: DESCRIPTION,
    logo: `${SITE_URL}/favicon.svg`,
    image: OG_IMAGE,
    foundingDate: "2026",
    /* The page says "UK" and nothing narrower. A specific town or postcode
       here would be a fabrication, and LocalBusiness schema without a real
       verifiable address is worse than no schema at all. */
    areaServed: { "@type": "Country", name: "United Kingdom" },
    address: { "@type": "PostalAddress", addressCountry: "GB" },
    knowsAbout: [
      "AI consultancy",
      "AI automation",
      "Business process automation",
      "AI sales agents",
      "Managed AI services",
    ],
    /* Julian is a real product described on the page. Nothing else is
       claimed, and no prices are named because the page does not name any. */
    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Julian — AI sales agent",
        description:
          "An AI sales agent that works outbound one company at a time, from your own inbox and in your name, with a person approving every meeting.",
        provider: { "@id": `${SITE_URL}/#organization` },
      },
    },
  };

  const website = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: ORG_NAME,
    description: DESCRIPTION,
    inLanguage: LANG,
    publisher: { "@id": `${SITE_URL}/#organization` },
  };

  return { "@context": "https://schema.org", "@graph": [org, website] };
}
