import { Component, inject, NO_ERRORS_SCHEMA, OnInit } from "@angular/core";
import {
  ModalDialogParams,
  NativeScriptCommonModule,
  NativeScriptFormsModule,
} from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { ModalContainerDirective } from "~/app/shared/directives/modal-container.directive";

@Component({
  selector: "ns-date-picker-dialog",
  imports: [
    NativeScriptCommonModule,
    NativeScriptFormsModule,
    NativeScriptLocalizeModule,
    ModalContainerDirective
  ],
  schemas: [NO_ERRORS_SCHEMA],
  template: `
    <StackLayout class="p-4 w-3/4 mx-auto" modalContainer>
      <Label
        [text]="'common.select_date' | L"
        class="text-center mb-2 h1"
      ></Label>

      <DatePicker [(ngModel)]="date" [maxDate]="today"></DatePicker>

      <StackLayout
        orientation="horizontal"
        class="mt-4"
        horizontalAlignment="right"
      >
        <Button
          [text]="'common.cancel' | L"
          (tap)="close()"
          class="basic-button mr-2"
        ></Button>
        <Button
          [text]="'common.ok' | L"
          (tap)="confirm()"
          class="gray-button"
        ></Button>
      </StackLayout>
    </StackLayout>
  `,
})
export class DatePickerDialogComponent implements OnInit {
  private params = inject(ModalDialogParams);
  today = new Date();
  date: Date;

  ngOnInit() {
    this.date = this.params.context.date
      ? new Date(this.params.context.date)
      : new Date();
  }

  confirm() {
    this.params.closeCallback(this.date.toISOString());
  }

  close() {
    this.params.closeCallback(null);
  }
}
