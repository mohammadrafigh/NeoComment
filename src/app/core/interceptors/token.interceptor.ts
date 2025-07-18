import { Observable } from "rxjs";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { AuthService } from "../services/auth.service";

@Injectable({ providedIn: "root" })
export class TokenInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.activeSession()?.accessToken;
    if (token) {
      const cloned = req.clone({
        headers: req.headers.set("Authorization", "Bearer " + token),
      });

      return next.handle(cloned);
    } else {
      return next.handle(req);
    }
  }
}
