import {
  AfterViewInit,
  Component,
  NO_ERRORS_SCHEMA,
  ViewChild,
  ViewContainerRef,
  inject,
} from "@angular/core";
import { PageRouterOutlet } from "@nativescript/angular";
import { MessageService } from "./core/services/message.service";

@Component({
  selector: "ns-app",
  templateUrl: "./app.component.html",
  imports: [PageRouterOutlet],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppComponent implements AfterViewInit {
  @ViewChild("messageAnchor", { read: ViewContainerRef }) messageAnchorRef: ViewContainerRef;
  messageService = inject(MessageService);

  ngAfterViewInit(): void {
    this.messageService.registerAnchorRef(this.messageAnchorRef);
  }
}
