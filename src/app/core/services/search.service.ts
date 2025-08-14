import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import {
  ItemSearchResult,
  ItemSearchResultDTO,
} from "../models/item-search-result.model";
import {
  FediSearchResult,
  FediSearchResultDTO,
} from "../models/fediverse/fedi-search-result.model";
import { map } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SearchService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);

  searchThroughItems(query: string, category?: string, page?: number) {
    let queryString = `?query=${query}`;
    if (category) {
      queryString = `${queryString}&category=${category}`;
    }
    if (page) {
      queryString = `${queryString}&page=${page}`;
    }

    return this.http
      .get<ItemSearchResultDTO>(
        `${this.stateService.instanceURL()}/api/catalog/search${queryString}`,
      )
      .pipe(
        map((searchResultDTO: ItemSearchResultDTO) => {
          return ItemSearchResult.fromDTO(searchResultDTO);
        }),
      );
  }

  searchThroughFediverse(
    query: string,
    type?: string,
    page?: number,
    limit?: number,
  ) {
    let queryString = `?q=${query}`;
    if (type) {
      queryString = `${queryString}&type=${type}`;
    }
    if (limit) {
      queryString = `${queryString}&limit=${limit}`;

      if (page) {
        queryString = `${queryString}&offset=${page * limit}`;
      }
    }

    return this.http
      .get<FediSearchResultDTO>(
        `${this.stateService.instanceURL()}/api/v2/search${queryString}`,
      )
      .pipe(
        map((searchResultDTO: FediSearchResultDTO) => {
          return FediSearchResult.fromDTO(searchResultDTO);
        }),
      );
  }

  fetchByURL(url: string) {
    return this.http.get<{
      message: string;
      url: string;
    }>(`${this.stateService.instanceURL()}/api/catalog/fetch?url=${url}`);
  }
}
