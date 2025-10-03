import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { map } from "rxjs";
import { Collection, CollectionDTO } from "../models/collection.model";

@Injectable({
  providedIn: "root",
})
export class CollectionService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);

  getCollectionDetails(collectionUUID: string) {
    return this.http
      .get<CollectionDTO>(`${this.stateService.instanceURL()}/api/collection/${collectionUUID}`)
      .pipe(map((collectionDTO: CollectionDTO) => Collection.fromDTO(collectionDTO)));
  }
}
