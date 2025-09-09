import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { Series, SeriesDTO } from "../models/series.model";
import { map } from "rxjs";

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

  getTrendingSeriesDetails(seriesUUID: string) {
    this.getSeriesDetails(seriesUUID).subscribe({
      next: (series: Series) => {
        this.stateService.updateSeries(series);
      },
      error: (e) => console.error(e),
    });
  }
}
