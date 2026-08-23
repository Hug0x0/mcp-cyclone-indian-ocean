# mcp-cyclone-indian-ocean

MCP server for **South-West Indian Ocean cyclone monitoring**: official RSMC La Réunion links, Météo-France vigilance references, alert-level explanations, historical archive discovery, and commune-distance exposure helpers for La Réunion and Mayotte.

It is designed for Réunion, Mayotte, Madagascar, Mauritius, the Mozambique Channel, and the broader South-West Indian Ocean basin.

## Tools

- `cyclone_get_sources` — list official and secondary sources.
- `cyclone_get_current_activity` — fetch the RSMC La Réunion current public page and discover operational product links.
- `cyclone_get_rsmc_archives` — fetch public RSMC archive links.
- `cyclone_get_vigilance_links` — return official Météo-France vigilance links for La Réunion and Mayotte.
- `cyclone_build_monitoring_brief` — build an agent-ready monitoring flow with source priorities and safety boundaries.
- `cyclone_explain_alert_level` — explain pre-alert, orange, red, purple, and safeguard cyclone phases.
- `cyclone_estimate_commune_exposure` — rank Réunion/Mayotte communes by distance to a cyclone position.
- `cyclone_list_communes` — list built-in commune centroids used by the distance helper.
- `cyclone_get_notable_events` — small curated list of notable recent cyclone events for grounding.

## Install

```bash
npm install
npm run build
npm test
npm run dev
```

## Claude Desktop

```json
{
  "mcpServers": {
    "cyclone-indian-ocean": {
      "command": "npx",
      "args": ["mcp-cyclone-indian-ocean"]
    }
  }
}
```

## Sources

Primary sources:

- RSMC La Réunion / Météo-France tropical cyclone centre: http://www.meteo.fr/temps/domtom/La_Reunion/webcmrs9.0/anglais/index.html
- RSMC La Réunion archives: http://www.meteo.fr/temps/domtom/La_Reunion/webcmrs9.0/anglais/archives/index.html
- Météo-France La Réunion cyclone page: https://meteofrance.re/fr/cyclone
- Météo-France vigilance La Réunion: https://vigilance.meteofrance.fr/fr/la-reunion
- Météo-France vigilance Mayotte: https://vigilance.meteofrance.fr/fr/mayotte
- WMO latest advisories directory: https://community.wmo.int/site/knowledge-hub/programmes-and-initiatives/tropical-cyclone-programme-tcp/latest-advisories-rsmcs-and-tcwcs
- GDACS tropical cyclones: https://www.gdacs.org/Cyclones/

See [`docs/sources.md`](docs/sources.md).

## Safety

This project is **not** an emergency-warning authority. It helps agents discover and summarize official information, but users must follow prefecture, civil-protection, and Météo-France instructions during active cyclone events.

## Optional Configuration

```bash
METEOFRANCE_API_TOKEN=... npx mcp-cyclone-indian-ocean
```

The token is optional. Public links and RSMC discovery tools work without it.

## Glama / Docker

The repo includes:

- `Dockerfile`
- `glama.json`
- `npm run build`
- `npm test`
- `npm run test:smoke`

For Glama, use:

```json
["npm install", "npm run build"]
```

CMD arguments:

```json
["node", "dist/index.js"]
```

## License

MIT
