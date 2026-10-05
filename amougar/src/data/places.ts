export type PlaceCat = 'venue' | 'culture' | 'hotel' | 'food' | 'sight' | 'transport';
export const PLACE_CATS: PlaceCat[] = ['venue', 'culture', 'hotel', 'food', 'sight', 'transport'];

export const CAT_COLOR: Record<PlaceCat, string> = {
  venue: '#b5532f',
  culture: '#5e1a26',
  hotel: '#2f4a6b',
  food: '#8a6a22',
  sight: '#2f6b57',
  transport: '#4a4440',
};

export interface Place {
  id: string;
  cat: PlaceCat;
  lat: number;
  lng: number;
}

/** Coordinates are approximate and for illustration — confirm with the organisers before publishing. */
export const CENTER: [number, number] = [28.438, -11.103];

export const PLACES: Place[] = [
  { id: 'moussem', cat: 'venue', lat: 28.4265, lng: -11.0915 },
  { id: 'stage', cat: 'venue', lat: 28.4302, lng: -11.0868 },
  { id: 'fantasia', cat: 'venue', lat: 28.4226, lng: -11.0962 },
  { id: 'culture', cat: 'culture', lat: 28.4402, lng: -11.1048 },
  { id: 'souk', cat: 'culture', lat: 28.4366, lng: -11.1061 },
  { id: 'mosque', cat: 'culture', lat: 28.4391, lng: -11.1004 },
  { id: 'hotel1', cat: 'hotel', lat: 28.4379, lng: -11.1023 },
  { id: 'hotel2', cat: 'hotel', lat: 28.4284, lng: -11.0832 },
  { id: 'food1', cat: 'food', lat: 28.4412, lng: -11.1019 },
  { id: 'food2', cat: 'food', lat: 28.4821, lng: -11.3354 },
  { id: 'beach', cat: 'sight', lat: 28.4896, lng: -11.3393 },
  { id: 'port', cat: 'sight', lat: 28.4846, lng: -11.3331 },
  { id: 'airport', cat: 'transport', lat: 28.4482, lng: -11.1613 },
  { id: 'bus', cat: 'transport', lat: 28.4351, lng: -11.0985 },
];
