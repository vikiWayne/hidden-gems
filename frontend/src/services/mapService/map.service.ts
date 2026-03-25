import { requests } from "@/api";
import type { GetMapViewportParams } from "./types/requests";

export const getMapConfig = () => {
  return requests.get("/map/config");
};

export const getMapViewport = (params: GetMapViewportParams) => {
  return requests.get("/map/viewport", { params });
};
