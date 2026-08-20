import { SourceLink } from './types.js';
import { absoluteUrl, htmlToText, normalizeWhitespace } from './utils.js';

export const SOURCES = {
  rsmc: 'http://www.meteo.fr/temps/domtom/La_Reunion/webcmrs9.0/anglais/index.html',
  rsmcArchives: 'http://www.meteo.fr/temps/domtom/La_Reunion/webcmrs9.0/anglais/archives/index.html',
  meteoFranceReunionCyclone: 'https://meteofrance.re/fr/cyclone',
  meteoFranceReunionVigilance: 'https://vigilance.meteofrance.fr/fr/la-reunion',
  meteoFranceMayotteVigilance: 'https://vigilance.meteofrance.fr/fr/mayotte',
  wmoLatestAdvisories: 'https://community.wmo.int/site/knowledge-hub/programmes-and-initiatives/tropical-cyclone-programme-tcp/latest-advisories-rsmcs-and-tcwcs',
  gdacsCyclones: 'https://www.gdacs.org/Cyclones/',
  meteoFranceApi: 'https://portail-api.meteofrance.fr/',
};

const USER_AGENT = 'mcp-cyclone-indian-ocean/0.1 (+https://github.com/Hug0x0/mcp-cyclone-indian-ocean)';

export async function fetchText(url: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  const response = await fetch(url, {
    headers: {
      Accept: 'text/html,application/xhtml+xml,application/xml,text/plain,*/*',
      'User-Agent': USER_AGENT,
    },
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} while fetching ${url}`);
  }

  return response.text();
}

export function extractTitle(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? htmlToText(match[1]) : undefined;
}

export function extractLinks(html: string, baseUrl: string): SourceLink[] {
  const links: SourceLink[] = [];
  const anchorRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(anchorRegex)) {
    const href = match[1];
    const title = htmlToText(match[2]);
    if (!href || !title || href.startsWith('#') || href.startsWith('javascript:')) {
      continue;
    }
    links.push({
      title: normalizeWhitespace(title),
      url: absoluteUrl(baseUrl, href),
    });
  }

  return dedupeLinks(links);
}

export function filterOperationalLinks(links: SourceLink[]): SourceLink[] {
  const keywords = [
    'advisory',
    'warning',
    'bulletin',
    'forecast',
    'track',
    'cyclogenesis',
    'technical',
    'vigilance',
    'current',
  ];

  return links.filter((link) => {
    const haystack = `${link.title} ${link.url}`.toLowerCase();
    return keywords.some((keyword) => haystack.includes(keyword));
  });
}

function dedupeLinks(links: SourceLink[]): SourceLink[] {
  const seen = new Set<string>();
  return links.filter((link) => {
    const key = `${link.title}|${link.url}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
