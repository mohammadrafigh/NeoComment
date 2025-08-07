import "@nativescript/core/globals";
import { CouchBase } from "@triniwiz/nativescript-couchbase";
import { StateCache } from "../models/state-cache.model";

self.onmessage = function (event: {
  data: { state: StateCache; dbName: string };
}) {
  const { state, dbName } = event.data;
  try {
    const database = new CouchBase(dbName);
    database.updateDocument(state.id, state);
    database.close();
    self.postMessage({ success: true });
  } catch (e) {
    self.postMessage({ success: false, error: e.message || e });
  }
};
