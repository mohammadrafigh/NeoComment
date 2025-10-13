import {
  Component,
  inject,
  NO_ERRORS_SCHEMA,
  OnInit,
  signal,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import {
  NativeScriptCommonModule,
  NativeScriptFormsModule,
} from "@nativescript/angular";
import { NativeScriptLocalizeModule } from "@nativescript/localize/angular";
import { BottomSheetParams } from "@nativescript-community/ui-material-bottomsheet/angular";
import { BaseItem } from "~/app/core/models/base-item.model";
import { NeoDBLocalizePipe } from "../../../pipes/neodb-localize.pipe";
import { StateService } from "~/app/core/services/state.service";
import { MessageService } from "~/app/core/services/message.service";
import { localize } from "@nativescript/localize";
import { cloneDeep } from "lodash-es";
import { finalize } from "rxjs";
import { Dialogs } from "@nativescript/core";
import { NoteService } from "~/app/core/services/note.service";
import { PostEditorComponent } from "../post-editor/post-editor.component";
import { SenderProfileComponent } from "../sender-profile/sender-profile.component";
import { Note } from "~/app/core/models/post/note.model";
import { CATEGORIES } from "~/app/shared/constants/categories";
import { IconTextButtonComponent } from "../../icon-text-button/icon-text-button.component";

@Component({
  selector: "ns-note",
  templateUrl: "./note.component.html",
  imports: [
    NativeScriptFormsModule,
    NativeScriptCommonModule,
    NativeScriptLocalizeModule,
    NeoDBLocalizePipe,
    PostEditorComponent,
    SenderProfileComponent,
    IconTextButtonComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class NoteComponent implements OnInit {
  @ViewChild("messageAnchor", { read: ViewContainerRef })
  messageAnchor: ViewContainerRef;
  params = inject(BottomSheetParams);
  stateService = inject(StateService);
  messageService = inject(MessageService);
  noteService = inject(NoteService);
  item = signal<BaseItem>(null);
  note = new Note();
  postLoading = signal(false);
  removeLoading = signal(false);
  chosenProgressType = signal<string>(null);
  progressTypes = new Map([[localize("common.none"), null]]);

  ngOnInit(): void {
    this.item.set(this.params.context.item);
    this.note = cloneDeep(this.params.context.review) ?? new Note();

    for (const type of CATEGORIES.get(this.item().category).noteProgressTypes) {
      this.progressTypes.set(localize(`common.${type}`), type);
    }

    if (!this.note.postId) {
      this.note.postToFediverse =
        this.stateService.preference().defaultCrosspost;
      this.note.visibility = this.stateService.preference().defaultVisibility;
    } else {
      this.chosenProgressType.set(this.note.progressType);
    }
  }

  showProgressTypes() {
    Dialogs.action({
      title: localize("common.progress_type"),
      cancelButtonText: localize("common.cancel"),
      actions: [...this.progressTypes.keys()],
      cancelable: true,
    }).then((result) => {
      if (result) {
        this.note.progressType = this.progressTypes.get(result);
        this.chosenProgressType.set(this.note.progressType);
      }
    });
  }

  post() {
    if (!this.note.title || this.note.title.trim().length === 0) {
      this.messageService.showErrorMessage(
        localize("common.add_title_message"),
        this.messageAnchor,
      );
      return;
    }

    if (!this.note.content || this.note.content.trim().length === 0) {
      this.messageService.showErrorMessage(
        localize("common.add_note_content_message"),
        this.messageAnchor,
      );
      return;
    }

    this.postLoading.set(true);

    if (this.note.uuid) {
      this.noteService
        .updateNote(this.note)
        .pipe(finalize(() => this.postLoading.set(false)))
        .subscribe({
          next: () => this.close({ note: this.note, isRemoved: false }),
          error: () =>
            this.messageService.showErrorMessage(
              localize("common.generic_error"),
              this.messageAnchor,
            ),
        });
    } else {
      this.noteService
        .saveNote(this.item().uuid, this.note)
        .pipe(finalize(() => this.postLoading.set(false)))
        .subscribe({
          next: () => this.close({ note: this.note, isRemoved: false }),
          error: () =>
            this.messageService.showErrorMessage(
              localize("common.generic_error"),
              this.messageAnchor,
            ),
        });
    }
  }

  async remove() {
    const res = await Dialogs.confirm({
      message: localize("common.note_removal_notice"),
      okButtonText: localize("common.yes"),
      cancelButtonText: localize("common.no"),
    });
    if (!res) {
      return;
    }

    this.removeLoading.set(true);
    this.noteService
      .removeNote(this.note.uuid)
      .pipe(finalize(() => this.removeLoading.set(false)))
      .subscribe({
        next: () => this.close({ note: this.note, isRemoved: true }),
        error: () =>
          this.messageService.showErrorMessage(
            localize("common.generic_error"),
            this.messageAnchor,
          ),
      });
  }

  close(result?: { note: Note; isRemoved: boolean }) {
    this.params.closeCallback(result);
  }
}
