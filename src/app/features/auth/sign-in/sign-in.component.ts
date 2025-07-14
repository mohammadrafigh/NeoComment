import { Component, NO_ERRORS_SCHEMA, inject } from "@angular/core";
import {
  NativeScriptCommonModule,
  NativeScriptRouterModule,
} from "@nativescript/angular";
import { AuthService } from "../auth.service";
import { MessageService } from "~/app/core/services/message.service";

@Component({
  selector: "ns-sign-in",
  templateUrl: "./sign-in.component.html",
  styleUrls: ["./sign-in.component.css"],
  imports: [NativeScriptCommonModule, NativeScriptRouterModule],
  schemas: [NO_ERRORS_SCHEMA],
})
export class SignInComponent {
  authService = inject(AuthService);
  messageService = inject(MessageService);
  instanceURL: string;
  isValidInstance = false;
  loading = false;

  constructor() {}

  checkInstance() {
    this.loading = true;
    this.authService.registerClient(this.instanceURL).subscribe({
      next: (res) => this.isValidInstance = true,
      error: (err) => {
        this.isValidInstance = false;
        this.messageService.showErrorMessage("The instance is unavailable");
      },
      complete: () => (this.loading = false),
    });
  }
}
