import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { Movie, MovieDTO } from "../models/movie.model";
import { map } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class MovieService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);

  getMovieDetails(movieUUID: string) {
    return this.http
      .get<MovieDTO>(
        `${this.stateService.instanceURL()}/api/movie/${movieUUID}`,
      )
      .pipe(map((movieDTO: MovieDTO) => Movie.fromDTO(movieDTO)));
  }

  getTrendingMovieDetails(movieUUID: string) {
    this.getMovieDetails(movieUUID).subscribe({
      next: (movie: Movie) => {
        this.stateService.updateMovie(movie);
      },
      error: (e) => console.error(e),
    });
  }
}
