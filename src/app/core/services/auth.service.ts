import { inject, Injectable, signal } from "@angular/core";
import { SecureStorageService } from "./secure-storage.service";
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs";
import { Utils } from "@nativescript/core";
import { MessageService } from "~/app/core/services/message.service";
import { StateService } from "~/app/core/services/state.service";
import { Router } from "@angular/router";
import { Session } from "~/app/core/models/session.model";
import { localize } from "@nativescript/localize";

interface OAuthResponse {
  id: string;
  name: string;
  website: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  vapid_key: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private storageService = inject(SecureStorageService);
  private messageService = inject(MessageService);
  private stateService = inject(StateService);

  private REDIRECT_URI = "neocomment://neocomment.app/oauth";
  // Temporary properties for OAuth flow
  private instanceURL: string;
  private clientId: string;
  private clientSecret: string;

  // States
  private _activeSession = signal<Session>(null);
  activeSession = this._activeSession.asReadonly();
  private _signedIn = signal<boolean>(false);
  signedIn = this._signedIn.asReadonly();

  loadActiveSession() {
    const sessions = this.storageService.getSync<Session[]>("sessions") || [];
    const activeSession = sessions.find((s) => s.isActive);
    if (activeSession) {
      this.setActiveSession(activeSession);
    } else if (sessions.length > 0) {
      sessions[0].isActive = true;
      this.storageService.setSync("sessions", JSON.stringify(sessions));
      this.setActiveSession(sessions[0]);
    }
  }

  registerClient(instanceURL: string) {
    if (!instanceURL.startsWith("https://")) {
      instanceURL = `https://${instanceURL}`;
    }

    return this.http
      .post<OAuthResponse>(`${instanceURL}/api/v1/apps`, {
        client_name: "NeoComment",
        redirect_uris: this.REDIRECT_URI,
        website: "https://github.com/mohammadrafigh/NeoComment",
      })
      .pipe(
        tap({
          next: (res) => {
            this.instanceURL = instanceURL;
            this.clientId = res.client_id;
            this.clientSecret = res.client_secret;
            Utils.openUrl(
              `${instanceURL}/oauth/authorize?response_type=code&client_id=${this.clientId}&redirect_uri=${this.REDIRECT_URI}&scope=read+write`
            );
          },
          error: (err) => {
            console.error("Error registering client:", err);
            this.messageService.showErrorMessage(
              localize("core.auth_service.unavailable_instance")
            );
          },
        })
      );
  }

  handleOAuthResponse(authCode: string) {
    this.http
      .post<TokenResponse>(`${this.instanceURL}/oauth/token`, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code: authCode,
        redirect_uri: this.REDIRECT_URI,
        grant_type: "authorization_code",
      })
      .subscribe({
        next: async (res) => {
          const sessions =
            this.storageService.getSync<Session[]>("sessions") || [];
          sessions.forEach((s) => (s.isActive = false));

          this._activeSession.set({
            id: crypto.randomUUID(),
            isActive: true,
            accessToken: res.access_token,
          });
          sessions.push(this._activeSession());
          this.storageService.setSync("sessions", JSON.stringify(sessions));

          this.stateService.createNewState(
            this._activeSession().id,
            this.instanceURL
          );

          this._signedIn.set(true);

          this.router.navigate(["/explore"], { replaceUrl: true });
        },
        error: (err) => {
          console.error("Error handling OAuth response:", err);
          this.messageService.showErrorMessage(
            localize("core.auth_service.authentication_error")
          );
        },
      });
  }

  /**
   *
   * @param activateNextSession if set to true, we will activate next session (if there is any) otherwise we will navigate user to sign-in
   */
  async signOut(activateNextSession: boolean) {
    let sessions = this.storageService.getSync<Session[]>("sessions") || [];
    sessions = sessions.filter((s) => s.id !== this._activeSession().id);
    this.storageService.setSync("sessions", JSON.stringify(sessions));

    try {
      await this.stateService.deleteState(this._activeSession().id);
    } catch {
      console.log("Couldn't delete state data");
    }

    if (activateNextSession && sessions.length > 0) {
      this.setActiveSession(sessions[0]);
    } else {
      this.setActiveSession(null);
    }
  }

  private setActiveSession(session: Session) {
    if (session) {
      this._activeSession.set(session);
      this._signedIn.set(true);
      this.stateService.activateState(this._activeSession().id);
      this.router.navigate(["/explore"], { replaceUrl: true });
    } else {
      this._activeSession.set(null);
      this._signedIn.set(false);
      this.router.navigate(["/sign-in"], { replaceUrl: true });
    }
  }
}
