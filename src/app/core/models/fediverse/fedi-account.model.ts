import { BaseAccount, BaseAccountDTO } from "./base-account.model";

interface AccountRole {
  id: string;
  name: string;
  color: string;
}

export interface FediAccountDTO extends BaseAccountDTO {
  noindex?: boolean;
  memorial?: boolean;
  followers_count: number;
  following_count: number;
  statuses_count: number;
  last_status_at: string;
  roles: AccountRole[];
}

export class FediAccount extends BaseAccount {
  noindex?: boolean;
  memorial?: boolean;
  followersCount: number;
  followingCount: number;
  statusesCount: number;
  lastStatusAt: string;
  roles: AccountRole[];

  static fromDTO(dto: FediAccountDTO): FediAccount {
    const account = new FediAccount();
    super.fillFromDTO(account, dto);
    account.noindex = dto.noindex;
    account.memorial = dto.memorial;
    account.followersCount = dto.followers_count;
    account.followingCount = dto.following_count;
    account.statusesCount = dto.statuses_count;
    account.lastStatusAt = dto.last_status_at;
    account.roles = dto.roles;

    return account;
  }
}
