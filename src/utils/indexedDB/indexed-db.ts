import {Message, StorableMessage} from "../types/types";
import {toSessionState} from "../../mappers/session-state-mapper";

let db: IDBDatabase;

export interface SessionState {
  receiversName: string;
  profilePicture: string;
  showHeader: boolean;
  showBatteryPercentage: boolean;
  network: string;
  phoneTime: string;
  messages: Message[]
}

export interface StorableSessionState {
  id: string
  receiversName: string;
  profilePicture: Blob | null;
  showHeader: boolean;
  showBatteryPercentage: boolean;
  network: string;
  phoneTime: string;
  messages: StorableMessage[]
}

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db)
      return;
    }
    const request = indexedDB.open("currentSessionDB", 1);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("sessions")) {
        const objectStore = db.createObjectStore("sessions", {keyPath: "id", autoIncrement: true});
        // Create indexes for searching by various attributes if needed

        objectStore.createIndex("receiversName", "receiversName", {unique: false});
        // Add more indexes as needed
      }
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error?.message);
      reject((event.target as IDBOpenDBRequest).error?.message);
    };
  });
}

export const storeSessionState = (sessionState: StorableSessionState): void => {
  initDB().then(db => {
    const transaction = db.transaction("sessions", "readwrite");
    const objectStore = transaction.objectStore("sessions");

    const request = objectStore.put(sessionState);

    request.onsuccess = () => {
      console.log("SessionState stored successfully");
    };

    request.onerror = (event: Event) => {
      console.error("Error storing SessionState: ", (event.target as IDBRequest).error?.message, sessionState);
    };
  })

}

export const retrieveSessionState = (): Promise<SessionState | null> => {
  return new Promise((resolve, reject) => {
    initDB().then(db => {
      const transaction = db.transaction("sessions");
      const objectStore = transaction.objectStore("sessions");
      const request = objectStore.get("session-id");

      request.onsuccess = (event: Event) => {
        const sessionState: StorableSessionState | undefined = (event.target as IDBRequest).result;
        if (sessionState) {
          console.log("SessionState retrieved successfully:", sessionState);
          // Here, you resolve the promise with the sessionState object
          console.log(toSessionState(sessionState))
          resolve(toSessionState(sessionState));
        } else {
          console.log("No SessionState found with the '1'",);
          // Resolve with undefined if no sessionState is found
          resolve(null);
        }
      };
    })
  });
};

