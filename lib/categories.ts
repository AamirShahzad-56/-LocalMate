
export type CategoryId =
  | "services"
  | "hospitals"
  | "fitness"
  | "parks"
  | "shopping"
  | "food"
  | "hotels";

export type OsmTag = {
  key: string;
  values: string[];
};

export type Category = {
  id: CategoryId;
  label: string;
  osmTags: OsmTag[];
};

export const CATEGORIES: Category[] = [
  {
    id: "services",
    label: "Services",
    osmTags: [
      {
        key: "amenity",
        values: ["bank", "atm", "pharmacy", "post_office", "police", "fuel"],
      },
    ],
  },
  {
    id: "hospitals",
    label: "Hospitals",
    osmTags: [{ key: "amenity", values: ["hospital", "clinic"] }],
  },
  {
    id: "fitness",
    label: "Fitness centers",
    osmTags: [
      { key: "leisure", values: ["fitness_centre", "sports_centre"] },
    ],
  },
  {
    id: "parks",
    label: "Parks",
    osmTags: [{ key: "leisure", values: ["park", "garden"] }],
  },
  {
    id: "shopping",
    label: "Shopping places",
    osmTags: [
      { key: "shop", values: ["mall", "supermarket"] },
      { key: "amenity", values: ["marketplace"] },
    ],
  },
  {
    id: "food",
    label: "Food outlets",
    osmTags: [
      { key: "amenity", values: ["restaurant", "cafe", "fast_food"] },
    ],
  },
  {
    id: "hotels",
    label: "Hotels",
    osmTags: [
      { key: "tourism", values: ["hotel", "guest_house"] },
    ],
  },
];

export const AREA_TAB = {
  id: "area",
  label: "Area details",
} as const;

export type TabId = CategoryId | typeof AREA_TAB.id;

export const TABS: { id: TabId; label: string }[] = [
  { id: AREA_TAB.id, label: AREA_TAB.label },
  ...CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
  })),
];

export const RADIUS_OPTIONS_KM = [1, 3, 5, 10] as const;

export function getCategory(id: string): Category | undefined {
  return CATEGORIES.find((category) => category.id === id);
}
