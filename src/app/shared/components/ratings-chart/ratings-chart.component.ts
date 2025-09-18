import { Component, Input, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";
import { RateIndicatorComponent } from "../rate-indicator/rate-indicator.component";

@Component({
  selector: "ns-ratings-chart",
  imports: [NativeScriptCommonModule, RateIndicatorComponent],
  schemas: [NO_ERRORS_SCHEMA],
  template: ` <GridLayout columns="auto, auto, *" rows="48">
    <ns-rate-indicator col="0" [rate]="rating" [size]="48"></ns-rate-indicator>
    <StackLayout col="1" class="mx-2" verticalAlignment="center">
      <Label
        class="text-2xl text-neutral-500 no-font-padding"
        [text]="rating"
      ></Label>
      <Label
        class="text-neutral-500 no-font-padding text-center mt-0.5"
        [text]="ratingCount"
      ></Label>
    </StackLayout>
    <GridLayout col="2" columns="*, *, *, *, *" rows="48">
      @for (dist of ratingDistribution; track $index) {
        <StackLayout
          [col]="$index"
          [class.mr-1]="$index < 4"
          verticalAlignment="bottom"
        >
          <StackLayout
            class="w-full rounded-tl-sm rounded-tr-sm bg-forest"
            [height]="(ratingDistribution[$index] / 100) * 32"
          ></StackLayout>
          <Label
            class="text-neutral-500 text-xs mt-1 no-font-padding text-center"
            [text]="2 * $index + 1 + '-' + (2 * $index + 2)"
          ></Label>
        </StackLayout>
      }
    </GridLayout>
  </GridLayout>`,
})
export class RatingsChartComponent {
  @Input() rating: number;
  @Input() ratingCount: number;
  @Input() ratingDistribution: number[];
}
