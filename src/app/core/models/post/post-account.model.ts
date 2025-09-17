import { BaseAccount, BaseAccountDTO } from "../fediverse/base-account.model";

export interface PostAccountDTO extends BaseAccountDTO {
  group: boolean;
  discoverable: boolean;
}

export class PostAccount extends BaseAccount {
  group: boolean;
  discoverable: boolean;

  static fromDTO(dto: PostAccountDTO): PostAccount {
    const account = new PostAccount();
    super.fillFromDTO(account, dto);
    account.group = dto.group;
    account.discoverable = dto.discoverable;

    return account;
  }
}
