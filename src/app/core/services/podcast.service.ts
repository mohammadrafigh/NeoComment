import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { Podcast, PodcastDTO } from "../models/podcast.model";
import { map } from "rxjs";
import {
  PodcastEpisode,
  PodcastEpisodeDTO,
} from "../models/podcast-episode.model";

interface EpisodesResponseDTO {
  data: PodcastEpisodeDTO[];
  pages: number;
  count: number;
}

export interface EpisodesResponse {
  data: PodcastEpisode[];
  pages: number;
  count: number;
}

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

  getEpisodeDetails(episodeUUID: string) {
    return this.http
      .get<PodcastEpisodeDTO>(
        `${this.stateService.instanceURL()}/api/podcast/episode/${episodeUUID}`,
      )
      .pipe(
        map((episodeDTO: PodcastEpisodeDTO) =>
          PodcastEpisode.fromDTO(episodeDTO),
        ),
      );
  }

  getPodcastEpisodes(podcastUUID: string, page: number) {
    return this.http
      .get<EpisodesResponseDTO>(
        `${this.stateService.instanceURL()}/api/podcast/${podcastUUID}/episode/?page=${page}`,
      )
      .pipe(
        map((resDTO: EpisodesResponseDTO) => ({
          ...resDTO,
          data: resDTO.data.map((e) => PodcastEpisode.fromDTO(e)),
        })),
      );
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
