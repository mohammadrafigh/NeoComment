import {
  AfterViewInit,
  Component,
  NO_ERRORS_SCHEMA,
  OnInit,
  ViewChild,
  ViewContainerRef,
  inject,
} from "@angular/core";
import { PageRouterOutlet } from "@nativescript/angular";
import { MessageService } from "./core/services/message.service";
import { AppLinkService } from "./core/services/app-link.service";
import { AuthService } from "./core/services/auth.service";
import { UserService } from "./core/services/user.service";

@Component({
  selector: "ns-app",
  templateUrl: "./app.component.html",
  imports: [PageRouterOutlet],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild("messageAnchor", { read: ViewContainerRef })
  messageAnchorRef: ViewContainerRef;
  messageService = inject(MessageService);
  appLinkService = inject(AppLinkService);
  authService = inject(AuthService);

  // Inject to register app start side effects
  userService = inject(UserService);

  ngOnInit(): void {
    this.appLinkService.registerHandler();
    this.authService.loadActiveSession();
  }

  ngAfterViewInit(): void {
    this.messageService.registerAnchorRef(this.messageAnchorRef);
  }
}
