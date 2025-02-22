import { v4 as uuidV4 } from "uuid";
type User = {
  id: string;
  username: string;
  password: string;
};

function genUUID(): string {
  return uuidV4();
}
export const users: User[] = [
  { id: genUUID(), username: "Churros", password: "123456" },
  { id: genUUID(), username: "China", password: "456789" },
];

export function mapUsersResponse() {
  return users.map(({ id, username }) => ({ id, username }));
}
