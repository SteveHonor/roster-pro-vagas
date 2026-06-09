import { defineStore } from 'pinia';

export const useConfirmationStore = defineStore('confirmation', {
  state: () => ({
    confirmation: {}
  }),

  getters: {
    title: state => {
      return state.confirmation?.title || '';
    },
    description: state => {
      return state.confirmation?.description || '';
    },
    color: state => {
      return state.confirmation?.color || 'red';
    },
    open: state => {
      return state.confirmation?.open || false;
    }
  },

  actions: {
    setConfirmation(confirmation) {
      this.confirmation = {
        ...this.confirmation,
        ...confirmation
      };
    },
    close() {
      this.confirmation.open = false;
      this.confirmation = {};
    },
    onConfirm() {
      return this.confirmation.onConfirm();
    },
    onCancel() {
      return this.confirmation.onCancel();
    }
  }
});
