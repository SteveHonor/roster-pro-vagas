import { defineStore } from 'pinia';

export const useEventDayStore = defineStore('eventDay', {
  state: () => ({
    eventDay: {},
    eventDays: []
  }),

  actions: {
    setEventDay(eventDay) {
      this.eventDay = eventDay;
    },

    setEventDays(eventDays) {
      this.eventDays = eventDays;
    },

    clearEventDay() {
      this.eventDay = {};
    },

    clearEventDays() {
      this.eventDays = [];
    },

    markReportFilled(eventDayId, rating) {
      const item = this.eventDays.find(e => e.id === eventDayId);
      if (item) item.myReportRating = rating;
    }
  },

  persist: true
});
