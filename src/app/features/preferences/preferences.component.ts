import {
  ChangeDetectionStrategy,
  Component,
  NO_ERRORS_SCHEMA,
  OnInit,
  inject,
  signal,
} from "@angular/core";
import {
  NativeScriptCommonModule,
  NativeScriptFormsModule,
  NativeScriptRouterModule,
} from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import {
  ThemeMode,
  ThemeName,
  ThemeService,
} from "../../core/services/theme.service";
import { MessageService } from "~/app/core/services/message.service";
import { Location } from "@angular/common";

@Component({
  selector: "ns-preferences",
  templateUrl: "./preferences.component.html",
  imports: [
    NativeScriptCommonModule,
    NativeScriptRouterModule,
    NativeScriptFormsModule,
    NativeScriptLocalizeModule,
  ],
  schemas: [NO_ERRORS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreferencesComponent implements OnInit {
  private themeService = inject(ThemeService);
  messageService = inject(MessageService);
  location = inject(Location);
  selectedTheme = signal<ThemeName>("forest");
  selectedMode = signal<ThemeMode>("system");

  ngOnInit(): void {
    this.selectedTheme.set(this.themeService.theme);
    this.selectedMode.set(this.themeService.mode);
  }

  save() {
    this.themeService.applyTheme(this.selectedTheme());
    this.themeService.applyMode(this.selectedMode());
    this.location.back();
  }
}
