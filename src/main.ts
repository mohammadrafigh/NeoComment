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
  // To prevent memory leaks in rare cases per plugin documentation
  Application.on(Application.exitEvent, (args) => imageModuleShutDown());

  // Set status bar and navigation bar styles
  Application.android.on(
    Application.AndroidApplication.activityStartedEvent,
    (args) => {
      const window = args.activity.getWindow();
      const decorView = window.getDecorView();
      const View = android.view.View;

      // TODO: Mohammad 07-31-2025: Remove the hardcoded colors when themes are implemented
      const color = android.graphics.Color.parseColor("#FAFAFA");
      window.setStatusBarColor(color);
      window.setNavigationBarColor(color);
      decorView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
    },
  );
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
