export type SightingType =
  | "nest_entry"
  | "screaming_party"
  | "single_bird"
  | "other";

export interface Sighting {
  id: string;
  user_id: string;
  sighting_type: SightingType;
  latitude: number;
  longitude: number;
  location_name: string | null;
  bird_count: number | null;
  notes: string | null;
  photo_url: string | null;
  sighted_at: string;
  created_at: string;
}
