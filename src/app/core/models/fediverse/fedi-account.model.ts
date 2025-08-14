interface AccountRole {
  id: string;
  name: string;
  color: string;
}

interface FieldDTO {
  name: string;
  value: string;
  verified_at: string;
}

interface Field {
  name: string;
  value: string;
  verifiedAt: string;
}

// TODO: Mohammad 08-14-2025: Move to separate file if needed in other models
interface CustomEmojiDTO {
  shortcode: string;
  url: string;
  static_url: string;
  visible_in_picker: boolean;
  category: string;
}

interface CustomEmoji {
  shortcode: string;
  url: string;
  staticURL: string;
  visibleInPicker: boolean;
  category: string;
}

export interface FediAccountDTO {
  id: string;
  username: string;
  acct: string;
  display_name: string;
  locked: boolean;
  bot: boolean;
  noindex?: boolean;
  moved?: FediAccountDTO;
  memorial?: boolean;
  suspended?: boolean;
  limited?: boolean;
  created_at: string;
  note: string;
  url: string;
  avatar: string;
  avatar_static: string;
  header: string;
  header_static: string;
  followers_count: number;
  following_count: number;
  statuses_count: number;
  last_status_at: string;
  indexable: boolean;
  roles: AccountRole[];
  emojis: CustomEmojiDTO[];
  fields: FieldDTO[];
}

export class FediAccount {
  id: string;
  username: string;
  acct: string;
  displayName: string;
  locked: boolean;
  bot: boolean;
  noindex?: boolean;
  moved?: FediAccountDTO;
  memorial?: boolean;
  suspended?: boolean;
  limited?: boolean;
  createdAt: string;
  note: string;
  url: string;
  avatar: string;
  avatarStatic: string;
  header: string;
  headerStatic: string;
  followersCount: number;
  followingCount: number;
  statusesCount: number;
  lastStatusAt: string;
  indexable: boolean;
  roles: AccountRole[];
  emojis: CustomEmoji[];
  fields: Field[];

  static fromDTO(dto: FediAccountDTO): FediAccount {
    const account = new FediAccount();
    account.id = dto.id;
    account.username = dto.username;
    account.acct = dto.acct;
    account.displayName = dto.display_name;
    account.locked = dto.locked;
    account.bot = dto.bot;
    account.noindex = dto.noindex;
    account.moved = dto.moved;
    account.memorial = dto.memorial;
    account.suspended = dto.suspended;
    account.limited = dto.limited;
    account.createdAt = dto.created_at;
    account.note = dto.note;
    account.url = dto.url;
    account.avatar = dto.avatar;
    account.avatarStatic = dto.avatar_static;
    account.header = dto.header;
    account.headerStatic = dto.header_static;
    account.followersCount = dto.followers_count;
    account.followingCount = dto.following_count;
    account.statusesCount = dto.statuses_count;
    account.lastStatusAt = dto.last_status_at;
    account.indexable = dto.indexable;
    account.roles = dto.roles;
    account.emojis = dto.emojis.map((e) => ({
      shortcode: e.shortcode,
      url: e.url,
      staticURL: e.static_url,
      visibleInPicker: e.visible_in_picker,
      category: e.category,
    }));
    account.fields = dto.fields.map((f) => ({
      name: f.name,
      value: f.value,
      verifiedAt: f.verified_at,
    }));

    return account;
  }
}
