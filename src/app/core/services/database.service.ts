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
    } catch {
      console.log("Couldn't close database connection");
    }
  }

  async createState(state: State): Promise<string> {
    try {
      const id = this.database.createDocument(state);
      return Promise.resolve(id);
    } catch (e) {
      console.log(e);
      return Promise.reject();
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

  async getStates(): Promise<State[]> {
    try {
      const states: State[] = this.database.getDocuments([]);
      return Promise.resolve(states);
    } catch (e) {
      console.log(e);
      return Promise.reject();
    }
  }

  async deleteState(sessionId: string) {
    try {
      const states: State[] = this.database.getDocuments([]);
      const stateId = states.find(s => s.sessionId === sessionId).id;
      this.database.deleteDocument(stateId);
      return Promise.resolve();
    } catch (e) {
      console.log(e);
      return Promise.reject();
    }
  }
}
