import { effect, inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MessageService } from "./message.service";
import { AuthService } from "./auth.service";
import { User, UserDTO } from "../models/user.model";
import { Preference, PreferenceDTO } from "../models/preference.model";
import { StateService } from "./state.service";
import { localize } from "@nativescript/localize";
import { FediAccount, FediAccountDTO } from "../models/fediverse/fedi-account.model";

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
        this.getFediAccount();
        this.getPreference();
      }
    });
  }

  getUserInfo() {
    this.http
      .get<UserDTO>(`${this.stateService.instanceURL()}/api/me`)
      .subscribe({
        next: (user: UserDTO) => {
          this.stateService.setUser(User.fromDTO(user));
        },
        error: (e) => {
          console.error(e);
          this.messageService.showErrorMessage(
            localize("core.user_service.get_user_error"),
          );
        },
      });
  }

  getFediAccount() {
    this.http
      .get<FediAccountDTO>(`${this.stateService.instanceURL()}/api/v1/accounts/verify_credentials`)
      .subscribe({
        next: (fediAccount: FediAccountDTO) => {
          this.stateService.setFediAccount(FediAccount.fromDTO(fediAccount));
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
          this.stateService.setPreference(Preference.fromDTO(preference));
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
