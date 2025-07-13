import { Component, NO_ERRORS_SCHEMA, inject } from "@angular/core";
import {
  NativeScriptCommonModule,
  NativeScriptRouterModule,
} from "@nativescript/angular";

@Component({
  selector: "ns-sign-in",
  templateUrl: "./sign-in.component.html",
  styleUrls: ["./sign-in.component.css"],
  imports: [NativeScriptCommonModule, NativeScriptRouterModule],
  schemas: [NO_ERRORS_SCHEMA],
})
export class SignInComponent {
  constructor() {}

  checkInstance() {
    console.log("here");
  }
}
