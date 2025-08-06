import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { Music, MusicDTO } from "../models/music.model";

@Injectable({
  providedIn: "root",
})
export class MusicService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);

  getMusicDetails(musicUUID: string) {
    this.http
      .get<MusicDTO>(`${this.stateService.instanceURL()}/api/album/${musicUUID}`)
      .subscribe({
        next: (musicDTO: MusicDTO) => {
          this.stateService.updateMusic(Music.fromDTO(musicDTO));
        },
        error: (e) => console.error(e),
      });
  }
}
