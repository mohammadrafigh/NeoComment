import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { Podcast, PodcastDTO } from "../models/podcast.model";
import { map } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class PodcastService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);

  getPodcastDetails(podcastUUID: string) {
    return this.http
      .get<PodcastDTO>(
        `${this.stateService.instanceURL()}/api/podcast/${podcastUUID}`,
      )
      .pipe(map((podcastDTO: PodcastDTO) => Podcast.fromDTO(podcastDTO)));
  }

  getTrendingPodcastDetails(podcastUUID: string) {
    this.getPodcastDetails(podcastUUID).subscribe({
      next: (podcast: Podcast) => {
        this.stateService.updatePodcast(podcast);
      },
      error: (e) => console.error(e),
    });
  }
}
