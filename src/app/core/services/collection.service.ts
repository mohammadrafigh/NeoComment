import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { catchError, concatMap, forkJoin, map, Observable, of } from "rxjs";
import { Collection, CollectionDTO } from "../models/collection.model";
import { BaseItem, BaseItemDTO } from "../models/base-item.model";

interface CollectionListDTO {
  data: CollectionDTO[];
  pages: number;
  count: number;
}

interface CollectionList {
  data: Collection[];
  pages: number;
  count: number;
}

interface BaseItemListDTO {
  data: BaseItemDTO[];
  pages: number;
  count: number;
}

interface BaseItemList {
  collectionUUID: string;
  data: BaseItem[];
  pages: number;
  count: number;
}

@Injectable({
  providedIn: "root",
})
export class CollectionService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);

  getUserCollections(page: number): Observable<CollectionList> {
    return this.http
      .get<CollectionListDTO>(
        `${this.stateService.instanceURL()}/api/me/collection?page=${page}`,
      )
      .pipe(
        map((res) => ({
          pages: res.pages,
          count: res.count,
          data: res.data.map((c) => Collection.fromDTO(c)),
        })),
      );
  }

  getItemsInUserCollections(
    collections: Collection[],
    page: number,
    pageSize: number,
  ): Observable<BaseItemList[]> {
    return forkJoin(
      collections.map((collection) =>
        this.http
          .get<BaseItemListDTO>(
            `${this.stateService.instanceURL()}/api/me/collection/${collection.uuid}/item/?page=${page}&page_size=${pageSize}`,
          )
          .pipe(
            map((res) => ({
              collectionUUID: collection.uuid,
              pages: res.pages,
              count: res.count,
              data: res.data.map((i) => BaseItem.fromDTO(i)),
            })),
          ),
      ),
    );
  }

  getUserCollectionsWithItemCheck(itemUUID: string, page: number) {
    return this.getUserCollections(page).pipe(
      concatMap((collectionsRes) =>
        // NOTE: Mohammad 11-01-2025: We assume 2000, Hopefully there are no more items in a collection
        this.getItemsInUserCollections(collectionsRes.data, 1, 2000)
          .pipe(
            catchError((err) => {
              console.dir(err);
              return of([] as BaseItemList[]);
            }),
          )
          .pipe(
            map((cItems) => {
              const collectionsWithItem: string[] = [];
              for (const collection of collectionsRes.data) {
                const isItemIncluded = !!cItems
                  .find((ci) => ci.collectionUUID === collection.uuid)
                  ?.data.find((i) => i.uuid === itemUUID);
                if (isItemIncluded) {
                  collectionsWithItem.push();
                }
              }
              return { ...collectionsRes, collectionsWithItem };
            }),
          ),
      ),
    );
  }

  getCollectionDetails(collectionUUID: string) {
    return this.http
      .get<CollectionDTO>(
        `${this.stateService.instanceURL()}/api/collection/${collectionUUID}`,
      )
      .pipe(
        map((collectionDTO: CollectionDTO) =>
          Collection.fromDTO(collectionDTO),
        ),
      );
  }
}
