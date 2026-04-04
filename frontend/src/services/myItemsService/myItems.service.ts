/**
 * My Items service - API calls
 */

import { requests } from "@/api";

export const getMyItems = (userId: string) => {
  return requests.get("/users/me/items", { params: { userId } });
};
