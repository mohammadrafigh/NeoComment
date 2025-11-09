import {
  Directive,
  OnInit,
  ViewContainerRef,
  WritableSignal,
  computed,
  inject,
  signal,
} from "@angular/core";
import { StateService } from "~/app/core/services/state.service";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "~/app/core/services/message.service";
import { NeoDBLocalizePipe } from "~/app/shared/pipes/neodb-localize.pipe";
import { Location } from "@angular/common";
import { PageTransition, SharedTransition } from "@nativescript/core";
import { shareText } from "@nativescript/social-share";
import { PostsStateService } from "~/app/features/posts/posts-state.service";
import { PostEditorsService } from "~/app/features/posts/editors/post-editors.service";
import {
  BottomSheetOptions,
  BottomSheetService,
} from "@nativescript-community/ui-material-bottomsheet/angular";
import { BaseItem } from "~/app/core/models/base-item.model";
import { AddToCollectionComponent } from "./add-to-collection/add-to-collection.component";

@Directive()
export abstract class BaseItemPageComponent implements OnInit {
  protected bottomSheet = inject(BottomSheetService);
  stateService = inject(StateService);
  messageService = inject(MessageService);
  postsStateService = inject(PostsStateService);
  postEditorsService = inject(PostEditorsService);
  activatedRoute = inject(ActivatedRoute);
  location = inject(Location);
  router = inject(Router);
  containerRef = inject(ViewContainerRef);
  neoL = inject(NeoDBLocalizePipe);
  pageLoading = signal(false);
  descriptionCollapsed = signal(true);
  itemTitle = computed(() =>
    this.item()
      ? this.neoL.transform(this.item().localizedTitle) ||
        this.item().displayTitle ||
        this.item().title
      : undefined,
  );
  abstract item: WritableSignal<BaseItem>;

  ngOnInit(): void {
    const uuid = this.activatedRoute.snapshot.params.uuid;
    this.getItemDetails(uuid);
  }

  abstract getItemDetails(uuid: string);

  share() {
    shareText(this.stateService.instanceURL() + this.item().url);
  }

  navigateToCollection(event: any) {
    const item = event.item;
    this.router.navigate([`/collections/` + item.uuid], {
      transition: SharedTransition.custom(new PageTransition(), {
        pageReturn: {
          duration: 150,
        },
      }),
    } as any);
  }

  showCollections() {
    const options: BottomSheetOptions = {
      viewContainerRef: this.containerRef,
      context: { itemUUID: this.item().uuid },
      dismissOnDraggingDownSheet: false,
      transparent: true,
    };

    this.bottomSheet.show(AddToCollectionComponent, options).subscribe();
  }
}
