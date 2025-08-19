import { FediAccount, FediAccountDTO } from "./fedi-account.model";

export interface FediSearchResultDTO {
  accounts: FediAccountDTO[];
  statuses: []; // Note: Mohammad 08-14-2025: Not implemented and might not needed
  hashtags: []; // Note: Mohammad 08-14-2025: Not implemented and might not needed
}

export class FediSearchResult {
  accounts: FediAccount[];
  currentPage = 1;

  static fromDTO(dto: FediSearchResultDTO): FediSearchResult {
    const searchResult = new FediSearchResult();
    searchResult.accounts = dto.accounts.map(a => FediAccount.fromDTO(a));

    return searchResult;
  }
}
