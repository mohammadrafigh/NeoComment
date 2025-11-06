import { Directive, inject } from "@angular/core";
import { ThemeService } from "~/app/core/services/theme.service";

@Directive({
  selector: "[bottomSheetContainer]",
  host: {
    class: "rounded-t-2xl bg-app-bg",
    "[attr.data-theme]": "themeService.theme",
    "[class.app-dark]": "themeService.darkModeEnabled",
  },
})
export class BottomSheetContainerDirective {
  themeService = inject(ThemeService);
}
