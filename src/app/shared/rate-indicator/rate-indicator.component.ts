import { Component, Input, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";

@Component({
  selector: "ns-rate-indicator",
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <AbsoluteLayout>
      <StackLayout
        class="bg-forest rounded-full"
        [height]="size - 2"
        [width]="(rate * (size - 2)) / maxRate"
        top="1"
        left="1"
      ></StackLayout>
      <StackLayout
        class="rounded-full border-[1] border-neutral-500"
        [height]="size"
        [width]="size"
      ></StackLayout>
    </AbsoluteLayout>
  `,
})
export class RateIndicatorComponent {
  @Input() rate: number;
  @Input() maxRate = 10;
  @Input() size = 18;
}
