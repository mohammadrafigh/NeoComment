import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { tap } from "rxjs/operators";

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);

  return next(request).pipe(
    tap({
      error: (err: any) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          authService.signOut(false);
          console.error("Unauthorized request, signing out.");
        }
      },
    })
  );
};
