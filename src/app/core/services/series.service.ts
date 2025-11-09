import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { Series, SeriesDTO } from "../models/series.model";
import { map } from "rxjs";
import { SeriesSeason, SeriesSeasonDTO } from "../models/series-season.model";
import {
  SeriesEpisode,
  SeriesEpisodeDTO,
} from "../models/series-episode.model";

@Injectable({
  providedIn: "root",
})
export class SeriesService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);

  getSeriesDetails(seriesUUID: string) {
    return this.http
      .get<SeriesDTO>(`${this.stateService.instanceURL()}/api/tv/${seriesUUID}`)
      .pipe(map((seriesDTO: SeriesDTO) => Series.fromDTO(seriesDTO)));
  }

  getSeasonDetails(seasonUUID: string) {
    return this.http
      .get<SeriesSeasonDTO>(
        `${this.stateService.instanceURL()}/api/tv/season/${seasonUUID}`,
      )
      .pipe(
        map((seasonDTO: SeriesSeasonDTO) => SeriesSeason.fromDTO(seasonDTO)),
      );
  }

  getEpisodeDetails(episodeUUID: string) {
    return this.http
      .get<SeriesEpisodeDTO>(
        `${this.stateService.instanceURL()}/api/tv/episode/${episodeUUID}`,
      )
      .pipe(
        map((episodeDTO: SeriesEpisodeDTO) =>
          SeriesEpisode.fromDTO(episodeDTO),
        ),
      );
  }

  getTrendingSeriesDetails(
    uuid: string,
    type: "TVShow" | "TVSeason" | "TVEpisode",
  ) {
    if (type === "TVSeason") {
      this.getSeasonDetails(uuid).subscribe({
        next: (season: SeriesSeason) => {
          this.stateService.updateSeries(season);
        },
        error: (e) => console.error(e),
      });
    } else if (type === "TVEpisode") {
      this.getEpisodeDetails(uuid).subscribe({
        next: (episode: SeriesEpisode) => {
          this.stateService.updateSeries(episode);
        },
        error: (e) => console.error(e),
      });
    } else {
      this.getSeriesDetails(uuid).subscribe({
        next: (series: Series) => {
          this.stateService.updateSeries(series);
        },
        error: (e) => console.error(e),
      });
    }
  }
}
