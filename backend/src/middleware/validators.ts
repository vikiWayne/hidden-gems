import { LOOT_ITEM_CONFIG } from "../config/items.config.js";
import type { LootItemType } from "../config/items.config.js";
import {
  asRecord,
  readCoordinates,
  readEnum,
  readNumber,
  readString,
  readStringArray,
} from "../utils/validation.js";
import { ValidationError } from "../lib/errors.js";

const markerColors = [
  "purple",
  "orange",
  "green",
  "gold",
  "teal",
  "blue",
  "red",
  "pink",
] as const;
const messageTypes = ["text", "voice", "image", "video"] as const;
const visibilities = ["public", "private"] as const;
const mapFilters = ["all", "messages", "chests", "loot"] as const;
const itemTypes = ["message", "chest", "loot"] as const;
const chestVariants = ["normal", "snake"] as const;
const lootTypes = Object.keys(LOOT_ITEM_CONFIG) as LootItemType[];

export function parseNearbyQuery(input: unknown): {
  lat: number;
  lng: number;
  alt?: number;
  userId?: string;
  filter?: string;
} {
  const source = asRecord(input, "query");
  const { lat, lng } = readCoordinates(source, "lat", "lng");
  const alt = readNumber(source, "alt");
  const userId = readString(source, "userId");
  const filter =
    source.filter == null ? undefined : readEnum(source, "filter", mapFilters);
  return { lat, lng, alt, userId, filter };
}

export function parseIdParams(input: unknown): { id: string } {
  const source = asRecord(input, "params");
  return { id: readString(source, "id", { required: true }) as string };
}

export function parseCreateMessageBody(input: unknown) {
  const source = asRecord(input, "body");
  const content = readString(source, "content", { required: true }) as string;
  const latitude = readNumber(source, "latitude", {
    required: true,
    min: -90,
    max: 90,
  }) as number;
  const longitude = readNumber(source, "longitude", {
    required: true,
    min: -180,
    max: 180,
  }) as number;

  return {
    type:
      source.type == null
        ? "text"
        : readEnum(source, "type", messageTypes, "text"),
    content,
    mediaUrl: readString(source, "mediaUrl"),
    latitude,
    longitude,
    altitude: readNumber(source, "altitude"),
    visibility:
      source.visibility == null
        ? "public"
        : readEnum(source, "visibility", visibilities, "public"),
    allowedUserIds: readStringArray(source, "allowedUserIds"),
    category: readString(source, "category"),
    createdBy: readString(source, "createdBy"),
    markerColor:
      source.markerColor == null
        ? undefined
        : readEnum(source, "markerColor", markerColors),
  };
}

export function parseUpdateMessageBody(input: unknown) {
  const source = asRecord(input, "body");
  return {
    content: readString(source, "content"),
    visibility:
      source.visibility == null
        ? undefined
        : readEnum(source, "visibility", visibilities),
    allowedUserIds:
      source.allowedUserIds == null
        ? undefined
        : readStringArray(source, "allowedUserIds"),
    category: readString(source, "category"),
    markerColor:
      source.markerColor == null
        ? undefined
        : readEnum(source, "markerColor", markerColors),
  };
}

export function parseUserIdQuery(input: unknown): { userId: string } {
  const source = asRecord(input, "query");
  return { userId: readString(source, "userId", { required: true }) as string };
}

export function parseClaimBody(input: unknown): { userId: string } {
  const source = asRecord(input, "body");
  return { userId: readString(source, "userId", { required: true }) as string };
}

export function parseRegisterBody(input: unknown) {
  const source = asRecord(input, "body");
  return {
    username: readString(source, "username", { required: true }) as string,
    password: readString(source, "password", { required: true }) as string,
    fullName: readString(source, "fullName", { required: true }) as string,
  };
}

export function parseLoginBody(input: unknown) {
  const source = asRecord(input, "body");
  return {
    username: readString(source, "username", { required: true }) as string,
    password: readString(source, "password", { required: true }) as string,
  };
}

export function parseUsernameQuery(input: unknown): { username: string } {
  const source = asRecord(input, "query");
  return {
    username: readString(source, "username", { required: true }) as string,
  };
}

export function parseCreateChestBody(input: unknown) {
  const source = asRecord(input, "body");
  return {
    content: readString(source, "content", { required: true }) as string,
    latitude: readNumber(source, "latitude", {
      required: true,
      min: -90,
      max: 90,
    }) as number,
    longitude: readNumber(source, "longitude", {
      required: true,
      min: -180,
      max: 180,
    }) as number,
    altitude: readNumber(source, "altitude"),
    xpReward: readNumber(source, "xpReward"),
    coinReward: readNumber(source, "coinReward"),
    variant:
      source.variant == null
        ? "normal"
        : readEnum(source, "variant", chestVariants, "normal"),
    createdBy: readString(source, "createdBy"),
  };
}

export function parseViewportQuery(input: unknown) {
  const source = asRecord(input, "query");
  const minLat = readNumber(source, "minLat", {
    required: true,
    min: -90,
    max: 90,
  }) as number;
  const maxLat = readNumber(source, "maxLat", {
    required: true,
    min: -90,
    max: 90,
  }) as number;
  const minLng = readNumber(source, "minLng", {
    required: true,
    min: -180,
    max: 180,
  }) as number;
  const maxLng = readNumber(source, "maxLng", {
    required: true,
    min: -180,
    max: 180,
  }) as number;

  if (minLat >= maxLat || minLng >= maxLng) {
    throw new ValidationError("minLat < maxLat and minLng < maxLng required");
  }

  return {
    minLat,
    maxLat,
    minLng,
    maxLng,
    userId: readString(source, "userId"),
    userLat: readNumber(source, "userLat", { min: -90, max: 90 }),
    userLng: readNumber(source, "userLng", { min: -180, max: 180 }),
    filter:
      source.filter == null
        ? undefined
        : readEnum(source, "filter", mapFilters),
  };
}

export function parseCreateLootBody(input: unknown) {
  const source = asRecord(input, "body");
  const type =
    source.type == null
      ? "diamond"
      : readEnum(source, "type", lootTypes, "diamond");
  return {
    type,
    content: readString(source, "content", { required: true }) as string,
    latitude: readNumber(source, "latitude", {
      required: true,
      min: -90,
      max: 90,
    }) as number,
    longitude: readNumber(source, "longitude", {
      required: true,
      min: -180,
      max: 180,
    }) as number,
    altitude: readNumber(source, "altitude"),
    xpReward: readNumber(source, "xpReward"),
    coinReward: readNumber(source, "coinReward"),
    createdBy: readString(source, "createdBy"),
  };
}

export function parseSearchUsersQuery(input: unknown): {
  q: string;
  limit: number;
} {
  const source = asRecord(input, "query");
  const q = readString(source, "q") ?? "";
  const limit = readNumber(source, "limit", { min: 1, max: 20 }) ?? 5;
  return { q, limit };
}

export function parseRateItemBody(input: unknown): {
  userId: string;
  itemType: "message" | "chest" | "loot";
  itemId: string;
  rating: number;
} {
  const source = asRecord(input, "body");
  return {
    userId: readString(source, "userId", { required: true }) as string,
    itemType: readEnum(source, "itemType", itemTypes),
    itemId: readString(source, "itemId", { required: true }) as string,
    rating: readNumber(source, "rating", {
      required: true,
      min: 1,
      max: 5,
    }) as number,
  };
}

export function parseRatingParams(input: unknown): {
  itemType: "message" | "chest" | "loot";
  itemId: string;
} {
  const source = asRecord(input, "params");
  return {
    itemType: readEnum(source, "itemType", itemTypes),
    itemId: readString(source, "itemId", { required: true }) as string,
  };
}

export function parseSeedBody(input: unknown): { lat: number; lng: number } {
  const source = asRecord(input, "body");
  const { lat, lng } = readCoordinates(source, "lat", "lng");
  return { lat, lng };
}
