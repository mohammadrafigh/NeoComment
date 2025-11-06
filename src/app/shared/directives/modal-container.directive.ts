import { Directive, inject } from "@angular/core";
import { ThemeService } from "~/app/core/services/theme.service";

@Directive({
  selector: "[modalContainer]",
  host: {
    "[attr.data-theme]": "themeService.theme",
    "[class.app-dark]": "themeService.darkModeEnabled",
  },
})
export class ModalContainerDirective {
  themeService = inject(ThemeService);
}
