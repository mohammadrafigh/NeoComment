import { inject, Injectable, signal } from "@angular/core";
import { SecureStorageService } from "../../core/services/secure-storage.service";
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs";

interface OAuthResponse {
  id: string;
  name: string;
  website: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  vapid_key: string;
}

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private storageService = inject(SecureStorageService);
  private http = inject(HttpClient);
  private clientId: string;
  private clientSecret: string;

  // user = signal<Item[]>()

  // getItem(id: number): Item {
  //   return this.items().find((item) => item.id === id)
  // }

  registerClient(instanceURL: string) {
    return this.http
      .post<OAuthResponse>(`${instanceURL}/api/v1/apps`, {
        client_name: "NeoComment",
        redirect_uris: "urn:ietf:wg:oauth:2.0:oob",
        website: "https://github.com/mohammadrafigh/NeoComment",
      })
      .pipe(
        tap({
          next: (res) => {
            this.clientId = res.client_id;
            this.clientSecret = res.client_secret;
          },
          error: (err) => {
            console.error("Error registering client:", err);
          },
        })
      );
  }
}
