import { defineStore } from 'pinia';

export const useFeedbackStore = defineStore('feedback', {
  state: () => ({
    rating: 0,
    comment: null,
    visibility: 'public',
    userId: null,
    scheduleItemId: null
  }),

  actions: {
    setUserId(userId) {
      this.userId = userId;
    },
    setScheduleItemId(scheduleItemId) {
      this.scheduleItemId = scheduleItemId;
    },
    reset() {
      this.rating = 0;
      this.comment = '';
      this.visibility = 'public';
      this.reviewedUserId = null;
      this.scheduleItemId = null;
    }
  }
});
