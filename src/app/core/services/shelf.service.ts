import { inject, Injectable, ViewContainerRef } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { map, Observable, tap } from "rxjs";
import { ShelfMark, ShelfMarkDTO } from "../models/post/shelf-mark.model";
import JSONbig from "json-bigint";
import {
  BottomSheetOptions,
  BottomSheetService,
} from "@nativescript-community/ui-material-bottomsheet/angular";
import { BaseItem } from "../models/base-item.model";
import { MarkAndRateComponent } from "~/app/shared/components/post/mark-and-rate/mark-and-rate.component";

@Injectable({
  providedIn: "root",
})
export class ShelfService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);
  private bottomSheet = inject(BottomSheetService);

  getMarkByItem(itemUUID: string): Observable<ShelfMark> {
    return (
      this.http
        .get<string>(
          `${this.stateService.instanceURL()}/api/me/shelf/item/${itemUUID}`,
          // TODO: Mohammad 10-03-2025: Remove when NeoDB returned post_id as string
          { responseType: "text" as "json" },
        )
        // TODO: Mohammad 10-03-2025: Remove when NeoDB returned post_id as string
        .pipe(
          map(JSONbig({ storeAsString: true, useNativeBigInt: true }).parse),
        )
        .pipe(
          map((shelfMarkDTO: ShelfMarkDTO) => {
            return ShelfMark.fromDTO(shelfMarkDTO);
          }),
        )
    );
  }

  saveMark(
    itemUUID: string,
    shelfMark: ShelfMark,
  ): Observable<{ message: string }> {
    return this.http
      .post<{
        message: string;
      }>(
        `${this.stateService.instanceURL()}/api/me/shelf/item/${itemUUID}`,
        ShelfMark.toDTO(shelfMark),
      )
      .pipe(tap({ error: (err) => console.dir(err) }));
  }

  removeMark(itemUUID: string): Observable<{ message: string }> {
    return this.http
      .delete<{
        message: string;
      }>(`${this.stateService.instanceURL()}/api/me/shelf/item/${itemUUID}`)
      .pipe(tap({ error: (err) => console.dir(err) }));
  }

  showMarkAndRateSheet(
    containerRef: ViewContainerRef,
    item: BaseItem,
    shelfMark?: ShelfMark,
  ) {
    const options: BottomSheetOptions = {
      viewContainerRef: containerRef,
      context: { item, shelfMark },
      dismissOnDraggingDownSheet: false,
      transparent: true,
    };

    return this.bottomSheet.show(MarkAndRateComponent, options);
  }
}
