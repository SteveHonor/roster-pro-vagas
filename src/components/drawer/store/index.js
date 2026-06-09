import { defineStore } from 'pinia';

export const useDrawerStore = defineStore('drawer', {
  state: () => ({
    drawer: {},
    context: ''
  }),

  getters: {
    title: state => {
      return state.drawer[state.context]?.title || '';
    },
    size: state => {
      return state.drawer[state.context]?.size || 'medium';
    },
    open: state => context => {
      return state.drawer[context]?.open || false;
    }
  },

  actions: {
    setDrawer(drawer) {
      this.context = drawer.context;

      this.drawer[this.context] = {
        ...this.drawer[this.context],
        ...drawer,
        size: drawer.size || 'medium'
      };
    },
    close() {
      Object.keys(this.drawer).forEach(context => {
        if (this.drawer[context]) {
          this.drawer[context].open = false;
        }
      });
    },
    onSave(context) {
      if (this.drawer[context].onSave) {
        return this.drawer[context].onSave();
      }
    }
  }
});
