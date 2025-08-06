import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { Movie, MovieDTO } from "../models/movie.model";

@Injectable({
  providedIn: "root",
})
export class MovieService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);

  getMovieDetails(movieUUID: string) {
    this.http
      .get<MovieDTO>(`${this.stateService.instanceURL()}/api/movie/${movieUUID}`)
      .subscribe({
        next: (movieDTO: MovieDTO) => {
          this.stateService.updateMovie(Movie.fromDTO(movieDTO));
        },
        error: (e) => console.error(e),
      });
  }
}
