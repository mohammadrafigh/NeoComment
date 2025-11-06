import { Component, Input, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";

@Component({
  selector: "ns-rate-indicator",
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  styles: [
    `
      .rate-indicator {
        /* Step-style fill: primary color up to --rate-pct, then app background */
        background: linear-gradient(
          to right,
          var(--color-primary-300) 0%,
          var(--color-primary-300) var(--rate-pct, 0%),
          var(--color-app-bg-pure) var(--rate-pct, 0%)
        );
      }
    `,
  ],
  template: `
    <StackLayout
      class="rate-indicator rounded-full border-[1] border-app-fg-muted-light"
      [style.--rate-pct]="rate * 10 + '%'"
      [height]="size"
      [width]="size"
    ></StackLayout>
  `,
})
export class RateIndicatorComponent {
  @Input() rate: number;
  @Input() size = 18;
}
