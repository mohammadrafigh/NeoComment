import {
  bootstrapApplication,
  provideNativeScriptHttpClient,
  provideNativeScriptRouter,
  runNativeScriptAngularApp,
} from "@nativescript/angular";
import { provideZonelessChangeDetection } from "@angular/core";
import { withInterceptors } from "@angular/common/http";
import { routes } from "./app/app.routes";
import { AppComponent } from "./app/app.component";
import { withInMemoryScrolling } from "@angular/router";
import { authInterceptor } from "./app/core/interceptors/auth.interceptor";
import { tokenInterceptor } from "./app/core/interceptors/token.interceptor";

runNativeScriptAngularApp({
  appModuleBootstrap: () => {
    return bootstrapApplication(AppComponent, {
      providers: [
        provideNativeScriptHttpClient(withInterceptors([ authInterceptor, tokenInterceptor ])),
        provideNativeScriptRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
        provideZonelessChangeDetection(),
      ],
    });
  },
});
