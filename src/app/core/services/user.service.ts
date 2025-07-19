import { effect, inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MessageService } from "./message.service";
import { AuthService } from "./auth.service";
import { User, UserDTO } from "../models/user.model";
import { StateService } from "./state.service";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private http = inject(HttpClient);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private stateService = inject(StateService);

  constructor() {
    effect(() => {
      if (this.authService.signedIn() && this.stateService.instanceURL()) {
        this.getUserInfo();
      }
    });
  }

  getUserInfo() {
    this.http
      .get<UserDTO>(`${this.stateService.instanceURL()}/api/me`)
      .subscribe({
        next: (user: UserDTO) => {
          this.stateService.updateState({ user: User.fromDTO(user) });
        },
        error: (e) => {
          console.error(e);
          this.messageService.showErrorMessage("Unable to get user info");
        },
      });
  }
}
