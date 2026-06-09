import { defineStore } from 'pinia';

export const useMessageStore = defineStore('message', {
  state: () => ({
    message: {},
    messages: []
  }),

  actions: {
    setMessage(message) {
      this.message = message;
    },
    setMessages(messages) {
      this.messages = messages;
    }
  },

  persist: true
});
