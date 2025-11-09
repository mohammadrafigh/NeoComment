import { effect, inject, Injectable, signal } from "@angular/core";
import { DatabaseService } from "./database.service";
import { StateCache } from "../models/state-cache.model";
import { debounceTime, Subject } from "rxjs";
import { User } from "../models/user.model";
import { Preference } from "../models/preference.model";
import { Book } from "../models/book.model";
import { Movie } from "../models/movie.model";
import { Game } from "../models/game.model";
import { Series } from "../models/series.model";
import { Music } from "../models/music.model";
import { Podcast } from "../models/podcast.model";
import { Collection } from "../models/collection.model";
import { FediAccount } from "../models/fediverse/fedi-account.model";
import { SeriesSeason } from "../models/series-season.model";
import { SeriesEpisode } from "../models/series-episode.model";

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
  private _fediAccount = signal<FediAccount>(null);
  fediAccount = this._fediAccount.asReadonly();
  private _preference = signal<Preference>(null);
  preference = this._preference.asReadonly();
  private _trendingBooks = signal<Book[]>([]);
  trendingBooks = this._trendingBooks.asReadonly();
  private _trendingMovies = signal<Movie[]>([]);
  trendingMovies = this._trendingMovies.asReadonly();
  private _trendingSeries = signal<(Series | SeriesSeason | SeriesEpisode)[]>([]);
  trendingSeries = this._trendingSeries.asReadonly();
  private _trendingGames = signal<Game[]>([]);
  trendingGames = this._trendingGames.asReadonly();
  private _trendingMusics = signal<Music[]>([]);
  trendingMusics = this._trendingMusics.asReadonly();
  private _trendingPodcasts = signal<Podcast[]>([]);
  trendingPodcasts = this._trendingPodcasts.asReadonly();
  private _trendingCollections = signal<Collection[]>([]);
  trendingCollections = this._trendingCollections.asReadonly();

  constructor() {
    // ======= Load from DB (cached data) =======
    effect(() => {
      if (this.activeSessionId()) {
        const states = this.dbService.getStates();
        const stateCache = states.find((s) => s.id === this.activeSessionId());
        if (stateCache) {
          // Hydration of signals (state chunks)
          this._instanceURL.set(stateCache.instanceURL || null);
          this._user.set(stateCache.user || null);
          this._fediAccount.set(stateCache.fediAccount || null);
          this._preference.set(stateCache.preference || null);
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
          fediAccount: this.fediAccount(),
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
      .pipe(debounceTime(2000))
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

  setFediAccount(fediAccount: FediAccount) {
    this._fediAccount.set(fediAccount);
  }

  setPreference(preference: Preference) {
    this._preference.set(preference);
  }

  setTrendingBooks(books: Book[]) {
    this._trendingBooks.set(books);
  }

  setTrendingMovies(movies: Movie[]) {
    this._trendingMovies.set(movies);
  }

  setTrendingSeries(series: Series[]) {
    this._trendingSeries.set(series);
  }

  setTrendingGames(games: Game[]) {
    this._trendingGames.set(games);
  }

  setTrendingMusics(musics: Music[]) {
    this._trendingMusics.set(musics);
  }

  setTrendingPodcasts(podcasts: Podcast[]) {
    this._trendingPodcasts.set(podcasts);
  }

  setTrendingCollections(collections: Collection[]) {
    this._trendingCollections.set(collections);
  }

  // -----------------------------------------------------

  updateBook(book: Book) {
    this._trendingBooks.update((books) =>
      books.map((b) => (b.uuid === book.uuid ? book : b)),
    );
  }

  updateMovie(movie: Movie) {
    this._trendingMovies.update((movies) =>
      movies.map((m) => (m.uuid === movie.uuid ? movie : m)),
    );
  }

  updateSeries(seriesItem: Series | SeriesSeason | SeriesEpisode) {
    this._trendingSeries.update((series) =>
      series.map((s) => (s.uuid === seriesItem.uuid ? seriesItem : s)),
    );
  }

  updateGame(game: Game) {
    this._trendingGames.update((games) =>
      games.map((g) => (g.uuid === game.uuid ? game : g)),
    );
  }

  updateMusic(music: Music) {
    this._trendingMusics.update((musics) =>
      musics.map((m) => (m.uuid === music.uuid ? music : m)),
    );
  }

  updatePodcast(podcast: Podcast) {
    this._trendingPodcasts.update((podcasts) =>
      podcasts.map((p) => (p.uuid === podcast.uuid ? podcast : p)),
    );
  }
}
