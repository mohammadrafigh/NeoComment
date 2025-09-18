import {
  Component,
  ElementRef,
  Input,
  NO_ERRORS_SCHEMA,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";
import { Animation } from "@nativescript/core";

@Component({
  selector: "ns-message",
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <GridLayout
      #container
      horizontalAlignment="center"
      verticalAlignment="bottom"
      class="p-4 m-4 rounded-lg min-w-52 opacity-0 translate-y-full"
      [ngClass]="backgroundColor"
    >
      <Label [text]="message" [ngClass]="textColor" class="text-sm"></Label>
    </GridLayout>
  `,
})
export class MessageComponent implements OnInit, OnDestroy {
  @Input() message: string;
  @Input() backgroundColor: string;
  @Input() textColor: string;
  @ViewChild("container", { static: true }) container: ElementRef;
  private DURATION = 3000;
  private timeout: any;

  ngOnInit(): void {
    const view = this.container.nativeElement;
    new Animation([
      {
        target: view,
        translate: { x: 0, y: 0 },
        opacity: 0.9,
        duration: 300,
        curve: "easeOut",
      },
    ]).play();

    this.timeout = setTimeout(() => {
      new Animation([
        {
          target: view,
          translate: { x: 0, y: 100 },
          opacity: 0,
          duration: 300,
          curve: "easeIn",
        },
      ])
        .play()
        .then(() => this.ngOnDestroy());
    }, this.DURATION);
  }

  ngOnDestroy() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }
}
