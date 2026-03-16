/**
 * Route definitions - URL-based tab navigation
 */

export const ROUTES = {
  explore: "/explore",
  mycollection: "/my-collection",
  leaderboard: "/leaderboard",
} as const;

export type TabType = keyof typeof ROUTES;

export const TAB_FROM_PATH: Record<string, TabType> = {
  [ROUTES.explore]: "explore",
  [ROUTES.mycollection]: "mycollection",
  [ROUTES.leaderboard]: "leaderboard",
};

export const PATH_FROM_TAB: Record<TabType, string> = {
  explore: ROUTES.explore,
  mycollection: ROUTES.mycollection,
  leaderboard: ROUTES.leaderboard,
};
