import { defineStore } from 'pinia';

export const useLoadingStore = defineStore('loading', {
  state: () => ({
    loading: false,
    blocked: false
  }),
  getters: {
    isLoading: state => {
      return state.loading && !state.blocked;
    }
  },
  actions: {
    show() {
      this.loading = true;
    },
    hide() {
      this.loading = false;
    },
    block() {
      this.blocked = true;
    },
    unblock() {
      this.blocked = false;
    }
  }
});
