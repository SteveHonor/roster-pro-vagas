import { defineStore } from 'pinia';

export const useTabStore = defineStore('tab', {
  state: () => ({
    tab: {}
  }),

  getters: {
    getTab: state => {
      return state.tab;
    }
  },

  actions: {
    setTab(tab) {
      this.tab = tab;
    }
  }
});
