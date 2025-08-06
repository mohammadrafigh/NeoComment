import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { StateService } from "./state.service";
import { Game, GameDTO } from "../models/game.model";

@Injectable({
  providedIn: "root",
})
export class GameService {
  private http = inject(HttpClient);
  private stateService = inject(StateService);

  getGameDetails(gameUUID: string) {
    this.http
      .get<GameDTO>(`${this.stateService.instanceURL()}/api/game/${gameUUID}`)
      .subscribe({
        next: (gameDTO: GameDTO) => {
          this.stateService.updateGame(Game.fromDTO(gameDTO));
        },
        error: (e) => console.error(e),
      });
  }
}
