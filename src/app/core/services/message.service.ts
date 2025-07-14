import { Injectable, ViewContainerRef } from "@angular/core";
import { MessageComponent } from "../../shared/message/message.component";

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

  showSimpleMessage(message: string): void {
    const componentRef = this.anchorRef.createComponent(MessageComponent);
    componentRef.setInput('message', message);
    componentRef.setInput('backgroundColor', 'bg-gray-700');
    componentRef.setInput('textColor', 'text-neutral-50');

    setTimeout(() => {
      componentRef.destroy();
    }, this.DURATION);
  }

  showSuccessMessage(message: string): void {
    const componentRef = this.anchorRef.createComponent(MessageComponent);
    componentRef.setInput('message', message);
    componentRef.setInput('backgroundColor', 'bg-green-300');
    componentRef.setInput('textColor', 'text-neutral-950');

    setTimeout(() => {
      componentRef.destroy();
    }, this.DURATION);
  }

  showWarningMessage(message: string): void {
    const componentRef = this.anchorRef.createComponent(MessageComponent);
    componentRef.setInput('message', message);
    componentRef.setInput('backgroundColor', 'bg-orange-300');
    componentRef.setInput('textColor', 'text-neutral-950');

    setTimeout(() => {
      componentRef.destroy();
    }, this.DURATION);
  }

  showErrorMessage(message: string): void {
    const componentRef = this.anchorRef.createComponent(MessageComponent);
    componentRef.setInput('message', message);
    componentRef.setInput('backgroundColor', 'bg-red-300');
    componentRef.setInput('textColor', 'text-neutral-950');

    setTimeout(() => {
      componentRef.destroy();
    }, this.DURATION);
  }
}
