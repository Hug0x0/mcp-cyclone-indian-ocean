#!/usr/bin/env node

const SOURCES = [
  ['RSMC La Réunion', 'http://www.meteo.fr/temps/domtom/La_Reunion/webcmrs9.0/anglais/index.html'],
  ['RSMC archives', 'http://www.meteo.fr/temps/domtom/La_Reunion/webcmrs9.0/anglais/archives/index.html'],
  ['Météo-France Réunion cyclone', 'https://meteofrance.re/fr/cyclone'],
  ['Météo-France Réunion vigilance', 'https://vigilance.meteofrance.fr/fr/la-reunion'],
  ['Météo-France Mayotte vigilance', 'https://vigilance.meteofrance.fr/fr/mayotte'],
];

let failures = 0;

for (const [name, url] of SOURCES) {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'text/html,*/*',
        'User-Agent': 'mcp-cyclone-indian-ocean-smoke/0.1',
      },
    });
    const body = await response.text();
    const ok = response.ok && body.length > 200;
    console.log(`${ok ? 'OK' : 'FAIL'} ${response.status} ${name} ${url}`);
    if (!ok) {
      failures += 1;
    }
  } catch (error) {
    failures += 1;
    console.log(`FAIL ${name} ${url} ${error.message}`);
  }
}

process.exitCode = failures === 0 ? 0 : 1;
