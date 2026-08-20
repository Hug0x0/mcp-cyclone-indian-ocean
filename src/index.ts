#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { ALERT_LEVELS, findAlertLevel } from './alerts.js';
import { COMMUNES, nearestCommunes } from './communes.js';
import {
  SOURCES,
  extractLinks,
  extractTitle,
  fetchText,
  filterOperationalLinks,
} from './sources.js';
import { errorResult, htmlToText, jsonResult } from './utils.js';

const server = new McpServer({
  name: 'mcp-cyclone-indian-ocean',
  version: '0.1.0',
});

server.tool(
  'cyclone_get_sources',
  'List official and secondary sources used by this MCP server for South-West Indian Ocean cyclone monitoring. Includes RSMC La Réunion / Météo-France, vigilance pages, WMO advisory directory, GDACS, and optional Météo-France API portal.',
  {},
  async () =>
    jsonResult({
      primary_sources: [
        {
          name: 'RSMC La Réunion / Météo-France tropical cyclone centre',
          url: SOURCES.rsmc,
          role: 'Official WMO Regional Specialized Meteorological Centre for the South-West Indian Ocean basin.',
        },
        {
          name: 'Météo-France La Réunion cyclone page',
          url: SOURCES.meteoFranceReunionCyclone,
          role: 'Public cyclone information and local updates for La Réunion.',
        },
        {
          name: 'Météo-France vigilance La Réunion',
          url: SOURCES.meteoFranceReunionVigilance,
          role: 'Official vigilance page for La Réunion.',
        },
        {
          name: 'Météo-France vigilance Mayotte',
          url: SOURCES.meteoFranceMayotteVigilance,
          role: 'Official vigilance page for Mayotte.',
        },
      ],
      secondary_sources: [
        {
          name: 'WMO latest advisories directory',
          url: SOURCES.wmoLatestAdvisories,
          role: 'Directory of official RSMC/TCWC advisory sources.',
        },
        {
          name: 'GDACS tropical cyclones',
          url: SOURCES.gdacsCyclones,
          role: 'Global disaster alert and impact context, not a replacement for local official alerts.',
        },
      ],
      optional_configuration: {
        METEOFRANCE_API_TOKEN:
          'Optional. Future API-backed vigilance tools can use this when Météo-France API access is enabled for the user account.',
      },
    })
);

server.tool(
  'cyclone_get_current_activity',
  'Fetch the current public RSMC La Réunion cyclone centre page and return discovered operational product links. Useful as the first call when asking whether a South-West Indian Ocean cyclone system is active.',
  {
    include_page_excerpt: z
      .boolean()
      .default(false)
      .describe('Include a short text excerpt from the RSMC page. Default false.'),
  },
  async ({ include_page_excerpt }) => {
    try {
      const html = await fetchText(SOURCES.rsmc);
      const links = filterOperationalLinks(extractLinks(html, SOURCES.rsmc)).slice(0, 30);
      const pageText = htmlToText(html);

      return jsonResult({
        source: SOURCES.rsmc,
        title: extractTitle(html),
        checked_at: new Date().toISOString(),
        operational_links: links,
        note:
          'Use the returned official links for the authoritative active bulletin text, track map, and cyclogenesis products. If no operational links are discovered, consult the source URL directly.',
        ...(include_page_excerpt ? { page_excerpt: pageText.slice(0, 1200) } : {}),
      });
    } catch (error) {
      return errorResult(error instanceof Error ? error.message : 'Failed to fetch current cyclone activity');
    }
  }
);

server.tool(
  'cyclone_get_rsmc_archives',
  'Fetch the RSMC La Réunion public archive index and return available archive links. Useful for historical cyclone-season research in the South-West Indian Ocean.',
  {
    limit: z.number().int().min(1).max(100).default(40).describe('Max archive links to return.'),
  },
  async ({ limit }) => {
    try {
      const html = await fetchText(SOURCES.rsmcArchives);
      const links = extractLinks(html, SOURCES.rsmcArchives).slice(0, limit);

      return jsonResult({
        source: SOURCES.rsmcArchives,
        title: extractTitle(html),
        checked_at: new Date().toISOString(),
        archives: links,
      });
    } catch (error) {
      return errorResult(error instanceof Error ? error.message : 'Failed to fetch RSMC archives');
    }
  }
);

server.tool(
  'cyclone_get_vigilance_links',
  'Return official vigilance links for La Réunion and Mayotte, plus token configuration status for future Météo-France API-backed calls.',
  {},
  async () =>
    jsonResult({
      vigilance_pages: [
        {
          territory: 'reunion',
          label: 'La Réunion',
          url: SOURCES.meteoFranceReunionVigilance,
        },
        {
          territory: 'mayotte',
          label: 'Mayotte',
          url: SOURCES.meteoFranceMayotteVigilance,
        },
      ],
      meteo_france_api: {
        portal: SOURCES.meteoFranceApi,
        token_env: 'METEOFRANCE_API_TOKEN',
        token_configured: Boolean(process.env.METEOFRANCE_API_TOKEN),
        note:
          'Some Météo-France API products require account access. This MCP keeps public links available even without a token.',
      },
    })
);

server.tool(
  'cyclone_explain_alert_level',
  'Explain French cyclone alert levels used around La Réunion/Mayotte: pre-alert, orange, red, purple, and safeguard phase.',
  {
    level: z
      .string()
      .optional()
      .describe('Optional alert level to explain: pre-alert, orange, red, purple, safeguard, or French label.'),
  },
  async ({ level }) => {
    const selected = level ? findAlertLevel(level) : undefined;
    return jsonResult({
      levels: selected ? [selected] : ALERT_LEVELS,
      disclaimer:
        'This is an explanatory helper. Always follow prefecture and Météo-France official instructions during active alerts.',
    });
  }
);

server.tool(
  'cyclone_estimate_commune_exposure',
  'Estimate which Réunion or Mayotte communes are geographically closest to a cyclone position. This is a distance helper, not an official impact model.',
  {
    lat: z.number().min(-40).max(0).describe('Cyclone latitude in decimal degrees, negative south of the Equator.'),
    lon: z.number().min(30).max(100).describe('Cyclone longitude in decimal degrees east.'),
    territory: z.enum(['reunion', 'mayotte']).optional().describe('Optional territory filter.'),
    radius_km: z.number().min(1).max(1000).default(150).describe('Radius used for within_radius flag.'),
    limit: z.number().int().min(1).max(50).default(10).describe('Max communes to return.'),
  },
  async ({ lat, lon, territory, radius_km, limit }) =>
    jsonResult({
      input_position: { lat, lon },
      radius_km,
      territory: territory ?? 'all',
      nearest_communes: nearestCommunes({ lat, lon }, { territory, radiusKm: radius_km, limit }),
      disclaimer:
        'Distance to commune centroids is only a first screening signal. Wind radius, track uncertainty, terrain, rainfall, surge, and official warnings matter more for real decisions.',
    })
);

server.tool(
  'cyclone_list_communes',
  'List built-in commune centroids used by cyclone_estimate_commune_exposure for La Réunion and Mayotte.',
  {
    territory: z.enum(['reunion', 'mayotte']).optional().describe('Optional territory filter.'),
  },
  async ({ territory }) =>
    jsonResult({
      communes: COMMUNES.filter((commune) => !territory || commune.territory === territory),
      count: COMMUNES.filter((commune) => !territory || commune.territory === territory).length,
    })
);

server.tool(
  'cyclone_get_notable_events',
  'Return a small curated list of notable recent South-West Indian Ocean cyclone events for prompt grounding and historical exploration.',
  {
    territory: z
      .enum(['reunion', 'mayotte', 'madagascar', 'mauritius', 'mozambique'])
      .optional()
      .describe('Optional territory/country relevance filter.'),
  },
  async ({ territory }) => {
    const events = [
      {
        name: 'Garance',
        season: '2024-2025',
        territories: ['reunion'],
        summary:
          'Tropical cyclone Garance crossed La Réunion in February 2025 and triggered very high local alert levels and severe wind/rain impacts.',
        source: 'https://meteofrance.com/actualites/alerte-cyclonique-le-cyclone-garance-a-touche-lile-de-la-reunion',
      },
      {
        name: 'Belal',
        season: '2023-2024',
        territories: ['reunion', 'mauritius'],
        summary:
          'Belal affected the Mascarenes in January 2024, bringing cyclone conditions and major disruption around La Réunion and Mauritius.',
        source: SOURCES.rsmcArchives,
      },
      {
        name: 'Freddy',
        season: '2022-2023',
        territories: ['madagascar', 'mozambique', 'mauritius', 'reunion'],
        summary:
          'Freddy was an exceptionally long-lived South-West Indian Ocean cyclone with severe impacts in Madagascar and Mozambique.',
        source: SOURCES.rsmcArchives,
      },
    ];

    return jsonResult({
      events: territory
        ? events.filter((event) => event.territories.includes(territory))
        : events,
      note:
        'This curated list is intentionally small. Use cyclone_get_rsmc_archives for authoritative season archives.',
    });
  }
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('mcp-cyclone-indian-ocean running on stdio');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
