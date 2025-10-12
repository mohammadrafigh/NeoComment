import {
  Directive,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { isAndroid, View } from "@nativescript/core";

@Directive({
  selector: "[nsTooltip]",
})
export class TooltipDirective implements OnInit, OnDestroy {
  @Input("nsTooltip") tooltipText: string = "";
  private el = inject(ElementRef);
  private view: View;
  private onLoadedHandler = () => {
    const nativeView = this.view.nativeViewProtected;

    if (nativeView instanceof android.view.View) {
      nativeView.setTooltipText(this.tooltipText);
    }
  };

  ngOnInit() {
    this.view = this.el.nativeElement;

    if (!this.tooltipText || !isAndroid) return;

    // We must wait until the native view is created
    this.view.on(View.loadedEvent, this.onLoadedHandler);
  }

  ngOnDestroy() {
    if (this.view && this.onLoadedHandler) {
      this.view.off(View.loadedEvent, this.onLoadedHandler);
    }
  }
}
