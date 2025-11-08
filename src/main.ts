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
import { RouteReuseStrategy } from "@angular/router";
import { TNSImageModule } from "@nativescript-community/ui-image/angular";
import { CustomRouteReuseStrategy } from "./app/core/services/route-reuse-strategy";
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
import {
  Application,
  ApplicationSettings,
  Button,
  Label,
  Screen,
  Utils,
  View,
} from "@nativescript/core";
import { NativeScriptMaterialBottomSheetModule } from "@nativescript-community/ui-material-bottomsheet/angular";
import { androidLaunchEventLocalizationHandler } from "@nativescript/localize";

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
        {
          provide: RouteReuseStrategy,
          useClass: CustomRouteReuseStrategy,
        },
        provideZonelessChangeDetection(),
        importProvidersFrom(
          NativeScriptLocalizeModule,
          TNSImageModule,
          NativeScriptMaterialBottomSheetModule,
        ),
      ],
    });
  },
});

// Initialize the image module with downsampling enabled
imageModuleInitialize({ isDownsampleEnabled: true });

// Initialize localization handler to be able to change language dynamically
Application.on(Application.launchEvent, (args) => {
  if (args.android) {
    androidLaunchEventLocalizationHandler();
  }
});

if (Application.android) {
  // To prevent memory leaks in rare cases per plugin documentation
  Application.on(Application.exitEvent, (args) => imageModuleShutDown());

  // Apply native color themes, These should be set before app start so we cannot do it in the ThemeService
  Application.android.on(
    Application.AndroidApplication.activityCreatedEvent,
    (args) => {
      const activity = args.activity;
      const context = activity.getApplicationContext();

      const themeId = context
        .getResources()
        .getIdentifier(
          ApplicationSettings.getString("theme") === "beach"
            ? "AppThemeBeach"
            : "AppThemeForest",
          "style",
          context.getPackageName(),
        );

      activity.setTheme(themeId);
    },
  );

  // Set status bar and navigation bar styles
  Application.android.on(
    Application.AndroidApplication.activityStartedEvent,
    (args) => {
      const decorView = args.activity.getWindow().getDecorView();

      decorView.setSystemUiVisibility(
        android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
          android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
          android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR,
      );

      // Workaround for https://issuetracker.google.com/issues/36911528?pli=1
      const rootView = args.activity.findViewById(android.R.id.content);
      rootView.setOnApplyWindowInsetsListener(
        new android.view.View.OnApplyWindowInsetsListener({
          onApplyWindowInsets(view, insets) {
            if (android.os.Build.VERSION.SDK_INT >= 30) {
              // Android 11+ API
              const imeInsets = insets.getInsets(
                android.view.WindowInsets.Type.ime(),
              );
              view.setPadding(0, 0, 0, imeInsets.bottom);
              return insets;
            } else {
              const bottomInset = insets.getSystemWindowInsetBottom();
              view.setPadding(0, 0, 0, bottomInset);
              return insets.replaceSystemWindowInsets(
                insets.getSystemWindowInsetLeft(),
                insets.getSystemWindowInsetTop(),
                insets.getSystemWindowInsetRight(),
                0, // remove bottom inset so it doesn’t double-apply
              );
            }
          },
        }),
      );
    },
  );

  // Set statusbarSize and navigationbarSize to use as top/bottom padding of pages
  const statusbarRId = Utils.android
    .getApplicationContext()
    .getResources()
    .getIdentifier("status_bar_height", "dimen", "android");
  const navigationbarRId = Utils.android
    .getApplication()
    .getResources()
    .getIdentifier("navigation_bar_height", "dimen", "android");
  if (statusbarRId > 0) {
    global.statusbarSize =
      Utils.android
        .getApplicationContext()
        .getResources()
        .getDimensionPixelSize(statusbarRId) / Screen.mainScreen.scale;
  }
  if (navigationbarRId > 0) {
    global.navigationbarSize =
      Utils.android
        .getApplicationContext()
        .getResources()
        .getDimensionPixelSize(navigationbarRId) / Screen.mainScreen.scale;
  }
}

// Workaround for https://github.com/NativeScript/NativeScript/issues/10769
// Utility to check if the CSS class includes "tabler-icon" or "no-font-padding"
function hasNoPaddingClasses(view: View): boolean {
  const classes = (view.className || "").split(" ");
  return classes.includes("tabler-icon") || classes.includes("no-font-padding");
}

// Patch for Button
const originalButtonOnLoaded = Button.prototype.onLoaded;
Button.prototype.onLoaded = function () {
  originalButtonOnLoaded.call(this);
  if (this.nativeViewProtected?.setIncludeFontPadding) {
    this.nativeViewProtected.setIncludeFontPadding(false);
  }
};

// Patch for Label
const originalLabelOnLoaded = Label.prototype.onLoaded;
Label.prototype.onLoaded = function () {
  originalLabelOnLoaded.call(this);
  if (
    hasNoPaddingClasses(this) &&
    this.nativeViewProtected?.setIncludeFontPadding
  ) {
    this.nativeViewProtected.setIncludeFontPadding(false);
  }
};
