import { CustomEmoji, CustomEmojiDTO } from "./custom-emoji.model";

interface FieldDTO {
  name: string;
  value: string;
  verified_at: string;
}

class Field {
  name: string;
  value: string;
  verifiedAt: string;

  static fromDTO(dto: FieldDTO): Field {
    const field = new Field();
    field.name = dto.name;
    field.value = dto.value;
    field.verifiedAt = dto.verified_at;

    return field;
  }
}

export interface BaseAccountDTO {
  id: string;
  username: string;
  acct: string;
  display_name: string;
  locked: boolean;
  bot: boolean;
  moved?: BaseAccountDTO;
  suspended?: boolean;
  limited?: boolean;
  created_at: string;
  note: string;
  url: string;
  avatar: string;
  avatar_static: string;
  header: string;
  header_static: string;
  indexable: boolean;
  emojis: CustomEmojiDTO[];
  fields: FieldDTO[];
}

export class BaseAccount {
  id: string;
  username: string;
  acct: string;
  displayName: string;
  locked: boolean;
  bot: boolean;
  moved?: BaseAccountDTO;
  suspended?: boolean;
  limited?: boolean;
  createdAt: string;
  note: string;
  url: string;
  avatar: string;
  avatarStatic: string;
  header: string;
  headerStatic: string;
  indexable: boolean;
  emojis: CustomEmoji[];
  fields: Field[];

  protected static fillFromDTO<
    T1 extends BaseAccount,
    T2 extends BaseAccountDTO,
  >(baseAccount: T1, dto: T2): T1 {
    baseAccount.id = dto.id;
    baseAccount.username = dto.username;
    baseAccount.acct = dto.acct;
    baseAccount.displayName = dto.display_name;
    baseAccount.locked = dto.locked;
    baseAccount.bot = dto.bot;
    baseAccount.moved = dto.moved;
    baseAccount.suspended = dto.suspended;
    baseAccount.limited = dto.limited;
    baseAccount.createdAt = dto.created_at;
    baseAccount.note = dto.note;
    baseAccount.url = dto.url;
    baseAccount.avatar = dto.avatar;
    baseAccount.avatarStatic = dto.avatar_static;
    baseAccount.header = dto.header;
    baseAccount.headerStatic = dto.header_static;
    baseAccount.indexable = dto.indexable;
    baseAccount.emojis = dto.emojis.map(CustomEmoji.fromDTO);
    baseAccount.fields = dto.fields.map(Field.fromDTO);

    return baseAccount;
  }

  static fromDTO(dto: BaseAccountDTO): BaseAccount {
    return this.fillFromDTO(new BaseAccount(), dto);
  }
}
