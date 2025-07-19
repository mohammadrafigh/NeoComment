import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";

export const tokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const token = authService.activeSession()?.accessToken;

  if (token) {
    const cloned = req.clone({
      headers: req.headers.set("Authorization", `Bearer ${token}`),
    });
    return next(cloned);
  }

  return next(req);
};
