import { User } from "./user.model";

export class State {
  id: string;
  sessionId: string;
  instanceURL: string;
  user: User;
}
