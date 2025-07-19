import { Injectable } from "@angular/core";
import { CouchBase } from "@triniwiz/nativescript-couchbase";
import { State } from "../models/state.model";
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

  createState(state: State): string {
    try {
      const id = this.database.createDocument(state);
      return id;
    } catch (e) {
      console.log(e);
    }
  }

  async updateState(state: State): Promise<void> {
    try {
      this.database.updateDocument(state.id, state);
      return Promise.resolve();
    } catch (e) {
      console.log(e);
      return Promise.reject();
    }
  }

  async deleteState(sessionId: string) {
    try {
      const states: State[] = this.database.getDocuments([]);
      const stateId = states.find((s) => s.sessionId === sessionId).id;
      this.database.deleteDocument(stateId);
      return Promise.resolve();
    } catch (e) {
      console.log(e);
      return Promise.reject();
    }
  }

  async getStates(): Promise<State[]> {
    try {
      const states: State[] = this.database.query();
      return Promise.resolve(states ?? []);
    } catch (e) {
      console.log(e);
      return Promise.reject();
    }
  }
}
