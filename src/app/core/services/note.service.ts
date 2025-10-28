import { inject, Injectable, ViewContainerRef } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { map, Observable, tap } from "rxjs";
import JSONbig from "json-bigint";
import { Note, NoteDTO } from "../models/post/note.model";
import { BaseItem } from "../models/base-item.model";
import {
  BottomSheetOptions,
  BottomSheetService,
} from "@nativescript-community/ui-material-bottomsheet/angular";
import { NoteComponent } from "~/app/shared/components/post/note/note.component";

interface UserNotesResponseDTO {
  data: Array<NoteDTO>;
  pages: 0;
  count: 0;
}

export interface UserNotesResponse {
  data: Array<Note>;
  pages: 0;
  count: 0;
}

@Injectable({
  providedIn: "root",
})
export class NoteService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);
  private bottomSheet = inject(BottomSheetService);

  getNotesByItem(
    itemUUID: string,
    count: number,
  ): Observable<UserNotesResponse> {
    // TODO: Mohammad 10-11-2025: Implement pagination
    return (
      this.http
        .get<string>(
          `${this.stateService.instanceURL()}/api/me/note/item/${itemUUID}?page_size=${count}`,
          // TODO: Mohammad 10-03-2025: Remove when NeoDB returned post_id as string
          { responseType: "text" as "json" },
        )
        // TODO: Mohammad 10-03-2025: Remove when NeoDB returned post_id as string
        .pipe(
          map(JSONbig({ storeAsString: true, useNativeBigInt: true }).parse),
        )
        .pipe(
          map((resDTO: UserNotesResponseDTO) => {
            return { ...resDTO, data: resDTO.data.map((n) => Note.fromDTO(n)) };
          }),
        )
    );
  }

  saveNote(itemUUID: string, note: Note): Observable<Note> {
    return this.http
      .post<NoteDTO>(
        `${this.stateService.instanceURL()}/api/me/note/item/${itemUUID}/`,
        Note.toDTO(note),
      )
      .pipe(map((noteDTO) => Note.fromDTO(noteDTO)))
      .pipe(tap({ error: (err) => console.dir(err) }));
  }

  updateNote(note: Note): Observable<{ message: string }> {
    return this.http
      .put<{
        message: string;
      }>(
        `${this.stateService.instanceURL()}/api/me/note/${note.uuid}`,
        Note.toDTO(note),
      )
      .pipe(tap({ error: (err) => console.dir(err) }));
  }

  removeNote(noteUUID: string): Observable<{ message: string }> {
    return this.http
      .delete<{
        message: string;
      }>(`${this.stateService.instanceURL()}/api/me/note/${noteUUID}`)
      .pipe(tap({ error: (err) => console.dir(err) }));
  }

  showNoteSheet(containerRef: ViewContainerRef, item: BaseItem, note?: Note) {
    const options: BottomSheetOptions = {
      viewContainerRef: containerRef,
      context: { item, note },
      dismissOnDraggingDownSheet: false,
      transparent: true,
    };

    return this.bottomSheet.show(NoteComponent, options);
  }
}
