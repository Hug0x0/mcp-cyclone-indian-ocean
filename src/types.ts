export interface ToolResult {
  [key: string]: unknown;
  content: Array<{
    type: 'text';
    text: string;
  }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}

export interface SourceLink {
  title: string;
  url: string;
}

export interface Commune {
  name: string;
  territory: 'reunion' | 'mayotte';
  lat: number;
  lon: number;
}

export interface RiskDistance {
  commune: string;
  territory: 'reunion' | 'mayotte';
  distance_km: number;
  within_radius: boolean;
}
