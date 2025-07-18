export interface UserDTO {
  url: string;
  external_acct: string;
  display_name: string;
  avatar: string;
}

export class User {
  url: string;
  externalAcct: string;
  displayName: string;
  avatar: string;

  static fromDTO(dto: UserDTO): User {
    const user = new User();
    user.url = dto.url;
    user.externalAcct = dto.external_acct;
    user.displayName = dto.display_name;
    user.avatar = dto.avatar;
    return user;
  }

  static toDTO(user: User): UserDTO {
    return {
      url: user.url,
      external_acct: user.externalAcct,
      display_name: user.displayName,
      avatar: user.avatar,
    };
  }
}
