import { Component, NO_ERRORS_SCHEMA, inject } from "@angular/core";
import {
  NativeScriptCommonModule,
  NativeScriptFormsModule,
  NativeScriptRouterModule,
} from "@nativescript/angular";
import { AuthService } from "../../../core/services/auth.service";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";

@Component({
  selector: "ns-sign-in",
  templateUrl: "./sign-in.component.html",
  styleUrls: ["./sign-in.component.css"],
  imports: [
    NativeScriptCommonModule,
    NativeScriptRouterModule,
    NativeScriptFormsModule,
    NativeScriptLocalizeModule,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class SignInComponent {
  authService = inject(AuthService);
  instanceURL: string;
  loading = false;

  constructor() {}

  checkInstance() {
    this.loading = true;
    this.authService.registerClient(this.instanceURL).subscribe({
      complete: () => (this.loading = false),
    });
  }
}
