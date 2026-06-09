import { openDB } from "idb";

const DB_NAME = "learnify-offline-db";
const DB_VERSION = 3;

/**

* DATABASE
  */
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
  
  if (!db.objectStoreNames.contains("curriculums")) {
  db.createObjectStore("curriculums", {
  keyPath: "_id"
  });
  }
  
  if (!db.objectStoreNames.contains("downloads")) {
  db.createObjectStore("downloads", {
  keyPath: "_id"
  });
  }
  
  if (!db.objectStoreNames.contains("settings")) {
  db.createObjectStore("settings", {
  keyPath: "key"
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

/**

* SAVE SINGLE ITEM
  */
  export const saveOfflineItem = async (
  storeName,
  item
  ) => {
  const db = await getOfflineDB();
  return db.put(storeName, item);
  };

/**

* SAVE MULTIPLE ITEMS
  */
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

/**

* GET ALL ITEMS
  */
  export const getOfflineItems = async (
  storeName
  ) => {
  const db = await getOfflineDB();
  return db.getAll(storeName);
  };

/**

* GET SINGLE ITEM
  */
  export const getOfflineItem = async (
  storeName,
  id
  ) => {
  const db = await getOfflineDB();
  return db.get(storeName, id);
  };

/**

* DELETE SINGLE ITEM
  */
  export const deleteOfflineItem = async (
  storeName,
  id
  ) => {
  const db = await getOfflineDB();
  return db.delete(storeName, id);
  };

/**

* DELETE MANY ITEMS
  */
  export const deleteMany = async (
  storeName,
  ids = []
  ) => {
  const db = await getOfflineDB();

const tx = db.transaction(
storeName,
"readwrite"
);

for (const id of ids) {
await tx.store.delete(id);
}

await tx.done;
};

/**

* CLEAR STORE
  */
  export const clearStore = async (
  storeName
  ) => {
  const db = await getOfflineDB();
  return db.clear(storeName);
  };

/**

* COUNT ITEMS
  */
  export const countItems = async (
  storeName
  ) => {
  const db = await getOfflineDB();
  return db.count(storeName);
  };

/**

* SEARCH ITEMS
  */
  export const findOfflineItems = async (
  storeName,
  predicate
  ) => {
  const db = await getOfflineDB();

const items = await db.getAll(storeName);

return items.filter(predicate);
};

/**

* SETTINGS
  */
  export const saveSetting = async (
  key,
  value
  ) => {
  const db = await getOfflineDB();

return db.put("settings", {
key,
value
});
};

export const getSetting = async (
key
) => {
const db = await getOfflineDB();

return db.get("settings", key);
};

/**

* DOWNLOADS
  */
  export const saveDownload = async (
  file
  ) => {
  const db = await getOfflineDB();

return db.put("downloads", {
...file,
downloadedAt:
new Date().toISOString()
});
};

export const getDownloads =
async () => {
const db = await getOfflineDB();

return db.getAll("downloads");

};

/**

* CURRICULUMS
  */
  export const saveCurriculum =
  async (curriculum) => {
  const db =
  await getOfflineDB();
  
  return db.put(
  "curriculums",
  curriculum
  );
  };

export const getCurriculums =
async () => {
const db =
await getOfflineDB();

return db.getAll(
  "curriculums"
);

};

/**

* TUTOR CHATS
  */
  export const saveTutorChat =
  async ({
  question,
  answer
  }) => {
  const db =
  await getOfflineDB();
  
  return db.put(
  "tutorChats",
  {
  _id:
  crypto.randomUUID(),
  question,
  answer,
  createdAt:
  new Date().toISOString()
  }
  );
  };

export const getTutorChats =
async () => {
const db =
await getOfflineDB();

return db.getAll(
  "tutorChats"
);

};

/**

* OFFLINE SYNC QUEUE
  */
  export const addPendingSync =
  async ({
  type,
  endpoint,
  method,
  payload
  }) => {
  const db =
  await getOfflineDB();
  
  return db.add(
  "pendingSync",
  {
  type,
  endpoint,
  method,
  payload,
  status:
  "pending",
  retries: 0,
  createdAt:
  new Date().toISOString()
  }
  );
  };

export const getPendingSync =
async () => {
const db =
await getOfflineDB();

return db.getAll(
  "pendingSync"
);

};

export const updatePendingSync =
async (item) => {
const db =
await getOfflineDB();

return db.put(
  "pendingSync",
  item
);

};

export const deletePendingSync =
async (id) => {
const db =
await getOfflineDB();

return db.delete(
  "pendingSync",
  id
);

};

/**

* DASHBOARD STATS
  */
  export const getOfflineStats =
  async () => {
  const [
  notes,
  quizzes,
  studyPlans,
  chats
  ] = await Promise.all([
  countItems("notes"),
  countItems("quizzes"),
  countItems("studyPlans"),
  countItems("tutorChats")
  ]);
  
  return {
  totalNotes: notes,
  totalQuizzes: quizzes,
  totalStudyPlans:
  studyPlans,
  totalTutorChats:
  chats
  };
  };
