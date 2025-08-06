import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { Podcast, PodcastDTO } from "../models/podcast.model";

@Injectable({
  providedIn: "root",
})
export class PodcastService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);

  getPodcastDetails(podcastUUID: string) {
    this.http
      .get<PodcastDTO>(`${this.stateService.instanceURL()}/api/podcast/${podcastUUID}`)
      .subscribe({
        next: (podcastDTO: PodcastDTO) => {
          this.stateService.updatePodcast(Podcast.fromDTO(podcastDTO));
        },
        error: (e) => console.error(e),
      });
  }
}
