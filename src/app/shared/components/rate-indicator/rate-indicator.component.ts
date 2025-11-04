import { Component, Input, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";

@Component({
  selector: "ns-rate-indicator",
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <StackLayout
      class="rounded-full border-[1] border-neutral-400 bg-forest-300"
      [background]="
        'linear-gradient(to right, transparent ' +
        rate * 10 +
        '%, white ' +
        rate * 10 +
        '%)'
      "
      [height]="size"
      [width]="size"
    ></StackLayout>
  `,
})
export class RateIndicatorComponent {
  @Input() rate: number;
  @Input() size = 18;
}
