/**
 * Users service - API calls
 */

import { requests } from "@/api";
import type { SearchUsersParams } from "./types/requests";

export const searchUsers = (params: SearchUsersParams) => {
  return requests.get("/users/search", { params });
};
