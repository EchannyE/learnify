import { openDB } from "idb";

const DB_NAME = "learnify-offline-db";
const DB_VERSION = 2;

export const getOfflineDB = () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (!db.objectStoreNames.contains("notes")) {
        db.createObjectStore("notes", {
          keyPath: "_id"
        });
      }

      if (!db.objectStoreNames.contains("quizzes")) {
        db.createObjectStore("quizzes", {
          keyPath: "_id"
        });
      }

      if (!db.objectStoreNames.contains("studyPlans")) {
        db.createObjectStore("studyPlans", {
          keyPath: "_id"
        });
      }

      if (!db.objectStoreNames.contains("analytics")) {
        db.createObjectStore("analytics", {
          keyPath: "id"
        });
      }

      if (!db.objectStoreNames.contains("tutorChats")) {
        db.createObjectStore("tutorChats", {
          keyPath: "_id"
        });
      }

      if (!db.objectStoreNames.contains("pendingSync")) {
        db.createObjectStore("pendingSync", {
          keyPath: "id",
          autoIncrement: true
        });
      }
    }
  });
};

export const saveOfflineItem = async (
  storeName,
  item
) => {
  const db = await getOfflineDB();
  return db.put(storeName, item);
};

export const saveOfflineItems = async (
  storeName,
  items
) => {
  const db = await getOfflineDB();

  const tx = db.transaction(
    storeName,
    "readwrite"
  );

  for (const item of items) {
    await tx.store.put(item);
  }

  await tx.done;
};

export const getOfflineItems = async (
  storeName
) => {
  const db = await getOfflineDB();
  return db.getAll(storeName);
};

export const getOfflineItem = async (
  storeName,
  id
) => {
  const db = await getOfflineDB();
  return db.get(storeName, id);
};

export const deleteOfflineItem = async (
  storeName,
  id
) => {
  const db = await getOfflineDB();
  return db.delete(storeName, id);
};

export const clearStore = async (
  storeName
) => {
  const db = await getOfflineDB();
  return db.clear(storeName);
};

export const addPendingSync = async ({
  type,
  endpoint,
  method,
  payload
}) => {
  const db = await getOfflineDB();

  return db.add("pendingSync", {
    type,
    endpoint,
    method,
    payload,
    status: "pending",
    retries: 0,
    createdAt: new Date().toISOString()
  });
};

export const getPendingSync = async () => {
  const db = await getOfflineDB();
  return db.getAll("pendingSync");
};

export const updatePendingSync = async (
  item
) => {
  const db = await getOfflineDB();

  return db.put(
    "pendingSync",
    item
  );
};

export const deletePendingSync = async (
  id
) => {
  const db = await getOfflineDB();

  return db.delete(
    "pendingSync",
    id
  );
};