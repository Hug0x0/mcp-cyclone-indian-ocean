export const ALERT_LEVELS = [
  {
    level: 'pre-alert',
    label_fr: 'Pré-alerte cyclonique',
    meaning: 'A cyclonic threat may affect the territory in the coming days. Prepare and monitor official updates.',
    typical_action: 'Check supplies, secure loose outdoor items, follow official bulletins.',
  },
  {
    level: 'orange',
    label_fr: 'Alerte orange cyclonique',
    meaning: 'Cyclonic danger is expected; dangerous conditions are approaching.',
    typical_action: 'Complete preparations, avoid unnecessary travel, protect property.',
  },
  {
    level: 'red',
    label_fr: 'Alerte rouge cyclonique',
    meaning: 'Cyclonic danger is imminent or underway; movement is heavily restricted.',
    typical_action: 'Shelter indoors, do not travel, keep listening to official instructions.',
  },
  {
    level: 'purple',
    label_fr: 'Alerte violette cyclonique',
    meaning: 'Extreme danger, often during direct eyewall or very severe cyclone impact.',
    typical_action: 'Strict sheltering, stay away from openings, wait for official downgrade.',
  },
  {
    level: 'safeguard',
    label_fr: 'Phase de sauvegarde',
    meaning: 'The main cyclone danger has passed but hazards and damage remain.',
    typical_action: 'Remain cautious, avoid damaged infrastructure, follow emergency guidance.',
  },
] as const;

export function findAlertLevel(query: string) {
  const normalized = query.toLowerCase();
  return ALERT_LEVELS.find(
    (level) =>
      level.level.includes(normalized) ||
      level.label_fr.toLowerCase().includes(normalized)
  );
}
