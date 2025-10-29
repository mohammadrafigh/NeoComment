import {
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  NO_ERRORS_SCHEMA,
  Output,
  signal,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import {
  ModalDialogOptions,
  ModalDialogService,
  NativeScriptCommonModule,
  NativeScriptFormsModule,
} from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { IconTextButtonComponent } from "~/app/shared/components/icon-text-button/icon-text-button.component";
import { TooltipDirective } from "~/app/shared/directives/tooltip.directive";
import { DatePickerDialogComponent } from "~/app/shared/components/date-picker/date-picker.component";
import { isAndroid } from "@nativescript/core";
import { Review } from "~/app/core/models/post/review.model";
import { ShelfMark } from "~/app/core/models/post/shelf-mark.model";
import { Note } from "~/app/core/models/post/note.model";
import { Status } from "~/app/core/models/post/status.model";

@Component({
  selector: "ns-post-editor",
  templateUrl: "./post-editor.component.html",
  imports: [
    NativeScriptFormsModule,
    NativeScriptCommonModule,
    NativeScriptLocalizeModule,
    IconTextButtonComponent,
    TooltipDirective,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class PostEditorComponent {
  @ViewChild("contentInput") contentInput: ElementRef;
  @Input() post: ShelfMark | Review | Note | Status;
  @Input() hint: string;
  @Input() contentProperty: string;
  @Input() disableSubmitButton = false;
  @Input() submitButtonLoading = false;
  @Input() allowChangingDate = true;
  @Input() showCrosspost = true;
  @Output() postPressed = new EventEmitter();
  viewContainerRef = inject(ViewContainerRef);
  modalService = inject(ModalDialogService);
  hasCustomDate = signal(false);

  initContentInput() {
    this.addSpoilerAction();

    if (isAndroid) {
      const nativeTextView = this.contentInput.nativeElement.android;
      nativeTextView.setSelection(this.post[this.contentProperty]?.length);
      this.contentInput.nativeElement.focus();
    }
  }

  addSpoilerAction() {
    if (isAndroid) {
      const nativeTextView = this.contentInput.nativeElement.android;

      nativeTextView.setCustomSelectionActionModeCallback(
        new android.view.ActionMode.Callback({
          onCreateActionMode: (mode, menu) => {
            menu.add(0, 1001, 0, "Spoiler");
            return true;
          },
          onPrepareActionMode: (mode, menu) => true,
          onActionItemClicked: (mode, item) => {
            if (item.getItemId() === 1001) {
              this.wrapSpoilerContent();
              mode.finish();
              return true;
            }
            return false;
          },
          onDestroyActionMode: (mode) => {},
        }),
      );
    }
  }

  wrapSpoilerContent() {
    if (isAndroid) {
      const nativeTextView = this.contentInput.nativeElement.android;
      const start = nativeTextView.getSelectionStart();
      const end = nativeTextView.getSelectionEnd();

      const text = nativeTextView.getText().toString();
      const before = text.substring(0, start);
      const selected = text.substring(start, end);
      const after = text.substring(end);

      const newText = `${before}>!${selected}!<${after}`;

      nativeTextView.setText(newText);

      nativeTextView.setSelection(end + 2);
    }
  }

  toggleVisibility() {
    this.post.visibility =
      this.post.visibility < 2 ? this.post.visibility + 1 : 0;
  }

  async showDatePicker() {
    if (!(this.post instanceof Status)) {
      const options: ModalDialogOptions = {
        viewContainerRef: this.viewContainerRef,
        fullscreen: false,
        context: { date: this.post.createdTime },
      };

      const result = await this.modalService.showModal(
        DatePickerDialogComponent,
        options,
      );

      if (result) {
        this.hasCustomDate.set(result !== this.post.createdTime);
        this.post.createdTime = result;
      }
    }
  }

  onPostPressed() {
    this.postPressed.emit();
  }
}
