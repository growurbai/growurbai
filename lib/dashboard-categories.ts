export const dashboardCategories = [
  "Skincare",
  "Fashion",
  "Jewelry",
  "Food",
  "Electronics",
  "Home Decor",
] as const;

export type DashboardCategory = (typeof dashboardCategories)[number];
