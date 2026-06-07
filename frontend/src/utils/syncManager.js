import api from "../api/axios";

import {
  getPendingSync,
  deletePendingSync
} from "./offlineDb";

export const syncOfflineData =
  async () => {
    const queue =
      await getPendingSync();

    for (const item of queue) {
      try {
        await api({
          method: item.method,
          url: item.endpoint,
          data: item.payload
        });

        await deletePendingSync(
          item.id
        );
      } catch (error) {
        console.error(error);
      }
    }
  };