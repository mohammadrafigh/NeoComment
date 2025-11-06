import { ElementRef, Injectable } from "@angular/core";
import {
  Application,
  ApplicationSettings,
  Color,
  GridLayout,
} from "@nativescript/core";

export type ThemeName = "forest" | "beach";
export type ThemeMode = "light" | "dark" | "system";

@Injectable({ providedIn: "root" })
export class ThemeService {
  private readonly THEME_STORAGE_KEY = "theme";
  private readonly MODE_STORAGE_KEY = "mode";
  private rootLayout: GridLayout;
  private currentTheme: ThemeName = "forest";
  private currentMode: ThemeMode = "system";
  private isDarkMode = false;

  constructor() {
    Application.android.on("activityResumed", () => this.updateNativeColors());
  }

  loadTheme(rootLayout: ElementRef) {
    this.rootLayout = rootLayout.nativeElement as GridLayout;

    const savedTheme = ApplicationSettings.getString(this.THEME_STORAGE_KEY);
    const savedMode = ApplicationSettings.getString(this.MODE_STORAGE_KEY);
    if (savedTheme) {
      this.applyTheme(savedTheme as ThemeName, false);
    }
    if (savedMode) {
      this.applyMode(savedMode as ThemeMode, false);
    }
  }

  applyTheme(theme: ThemeName, shouldSave = true) {
    if (shouldSave) {
      ApplicationSettings.setString(this.THEME_STORAGE_KEY, theme);
    }

    this.currentTheme = theme;
    this.rootLayout.set("data-theme", theme);
  }

  applyMode(mode: ThemeMode, shouldSave = true) {
    if (shouldSave) {
      ApplicationSettings.setString(this.MODE_STORAGE_KEY, mode);
    }

    this.currentMode = mode;
    if (
      mode === "dark" ||
      (mode === "system" && Application.android.systemAppearance() === "dark")
    ) {
      this.rootLayout.cssClasses.add("app-dark");
      this.isDarkMode = true;
      this.updateNativeColors();
    } else {
      this.rootLayout.cssClasses.delete("app-dark");
      this.isDarkMode = false;
      this.updateNativeColors();
    }
  }

  private updateNativeColors() {
    if (android) {
      if (this.isDarkMode) {
        androidx.appcompat.app.AppCompatDelegate.setDefaultNightMode(
          androidx.appcompat.app.AppCompatDelegate.MODE_NIGHT_YES,
        );
      } else {
        androidx.appcompat.app.AppCompatDelegate.setDefaultNightMode(
          androidx.appcompat.app.AppCompatDelegate.MODE_NIGHT_NO,
        );
      }

      const color = this.isDarkMode ? "#262626" : "#fafafa";
      const window = Application.android.startActivity?.getWindow();
      if (window) {
        // Background colors
        window.setStatusBarColor(new Color(color).android);
        window.setNavigationBarColor(new Color(color).android);

        // Icon color (light or dark)
        const decorView = window.getDecorView();
        const flags = decorView.getSystemUiVisibility();

        if (this.isDarkMode) {
          // light icons (dark background)
          decorView.setSystemUiVisibility(
            flags & ~android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR,
          );
        } else {
          // dark icons (light background)
          decorView.setSystemUiVisibility(
            flags | android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR,
          );
        }
      }
    }
  }

  get theme() {
    return this.currentTheme;
  }

  get mode() {
    return this.currentMode;
  }

  get darkModeEnabled() {
    return this.isDarkMode;
  }
}
