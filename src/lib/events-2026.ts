// Ford Amphitheater 2026 Concert Schedule
// Dates updated from 2025 to 2026 (same month/day)

export const EVENTS_2026 = [
  { artist: "In This Moment", date: "2026-10-12T19:00:00Z" },
  { artist: "Brantley Gilbert", date: "2026-10-11T19:00:00Z" },
  { artist: "Empire Of The Sun", date: "2026-10-01T19:00:00Z" },
  { artist: "Miranda Lambert", date: "2026-09-28T19:00:00Z" },
  { artist: "Yacht Rock Revue", date: "2026-09-26T19:00:00Z" },
  { artist: "Red Clay Strays", date: "2026-09-12T19:00:00Z" },
  { artist: "Train", date: "2026-09-05T19:00:00Z" },
  { artist: "Weird Al Yankovic", date: "2026-09-04T19:00:00Z" },
  { artist: "Little Big Town", date: "2026-08-30T19:00:00Z" },
  { artist: "Chicago", date: "2026-08-23T19:00:00Z" },
  { artist: "Gavin Adcock", date: "2026-08-22T19:00:00Z" },
  { artist: "311", date: "2026-08-19T19:00:00Z" },
  { artist: "Billy Currington", date: "2026-08-16T19:00:00Z" },
  { artist: "Slightly Stoopid", date: "2026-08-10T19:00:00Z" },
  { artist: "King Gizzard & The Lizard Wizard", date: "2026-08-08T19:00:00Z" },
  { artist: "Glass Animals", date: "2026-08-07T19:00:00Z" },
  { artist: "Beck", date: "2026-07-26T19:00:00Z" },
  { artist: "Cake", date: "2026-07-23T19:00:00Z" },
  { artist: "Dirty Heads", date: "2026-06-27T19:00:00Z" },
  { artist: "Old Dominion", date: "2026-06-20T19:00:00Z" },
  { artist: "Three 6 Mafia", date: "2026-06-13T19:00:00Z" },
  { artist: "Ryan Bingham", date: "2026-06-04T19:00:00Z" },
  { artist: "Louis C.K.", date: "2026-05-31T19:00:00Z" },
  { artist: "The Black Keys", date: "2026-05-25T19:00:00Z" },
  { artist: "Leon Bridges", date: "2026-05-22T19:00:00Z" },
  { artist: "Dwight Yoakam", date: "2026-05-09T19:00:00Z" },
  { artist: "Seether", date: "2026-05-05T19:00:00Z" },
  { artist: "Jason Isbell", date: "2026-05-01T19:00:00Z" },
];

// Get just the artist names for autocomplete
export const EVENT_NAMES = EVENTS_2026.map(e => e.artist).sort();
