import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { Series, SeriesDTO } from "../models/series.model";

@Injectable({
  providedIn: "root",
})
export class SeriesService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);

  getSeriesDetails(seriesUUID: string) {
    this.http
      .get<SeriesDTO>(`${this.stateService.instanceURL()}/api/tv/${seriesUUID}`)
      .subscribe({
        next: (seriesDTO: SeriesDTO) => {
          this.stateService.updateSeries(Series.fromDTO(seriesDTO));
        },
        error: (e) => console.error(e),
      });
  }
}
