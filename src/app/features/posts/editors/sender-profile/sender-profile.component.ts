import {
  Component,
  Input,
  NO_ERRORS_SCHEMA,
  OnInit,
  signal,
} from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";
import { User } from "~/app/core/models/user.model";

@Component({
  selector: "ns-sender-profile",
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <GridLayout rows="*, auto, auto, *" columns="52, *" class="px-4 h-10">
      <NSImg
        row="0"
        rowSpan="4"
        col="0"
        [src]="user.avatar"
        failureImageUri="font://&#xeb4d;"
        class="tabler-icon text-app-fg-muted text-4xl rounded-full w-10 h-10 mr-3"
        [decodeWidth]="200"
        [decodeHeight]="200"
      ></NSImg>
      <Label
        class="no-font-padding"
        row="1"
        col="1"
        [text]="user.displayName"
      ></Label>
      <Label
        row="2"
        col="1"
        [text]="userHandle()"
        class="text-xs text-app-fg-muted mt-0.5 no-font-padding"
      ></Label>
    </GridLayout>
  `,
})
export class SenderProfileComponent implements OnInit {
  @Input() user: User;
  @Input() instanceURL: string;
  userHandle = signal<string>(null);

  ngOnInit(): void {
    const instanceURL = this.instanceURL;
    this.userHandle.set(
      `@${this.user.username}@${instanceURL.substring(instanceURL.lastIndexOf("/") + 1)}`,
    );
  }
}
