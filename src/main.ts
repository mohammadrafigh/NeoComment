import {
  bootstrapApplication,
  provideNativeScriptHttpClient,
  provideNativeScriptRouter,
  runNativeScriptAngularApp,
} from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import {
  importProvidersFrom,
  provideZonelessChangeDetection,
} from "@angular/core";
import { withInterceptors } from "@angular/common/http";
import { TNSImageModule } from "@nativescript-community/ui-image/angular";
// TODO: Mohammad 07-23-2025: Replace ui-image with image-cache-it which seems to be more performant with Glide when
// image-cache-it fixed large image loading problem https://github.com/triniwiz/nativescript-plugins/issues/217
// or NeoDB provides smaller images https://github.com/neodb-social/neodb/issues/1156
import {
  initialize as imageModuleInitialize,
  shutDown as imageModuleShutDown,
} from "@nativescript-community/ui-image";
import { routes } from "./app/app.routes";
import { AppComponent } from "./app/app.component";
import { withInMemoryScrolling } from "@angular/router";
import { authInterceptor } from "./app/core/interceptors/auth.interceptor";
import { tokenInterceptor } from "./app/core/interceptors/token.interceptor";

runNativeScriptAngularApp({
  appModuleBootstrap: () => {
    return bootstrapApplication(AppComponent, {
      providers: [
        provideNativeScriptHttpClient(
          withInterceptors([authInterceptor, tokenInterceptor]),
        ),
        provideNativeScriptRouter(
          routes,
          withInMemoryScrolling({ scrollPositionRestoration: "enabled" }),
        ),
        provideZonelessChangeDetection(),
        importProvidersFrom(NativeScriptLocalizeModule, TNSImageModule),
      ],
    });
  },
});
