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
import { Application, Button, Label, View } from "@nativescript/core";

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

// Initialize the image module with downsampling enabled
imageModuleInitialize({ isDownsampleEnabled: true });
if (Application.android) {
  Application.on(Application.exitEvent, (args) => imageModuleShutDown());
}

// Workaround for https://github.com/NativeScript/NativeScript/issues/10769
// Utility to check if the CSS class includes "tabler-icon"
function hasTablerIconClass(view: View): boolean {
  const cls = view.className || "";
  return cls.split(" ").includes("tabler-icon");
}

// Patch for Button
const originalButtonOnLoaded = Button.prototype.onLoaded;
Button.prototype.onLoaded = function () {
  originalButtonOnLoaded.call(this);
  if (
    hasTablerIconClass(this) &&
    this.nativeViewProtected?.setIncludeFontPadding
  ) {
    this.nativeViewProtected.setIncludeFontPadding(false);
  }
};

// Patch for Label
const originalLabelOnLoaded = Label.prototype.onLoaded;
Label.prototype.onLoaded = function () {
  originalLabelOnLoaded.call(this);
  if (
    hasTablerIconClass(this) &&
    this.nativeViewProtected?.setIncludeFontPadding
  ) {
    this.nativeViewProtected.setIncludeFontPadding(false);
  }
};
