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
      [ngClass]="buttonClass"
    >
      <Label [text]="icon" class="tabler-icon mr-2"></Label>
      <Label [text]="text"></Label>
    </StackLayout>
  `,
})
export class IconTextButtonComponent {
  @Input() icon: string;
  @Input() text: string;
  @Input() buttonClass: string;
  @Output() pressed = new EventEmitter();

  onPressed() {
    this.pressed.emit();
  }

  onTouch(event: any) {
    const view = event.object;
    if (event.action === "down") {
      view.className = `rounded-full h-10 text-center ${this.buttonClass} pressed`;
    } else if (event.action === "up" || event.action === "cancel") {
      view.className = `rounded-full h-10 text-center ${this.buttonClass}`;
    }
  }
}
