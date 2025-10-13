import {
  Component,
  EventEmitter,
  Input,
  NO_ERRORS_SCHEMA,
  Output,
} from "@angular/core";
import { NativeScriptCommonModule } from "@nativescript/angular";

@Component({
  selector: "ns-icon-text-button",
  imports: [NativeScriptCommonModule],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <StackLayout
      accessibilityRole="button"
      (tap)="onPressed()"
      (touch)="onTouch($event)"
      class="rounded-full h-10 text-center px-4"
      horizontalAlignment="center"
      orientation="horizontal"
      [ngClass]="buttonClass + (disabled ? ' disabled' : '')"
    >
      <Label [text]="icon" class="tabler-icon" [ngClass]="iconClass"></Label>
      <Label
        [text]="text"
        class="ml-2"
        [ngClass]="textClass"
        [hidden]="!text"
      ></Label>
    </StackLayout>
  `,
})
export class IconTextButtonComponent {
  @Input() icon: string;
  @Input() text: string;
  @Input() buttonClass: string;
  @Input() iconClass: string;
  @Input() textClass: string;
  @Input() disabled: boolean;
  @Output() pressed = new EventEmitter();

  onPressed() {
    if (!this.disabled) {
      this.pressed.emit();
    }
  }

  onTouch(event: any) {
    if (!this.disabled) {
      const view = event.object;
      if (event.action === "down") {
        view.className = `rounded-full h-10 text-center px-4 ${this.buttonClass} pressed`;
      } else if (event.action === "up" || event.action === "cancel") {
        view.className = `rounded-full h-10 text-center px-4 ${this.buttonClass}`;
      }
    }
  }
}
