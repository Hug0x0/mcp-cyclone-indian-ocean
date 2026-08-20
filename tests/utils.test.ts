import { describe, expect, it } from 'vitest';
import { ALERT_LEVELS, findAlertLevel } from '../src/alerts.js';
import { nearestCommunes } from '../src/communes.js';
import { extractLinks, filterOperationalLinks } from '../src/sources.js';
import { distanceKm, htmlToText } from '../src/utils.js';

describe('alert levels', () => {
  it('contains the expected cyclone alert ladder', () => {
    expect(ALERT_LEVELS.map((level) => level.level)).toEqual([
      'pre-alert',
      'orange',
      'red',
      'purple',
      'safeguard',
    ]);
  });

  it('finds levels by English or French label', () => {
    expect(findAlertLevel('orange')?.level).toBe('orange');
    expect(findAlertLevel('violette')?.level).toBe('purple');
  });
});

describe('commune exposure helpers', () => {
  it('finds Saint-Denis near a north-Reunion point', () => {
    const nearest = nearestCommunes(
      { lat: -20.88, lon: 55.45 },
      { territory: 'reunion', radiusKm: 20, limit: 1 }
    );

    expect(nearest[0].commune).toBe('Saint-Denis');
    expect(nearest[0].within_radius).toBe(true);
  });

  it('computes realistic distance between Reunion and Mayotte', () => {
    const km = distanceKm({ lat: -20.88, lon: 55.45 }, { lat: -12.78, lon: 45.23 });
    expect(km).toBeGreaterThan(1300);
    expect(km).toBeLessThan(1600);
  });
});

describe('source parsing', () => {
  it('extracts and filters operational links from HTML', () => {
    const html = `
      <a href="/foo.html">About</a>
      <a href="warning.html">Latest warning bulletin</a>
      <a href="track.png">Forecast track map</a>
    `;

    const links = extractLinks(html, 'https://example.test/base/index.html');
    const operational = filterOperationalLinks(links);

    expect(links).toHaveLength(3);
    expect(operational.map((link) => link.title)).toEqual([
      'Latest warning bulletin',
      'Forecast track map',
    ]);
  });

  it('converts HTML snippets to readable text', () => {
    expect(htmlToText('<main>Hello&nbsp;<strong>cyclone</strong></main>')).toBe('Hello cyclone');
  });
});
