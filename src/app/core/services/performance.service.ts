import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { Performance, PerformanceDTO } from "../models/performance.model";
import { map } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class PerformanceService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);

  getPerformanceDetails(performanceUUID: string) {
    return this.http
      .get<PerformanceDTO>(
        `${this.stateService.instanceURL()}/api/performance/${performanceUUID}`,
      )
      .pipe(
        map((performanceDTO: PerformanceDTO) =>
          Performance.fromDTO(performanceDTO),
        ),
      );
  }
}
