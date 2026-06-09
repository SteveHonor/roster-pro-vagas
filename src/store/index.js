import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

export function resetAllStores() {
  pinia?._s?.forEach(store => {
    try {
      if (typeof store.$reset === 'function') {
        store.$reset();
      }
    } catch {
      // store reset failed silently — state will be cleared from storage below
    }

    if (store.$id) {
      localStorage.removeItem(store.$id);
      sessionStorage.removeItem(store.$id);
    }
  });
}

export default pinia;
