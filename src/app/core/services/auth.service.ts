import { inject, Injectable, signal } from "@angular/core";
import { SecureStorageService } from "./secure-storage.service";
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs";
import { Utils } from "@nativescript/core";
import { MessageService } from "~/app/core/services/message.service";
import { DatabaseService } from "~/app/core/services/database.service";
import { Router } from "@angular/router";
import { Session } from "~/app/core/models/session.model";
import { State } from "../models/state.model";

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
  private dbService = inject(DatabaseService);

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
      this._activeSession.set(activeSession);
      this._signedIn.set(true);
      this.router.navigate(["/explore"], { replaceUrl: true });
    } else if (sessions.length > 0) {
      sessions[0].isActive = true;
      this._activeSession.set(sessions[0]);
      this.storageService.setSync("sessions", JSON.stringify(sessions));
      this._signedIn.set(true);
      this.router.navigate(["/explore"], { replaceUrl: true });
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
            this.messageService.showErrorMessage("The instance is unavailable");
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

          const state = new State();
          state.instanceURL = this.instanceURL;
          state.sessionId = this._activeSession().id;
          await this.dbService.createState(state);

          this._signedIn.set(true);

          this.router.navigate(["/explore"], { replaceUrl: true });
        },
        error: (err) => {
          console.error("Error handling OAuth response:", err);
          this.messageService.showErrorMessage(
            "Unable to complete authentication. Please try again."
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
      await this.dbService.deleteState(this._activeSession().id);
    } catch {
      console.log("Couldn't delete state data");
    }

    if (activateNextSession && sessions.length > 0) {
      this._activeSession.set(sessions[0]);
      this._signedIn.set(true);
      this.router.navigate(["/explore"], { replaceUrl: true });
    } else {
      this._activeSession.set(null);
      this._signedIn.set(false);
      this.router.navigate(["/sign-in"], { replaceUrl: true });
    }
  }
}
