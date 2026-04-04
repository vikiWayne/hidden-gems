/**
 * Users service response types
 */

export interface SearchUser {
  id: string;
  username: string;
}

export interface SearchUsersResponse {
  users: SearchUser[];
}
