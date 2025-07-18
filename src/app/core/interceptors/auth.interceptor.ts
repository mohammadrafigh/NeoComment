import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AuthService } from "../services/auth.service";

@Injectable({ providedIn: "root" })
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      tap({
        error: (err: any) => {
          if (err instanceof HttpErrorResponse && err.status === 401) {
            this.authService.signOut(false);
            console.error("Unauthorized request, signing out.");
          }
        },
      })
    );
  }
}
