import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { Music, MusicDTO } from "../models/music.model";
import { map } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class MusicService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);

  getMusicDetails(musicUUID: string) {
    return this.http
      .get<MusicDTO>(
        `${this.stateService.instanceURL()}/api/album/${musicUUID}`,
      )
      .pipe(map((musicDTO: MusicDTO) => Music.fromDTO(musicDTO)));
  }

  getTrendingMusicDetails(musicUUID: string) {
    this.getMusicDetails(musicUUID).subscribe({
      next: (music: Music) => {
        this.stateService.updateMusic(music);
      },
      error: (e) => console.error(e),
    });
  }
}
