import { effect, inject, Injectable, signal } from "@angular/core";
import { DatabaseService } from "./database.service";
import { StateCache } from "../models/state-cache.model";
import { debounceTime, Subject } from "rxjs";
import { User } from "../models/user.model";
import { Preference } from "../models/preference.model";
import { Book } from "../models/book.model";
import { TrendingItem } from "../models/trending-item.model";
import { TrendingCollection } from "../models/trending-collection.model";

@Injectable({
  providedIn: "root",
})
export class StateService {
  private dbService = inject(DatabaseService);
  private dbSaveTrigger = new Subject<StateCache>();
  private activeSessionId = signal(null);

  private _instanceURL = signal<string>(null);
  instanceURL = this._instanceURL.asReadonly();
  private _user = signal<User>(null);
  user = this._user.asReadonly();
  private _preference = signal<Preference>(null);
  preference = this._preference.asReadonly();
  private _trendingBooks = signal<Book[]>([]);
  trendingBooks = this._trendingBooks.asReadonly();
  private _trendingMovies = signal<TrendingItem[]>([]);
  trendingMovies = this._trendingMovies.asReadonly();
  private _trendingSeries = signal<TrendingItem[]>([]);
  trendingSeries = this._trendingSeries.asReadonly();
  private _trendingMusics = signal<TrendingItem[]>([]);
  trendingMusics = this._trendingMusics.asReadonly();
  private _trendingGames = signal<TrendingItem[]>([]);
  trendingGames = this._trendingGames.asReadonly();
  private _trendingPodcasts = signal<TrendingItem[]>([]);
  trendingPodcasts = this._trendingPodcasts.asReadonly();
  private _trendingCollections = signal<TrendingCollection[]>([]);
  trendingCollections = this._trendingCollections.asReadonly();

  constructor() {
    // ======= Load from DB (cached data) =======
    effect(() => {
      if (this.activeSessionId()) {
        const states = this.dbService.getStates();
        const stateCache = states.find((s) => s.id === this.activeSessionId());
        if (stateCache) {
          // Hydration of signals (state chunks)
          this._instanceURL.set(stateCache.instanceURL);
          this._user.set(stateCache.user);
          this._preference.set(stateCache.preference);
          this._trendingBooks.set(stateCache.trendingBooks || []);
          this._trendingMovies.set(stateCache.trendingMovies || []);
          this._trendingSeries.set(stateCache.trendingSeries || []);
          this._trendingMusics.set(stateCache.trendingMusics || []);
          this._trendingGames.set(stateCache.trendingGames || []);
          this._trendingPodcasts.set(stateCache.trendingPodcasts || []);
          this._trendingCollections.set(stateCache.trendingCollections || []);
        }
      }
    });

    // ======= Save to DB on change =======
    effect(() => {
      if (this.activeSessionId() && this.instanceURL()) {
        const stateCache: StateCache = {
          id: this.activeSessionId(),
          instanceURL: this.instanceURL(),
          user: this.user(),
          preference: this.preference(),
          trendingBooks: this.trendingBooks(),
          trendingMovies: this.trendingMovies(),
          trendingSeries: this.trendingSeries(),
          trendingMusics: this.trendingMusics(),
          trendingGames: this.trendingGames(),
          trendingPodcasts: this.trendingPodcasts(),
          trendingCollections: this.trendingCollections(),
        };
        this.dbSaveTrigger.next(stateCache);
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
    const state = new StateCache();
    state.id = sessionId;
    state.instanceURL = instanceURL;
    this.dbService.createState(state);
    this._instanceURL.set(instanceURL);
    this.activateState(sessionId);
  }

  deleteState(sessionId: string) {
    if (this.activeSessionId() === sessionId) {
      this.activeSessionId.set(null);
    }
    return this.dbService.deleteState(sessionId);
  }

  // ======= State Management Methods =======

  setUser(user: User) {
    this._user.set(user);
  }

  setPreference(preference: Preference) {
    this._preference.set(preference);
  }

  setTrendingBooks(books: Book[]) {
    this._trendingBooks.set(books);
  }

  setTrendingMovies(movies: TrendingItem[]) {
    this._trendingMovies.set(movies);
  }

  setTrendingSeries(series: TrendingItem[]) {
    this._trendingSeries.set(series);
  }

  setTrendingMusics(musics: TrendingItem[]) {
    this._trendingMusics.set(musics);
  }

  setTrendingGames(games: TrendingItem[]) {
    this._trendingGames.set(games);
  }

  setTrendingPodcasts(podcasts: TrendingItem[]) {
    this._trendingPodcasts.set(podcasts);
  }

  setTrendingCollections(collections: TrendingCollection[]) {
    this._trendingCollections.set(collections);
  }

  // -----------------------------------------------------

  updateBook(book: Book) {
    this._trendingBooks.update((books) =>
      books.map((b) => (b.uuid === book.uuid ? book : b)),
    );
  }
}
