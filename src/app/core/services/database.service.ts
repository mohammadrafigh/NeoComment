import { Injectable } from "@angular/core";
import { CouchBase } from "@triniwiz/nativescript-couchbase";
import { StateCache } from "../models/state-cache.model";
import { Application } from "@nativescript/core";

@Injectable({
  providedIn: "root",
})
export class DatabaseService {
  private database = new CouchBase("neocomment");

  constructor() {
    Application.on(Application.exitEvent, () => this.closeDB());
    Application.on(Application.uncaughtErrorEvent, () => this.closeDB());
  }

  closeDB() {
    try {
      this.database.close();
    } catch (e) {
      console.log("Couldn't close database connection");
      console.error(e);
    }
  }

  createState(state: StateCache): string {
    try {
      const id = this.database.createDocument(state, state.id);
      return id;
    } catch (e) {
      console.log(e);
    }
  }

  async updateState(state: StateCache): Promise<void> {
    try {
      this.database.updateDocument(state.id, state);
      return Promise.resolve();
    } catch (e) {
      console.log(e);
      return Promise.reject();
    }
  }

  async deleteState(id: string) {
    try {
      this.database.deleteDocument(id);
      return Promise.resolve();
    } catch (e) {
      console.log(e);
      return Promise.reject();
    }
  }

  getStates(): StateCache[] {
    try {
      const states: StateCache[] = this.database.query();
      return states ?? [];
    } catch (e) {
      console.log(e);
    }
  }
}
