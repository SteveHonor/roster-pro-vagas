import { defineStore } from 'pinia';

export const useWorkerEventFeedbackStore = defineStore('workerEventFeedback', {
  state: () => ({
    eventDayId: null,
    rating: 0,
    comment: ''
  }),

  actions: {
    open(eventDayId) {
      this.eventDayId = eventDayId;
      this.rating = 0;
      this.comment = '';
    },
    reset() {
      this.eventDayId = null;
      this.rating = 0;
      this.comment = '';
    }
  }
});
