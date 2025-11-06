import { Injectable, ViewContainerRef } from "@angular/core";
import { MessageComponent } from "../../shared/components/message/message.component";

@Injectable({
  providedIn: "root",
})
export class MessageService {
  private anchorRef: ViewContainerRef;
  // This should be synced with the MessageComponent's DURATION + animation duration
  private DURATION = 3600;

  registerAnchorRef(anchorRef: ViewContainerRef): void {
    this.anchorRef = anchorRef;
  }

  showSimpleMessage(message: string, anchorRef?: ViewContainerRef): void {
    const anchor = anchorRef ?? this.anchorRef;
    const componentRef = anchor.createComponent(MessageComponent);
    componentRef.setInput("message", message);
    componentRef.setInput("backgroundColor", "bg-app-fg");
    componentRef.setInput("textColor", "text-app-bg");

    setTimeout(() => {
      componentRef.destroy();
    }, this.DURATION);
  }

  showSuccessMessage(message: string, anchorRef?: ViewContainerRef): void {
    const anchor = anchorRef ?? this.anchorRef;
    const componentRef = anchor.createComponent(MessageComponent);
    componentRef.setInput("message", message);
    componentRef.setInput("backgroundColor", "bg-green-300");
    componentRef.setInput("textColor", "text-neutral-950");

    setTimeout(() => {
      componentRef.destroy();
    }, this.DURATION);
  }

  showWarningMessage(message: string, anchorRef?: ViewContainerRef): void {
    const anchor = anchorRef ?? this.anchorRef;
    const componentRef = anchor.createComponent(MessageComponent);
    componentRef.setInput("message", message);
    componentRef.setInput("backgroundColor", "bg-orange-300");
    componentRef.setInput("textColor", "text-neutral-950");

    setTimeout(() => {
      componentRef.destroy();
    }, this.DURATION);
  }

  showErrorMessage(message: string, anchorRef?: ViewContainerRef): void {
    const anchor = anchorRef ?? this.anchorRef;
    const componentRef = anchor.createComponent(MessageComponent);
    componentRef.setInput("message", message);
    componentRef.setInput("backgroundColor", "bg-red-300");
    componentRef.setInput("textColor", "text-neutral-950");

    setTimeout(() => {
      componentRef.destroy();
    }, this.DURATION);
  }
}
