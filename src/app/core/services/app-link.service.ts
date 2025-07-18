import { inject, Injectable } from "@angular/core";
import { registerUniversalLinkCallback } from "@nativescript-community/universal-links";
import { AuthService } from "./auth.service";

/**
 * Registers a handler for App Links (Universal Links)
 */
@Injectable({
  providedIn: "root",
})
export class AppLinkService {
  private authService = inject(AuthService);

  registerHandler() {
    registerUniversalLinkCallback((ul) => {
      const url = new URL(ul);

      switch (url.pathname) {
        case "/oauth": {
          this.authService.handleOAuthResponse(url.searchParams.get("code"));
          break;
        }
        default: {
          console.log("AppLinkService: Unhandled path", url.pathname);
        }
      }
    });
  }
}
