import { computed, effect, inject, Injectable, signal } from "@angular/core";
import { DatabaseService } from "./database.service";
import { State } from "../models/state.model";
import { debounceTime, Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class StateService {
  private dbService = inject(DatabaseService);
  private dbSaveTrigger = new Subject<State>();
  private activeSessionId = signal(null);
  private states = signal<State[]>([]);
  readonly activeState = computed(() =>
    this.states().find((s) => s.sessionId === this.activeSessionId())
  );
  readonly instanceURL = computed(() => this.activeState()?.instanceURL);

  constructor() {
    // Load cached data
    this.dbService.getStates().then((states) => this.states.set(states));

    // Save to DB on change
    effect(() => {
      const activeState = this.activeState();
      if (activeState) {
        this.dbSaveTrigger.next(activeState);
      }
    });

    this.dbSaveTrigger
      .pipe(debounceTime(500))
      .subscribe((state) => this.dbService.updateState(state));
  }

  activateState(sessionId: string) {
    this.activeSessionId.set(sessionId);
  }

  createNewState(sessionId: string, instanceURL: string) {
    const state = new State();
    state.sessionId = sessionId;
    state.instanceURL = instanceURL;
    state.id = this.dbService.createState(state);
    this.states.update((states) => {
      states.push(state);
      return states;
    });
    this.activeSessionId.set(sessionId);
  }

  deleteState(sessionId: string) {
    this.states.update((states) =>
      states.filter((s) => s.sessionId !== sessionId)
    );
    if (this.activeSessionId() === sessionId) {
      this.activeSessionId.set(null);
    }
    return this.dbService.deleteState(sessionId);
  }

  updateState(partialState: Partial<State>) {
    this.states.update(states => {
      const stateIndex = states.indexOf(this.activeState());
      states[stateIndex] = {...states[stateIndex], ...partialState};
      return [...states];
    });
  }
}
