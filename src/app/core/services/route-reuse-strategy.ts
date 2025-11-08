import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot } from "@angular/router";
import {
  NSLocationStrategy,
  NSRouteReuseStrategy,
} from "@nativescript/angular";

@Injectable()
export class CustomRouteReuseStrategy extends NSRouteReuseStrategy {
  constructor(location: NSLocationStrategy) {
    super(location);
  }

  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    current: ActivatedRouteSnapshot,
  ): boolean {
    // first use the global Reuse Strategy evaluation function,
    // which will return true, when we are navigating from the same component to itself
    let shouldReuse = super.shouldReuseRoute(future, current);

    // then check if the noReuse flag is set to true
    if (shouldReuse && current.data.noReuse) {
      // if true, then don't reuse this component
      shouldReuse = false;
    }

    return shouldReuse;
  }
}
