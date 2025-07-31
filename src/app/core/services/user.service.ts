import { effect, inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MessageService } from "./message.service";
import { AuthService } from "./auth.service";
import { User, UserDTO } from "../models/user.model";
import { Preference, PreferenceDTO } from "../models/preference.model";
import { StateService } from "./state.service";
import { localize } from "@nativescript/localize";

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
        this.getPreference();
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
          this.messageService.showErrorMessage(
            localize("core.user_service.get_user_error"),
          );
        },
      });
  }

  getPreference() {
    this.http
      .get<PreferenceDTO>(
        `${this.stateService.instanceURL()}/api/me/preference`,
      )
      .subscribe({
        next: (preference: PreferenceDTO) => {
          this.stateService.updateState({
            preference: Preference.fromDTO(preference),
          });
        },
        error: (e) => {
          console.error(e);
          this.messageService.showErrorMessage(
            localize("core.user_service.get_preference_error"),
          );
        },
      });
  }

  getUserByHandle(handle: string) {
    return this.http.get<UserDTO>(
      `${this.stateService.instanceURL()}/api/user/${handle}`,
    );
  }
}
