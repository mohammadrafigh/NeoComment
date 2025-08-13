import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { SearchResult, SearchResultDTO } from "../models/search-result.model";
import { map } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SearchService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);

  getSearchDetails(query: string, category?: string, page?: number) {
    let queryString = `?query=${query}`;
    if (category) {
      queryString = `${queryString}&category=${category}`;
    }
    if (page) {
      queryString = `${queryString}&page=${page}`;
    }

    return this.http
      .get<SearchResultDTO>(
        `${this.stateService.instanceURL()}/api/catalog/search${queryString}`,
      )
      .pipe(
        map((searchResultDTO: SearchResultDTO) => {
          return SearchResult.fromDTO(searchResultDTO);
        }),
      );
  }
}
