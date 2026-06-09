import { defineStore } from 'pinia';

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    schedule: {},
    schedules: []
  }),

  getters: {
    getSchedule: state => state.schedule,
    getSchedules: state => state.schedules
  },

  actions: {
    setSchedule(schedule) {
      this.schedule = schedule;
    },
    setSchedules(schedules) {
      this.schedules = schedules;
    }
  },

  persist: true
});
