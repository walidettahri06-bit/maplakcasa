/** Casablanca neighborhoods served (Casablanca only). */
export const casablancaNeighborhoods = [
  "Aïn Chock",
  "Aïn Diab",
  "Aïn Sebaâ",
  "Anfa",
  "Belvédère",
  "Bourgogne",
  "Californie",
  "CIL",
  "Derb Sultan",
  "Gauthier",
  "Hay Hassani",
  "Hay Mohammadi",
  "Maârif",
  "Mers Sultan",
  "Oasis",
  "Oulfa",
  "Palmier",
  "Racine",
  "Roches Noires",
  "Sidi Bernoussi",
  "Sidi Maârouf",
  "Sidi Moumen",
] as const;

export type Neighborhood = (typeof casablancaNeighborhoods)[number];

/** Arabic letters used on Moroccan plates */
export const plateLetters = ["أ", "ب", "د", "هـ", "و", "ط", "ج", "ح", "ي", "ك", "ل", "م"] as const;

export const drivers = ["Youssef B.", "Hamza E.", "Karim T.", "Anas M."] as const;
