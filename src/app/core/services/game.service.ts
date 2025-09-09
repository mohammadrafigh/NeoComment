import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { Game, GameDTO } from "../models/game.model";
import { map } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class GameService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);

  getGameDetails(gameUUID: string) {
    return this.http
      .get<GameDTO>(`${this.stateService.instanceURL()}/api/game/${gameUUID}`)
      .pipe(map((gameDTO: GameDTO) => Game.fromDTO(gameDTO)));
  }

  getTrendingGameDetails(gameUUID: string) {
    this.getGameDetails(gameUUID).subscribe({
      next: (game: Game) => {
        this.stateService.updateGame(game);
      },
      error: (e) => console.error(e),
    });
  }
}
