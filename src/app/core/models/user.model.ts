export interface ExternalAccount {
  platform: string;
  handle: string;
  url: string;
}

export interface UserDTO {
  url: string;
  external_accounts: ExternalAccount[];
  display_name: string;
  avatar: string;
  username: string;
  roles: string[];
}

export class User {
  url: string;
  externalAccounts: ExternalAccount[];
  displayName: string;
  avatar: string;
  username: string;
  roles: string[];

  static fromDTO(dto: UserDTO): User {
    const user = new User();
    user.url = dto.url;
    user.externalAccounts = dto.external_accounts;
    user.displayName = dto.display_name;
    user.avatar = dto.avatar;
    user.username = dto.username;
    user.roles = dto.roles;
    return user;
  }

  static toDTO(user: User): UserDTO {
    return {
      url: user.url,
      external_accounts: user.externalAccounts,
      display_name: user.displayName,
      avatar: user.avatar,
      username: user.username,
      roles: user.roles,
    };
  }
}
