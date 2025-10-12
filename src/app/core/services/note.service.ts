import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { map, Observable } from "rxjs";
import JSONbig from "json-bigint";
import { Note, NoteDTO } from "../models/post/note.model";

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

  // saveNote(
  //   itemUUID: string,
  //   note: Note,
  // ): Observable<{ message: string }> {
  //   return this.http.post<{ message: string }>(
  //     `${this.stateService.instanceURL()}/api/me/note/item/${itemUUID}`,
  //     Note.toDTO(note),
  //   ).pipe(tap({ error: (err) => console.dir(err) }));
  // }

  // removeNote(itemUUID: string): Observable<{ message: string }> {
  //   return this.http.delete<{ message: string }>(
  //     `${this.stateService.instanceURL()}/api/me/note/item/${itemUUID}`,
  //   ).pipe(tap({ error: (err) => console.dir(err) }));
  // }
}
