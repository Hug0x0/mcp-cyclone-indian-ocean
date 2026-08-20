import { Commune } from './types.js';
import { distanceKm } from './utils.js';

export const COMMUNES: Commune[] = [
  { name: 'Saint-Denis', territory: 'reunion', lat: -20.8789, lon: 55.4481 },
  { name: 'Sainte-Marie', territory: 'reunion', lat: -20.8968, lon: 55.5494 },
  { name: 'Sainte-Suzanne', territory: 'reunion', lat: -20.9069, lon: 55.6071 },
  { name: 'Saint-André', territory: 'reunion', lat: -20.9633, lon: 55.6503 },
  { name: 'Saint-Benoît', territory: 'reunion', lat: -21.0338, lon: 55.7128 },
  { name: 'Sainte-Rose', territory: 'reunion', lat: -21.1287, lon: 55.7961 },
  { name: 'Saint-Philippe', territory: 'reunion', lat: -21.3585, lon: 55.7679 },
  { name: 'Saint-Joseph', territory: 'reunion', lat: -21.3774, lon: 55.6169 },
  { name: 'Saint-Pierre', territory: 'reunion', lat: -21.3419, lon: 55.4778 },
  { name: 'Saint-Louis', territory: 'reunion', lat: -21.2859, lon: 55.4112 },
  { name: 'Cilaos', territory: 'reunion', lat: -21.1367, lon: 55.4719 },
  { name: 'Le Tampon', territory: 'reunion', lat: -21.2766, lon: 55.5177 },
  { name: 'L’Étang-Salé', territory: 'reunion', lat: -21.2709, lon: 55.3685 },
  { name: 'Saint-Leu', territory: 'reunion', lat: -21.1706, lon: 55.2885 },
  { name: 'Trois-Bassins', territory: 'reunion', lat: -21.1012, lon: 55.2968 },
  { name: 'Saint-Paul', territory: 'reunion', lat: -21.0096, lon: 55.2713 },
  { name: 'Le Port', territory: 'reunion', lat: -20.9394, lon: 55.2872 },
  { name: 'La Possession', territory: 'reunion', lat: -20.9297, lon: 55.3359 },
  { name: 'Salazie', territory: 'reunion', lat: -21.0278, lon: 55.5394 },
  { name: 'Entre-Deux', territory: 'reunion', lat: -21.2497, lon: 55.4707 },
  { name: 'Petite-Île', territory: 'reunion', lat: -21.3539, lon: 55.5648 },
  { name: 'Bras-Panon', territory: 'reunion', lat: -20.9963, lon: 55.6781 },
  { name: 'Les Avirons', territory: 'reunion', lat: -21.2416, lon: 55.3372 },
  { name: 'La Plaine-des-Palmistes', territory: 'reunion', lat: -21.1341, lon: 55.6267 },
  { name: 'Mamoudzou', territory: 'mayotte', lat: -12.7806, lon: 45.2278 },
  { name: 'Dzaoudzi', territory: 'mayotte', lat: -12.7888, lon: 45.2699 },
  { name: 'Pamandzi', territory: 'mayotte', lat: -12.7967, lon: 45.2847 },
  { name: 'Koungou', territory: 'mayotte', lat: -12.7336, lon: 45.2042 },
  { name: 'Bandraboua', territory: 'mayotte', lat: -12.7044, lon: 45.1233 },
  { name: 'Acoua', territory: 'mayotte', lat: -12.7234, lon: 45.0583 },
  { name: 'Mtsamboro', territory: 'mayotte', lat: -12.6999, lon: 45.0685 },
  { name: 'Tsingoni', territory: 'mayotte', lat: -12.7899, lon: 45.1021 },
  { name: 'Sada', territory: 'mayotte', lat: -12.8507, lon: 45.1047 },
  { name: 'Chirongui', territory: 'mayotte', lat: -12.9319, lon: 45.1483 },
  { name: 'Bouéni', territory: 'mayotte', lat: -12.9024, lon: 45.0764 },
  { name: 'Bandrélé', territory: 'mayotte', lat: -12.9067, lon: 45.1919 },
  { name: 'Dembéni', territory: 'mayotte', lat: -12.8456, lon: 45.1842 },
  { name: 'Ouangani', territory: 'mayotte', lat: -12.8465, lon: 45.1372 },
  { name: 'Chiconi', territory: 'mayotte', lat: -12.8334, lon: 45.1109 },
  { name: 'Mtsangamouji', territory: 'mayotte', lat: -12.7612, lon: 45.0836 },
  { name: 'M’Tsapéré', territory: 'mayotte', lat: -12.7925, lon: 45.2195 },
];

export function nearestCommunes(
  point: { lat: number; lon: number },
  options: { territory?: 'reunion' | 'mayotte'; radiusKm: number; limit: number }
) {
  return COMMUNES
    .filter((commune) => !options.territory || commune.territory === options.territory)
    .map((commune) => {
      const roundedDistance = Math.round(distanceKm(point, commune) * 10) / 10;
      return {
        commune: commune.name,
        territory: commune.territory,
        distance_km: roundedDistance,
        within_radius: roundedDistance <= options.radiusKm,
      };
    })
    .sort((a, b) => a.distance_km - b.distance_km)
    .slice(0, options.limit);
}
