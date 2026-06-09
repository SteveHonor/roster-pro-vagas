import { defineStore } from 'pinia';

export const useBreadcrumbStore = defineStore('breadcrumb', {
  state: () => ({
    breadcrumb: []
  }),

  getters: {
    getBreadcrumbs(state) {
      return state.breadcrumb;
    }
  },

  actions: {
    setBreadcrumb(breadcrumb) {
      this.breadcrumb = [];

      this.breadcrumb = breadcrumb;
    }
  }
});
