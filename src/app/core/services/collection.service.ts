import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import {
  catchError,
  concatMap,
  forkJoin,
  map,
  Observable,
  of,
  tap,
} from "rxjs";
import { Collection, CollectionDTO } from "../models/collection.model";
import { BaseItem, BaseItemDTO } from "../models/base-item.model";
import JSONbig from "json-bigint";

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
  data: { item: BaseItemDTO; note: string }[];
  pages: number;
  count: number;
}

interface BaseItemList {
  collectionUUID: string;
  data: { item: BaseItem; note: string }[];
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
        { responseType: "text" as "json" },
      )
      .pipe(
        map(JSONbig({ storeAsString: true, useNativeBigInt: true }).parse),
        map((res: CollectionListDTO) => ({
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
              data: res.data.map((i) => ({
                item: BaseItem.fromDTO(i.item),
                note: i.note,
              })),
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
                  ?.data.find((i) => i.item.uuid === itemUUID);
                if (isItemIncluded) {
                  collectionsWithItem.push(collection.uuid);
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

  createNewCollection(collection: Partial<Collection>) {
    return this.http
      .post<CollectionDTO>(
        `${this.stateService.instanceURL()}/api/me/collection/`,
        {
          title: collection.title,
          brief: collection.brief ?? "",
          visibility: collection.visibility,
        },
        { responseType: "text" as "json" },
      )
      .pipe(
        map(JSONbig({ storeAsString: true, useNativeBigInt: true }).parse),
        map((dto: CollectionDTO) => Collection.fromDTO(dto)),
      )
      .pipe(tap({ error: (err) => console.dir(err) }));
  }

  addItemToCollection(
    collectionUUID: string,
    itemUUID: string,
    note: string = "",
  ) {
    return this.http
      .post<{
        message: string;
      }>(
        `${this.stateService.instanceURL()}/api/me/collection/${collectionUUID}/item/`,
        {
          item_uuid: itemUUID,
          note,
        },
      )
      .pipe(tap({ error: (e) => console.dir(e) }));
  }

  removeItemFromCollection(collectionUUID: string, itemUUID: string) {
    return this.http
      .delete<{
        message: string;
      }>(
        `${this.stateService.instanceURL()}/api/me/collection/${collectionUUID}/item/${itemUUID}`,
      )
      .pipe(tap({ error: (e) => console.dir(e) }));
  }
}
