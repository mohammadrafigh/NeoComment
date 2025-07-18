import {
  bootstrapApplication,
  provideNativeScriptHttpClient,
  provideNativeScriptRouter,
  runNativeScriptAngularApp,
} from "@nativescript/angular";
import { provideZonelessChangeDetection } from "@angular/core";
import { withInterceptorsFromDi } from "@angular/common/http";
import { routes } from "./app/app.routes";
import { AppComponent } from "./app/app.component";
import { withInMemoryScrolling } from "@angular/router";

runNativeScriptAngularApp({
  appModuleBootstrap: () => {
    return bootstrapApplication(AppComponent, {
      providers: [
        provideNativeScriptHttpClient(withInterceptorsFromDi()),
        provideNativeScriptRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
        provideZonelessChangeDetection(),
      ],
    });
  },
});
