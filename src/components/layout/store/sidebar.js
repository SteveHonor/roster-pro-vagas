import { defineStore } from 'pinia';

export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    collapsed: false,
    mobileOpen: false
  }),

  actions: {
    toggle() {
      this.collapsed = !this.collapsed;
    },
    open() {
      this.collapsed = false;
    },
    close() {
      this.collapsed = true;
    },
    openMobile() {
      this.mobileOpen = true;
    },
    closeMobile() {
      this.mobileOpen = false;
    }
  },

  persist: true
});
