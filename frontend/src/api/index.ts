export { api } from "./client";
export { queryKeys } from "@/services";
// Re-export commonly used types
export type { NearbyChest } from "@/services/chestsService/types/response";
export type { CreatedMessageItem } from "@/services/messagesService/types/response";
export type { CreatedChestItem, FoundChestItem } from "@/services/chestsService/types/response";
export type { FoundLootItem, FoundMessageItem } from "@/services/myItemsService/types/response";
export type * from "./types/requests";
export * from "./axios";
