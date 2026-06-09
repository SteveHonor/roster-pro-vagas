import { defineStore } from 'pinia';

function initialEvent() {
  return {
    name: '',
    eventType: 'place',
    format: 'daily',
    place: '',
    placeName: '',
    observation: '',
    attachmentsUrls: [],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    configuration: {
      type: 'voluntary',
      reminder: 1,
      feedback: true,
      observation: 'all',
      attachment: 'all',
      chat: true,
      refuse: false,
      repeat: false,
      payment_rate_cents: null
    },
    schedule: [],
    eventDay: {},
    errors: {}
  };
}

export const useEventStore = defineStore('event', {
  state: () => ({
    event: initialEvent(),
    weekChosen: [],
    monthsChosen: []
  }),

  actions: {
    setError({ day, indexHour, input, error }) {
      // garante root
      if (!this.event.errors) {
        this.event.errors = {};
      }

      // garante dia
      if (!this.event.errors[day]) {
        this.event.errors[day] = {};
      }

      // garante período
      if (!this.event.errors[day][indexHour]) {
        this.event.errors[day][indexHour] = {};
      }

      // remover erro
      if (!error) {
        delete this.event.errors[day][indexHour][input];

        // limpa período
        if (Object.keys(this.event.errors[day][indexHour]).length === 0) {
          delete this.event.errors[day][indexHour];
        }

        // limpa dia
        if (Object.keys(this.event.errors[day]).length === 0) {
          delete this.event.errors[day];
        }

        return;
      }

      // set / update
      this.event.errors[day][indexHour][input] = error;
    },
    setDay(day, weekDays = []) {
      const alreadyExists = this.event.schedule.some(
        entry => entry.day === day
      );

      if (!alreadyExists) {
        this.event.schedule.push({
          day,
          periods: [{ start: '08:00', end: '10:00' }],
          weekDays: weekDays
        });
      }
    },

    unsetDay(day) {
      this.event.schedule = this.event.schedule.filter(
        entry => entry.day !== day
      );
    },

    setHour(day) {
      const entry = this.event.schedule.find(e => e.day === day);
      if (entry) {
        entry.periods.push({ start: '08:00', end: '10:00' });
      }
    },

    setMonth(month) {
      this.monthsChosen.push(month);
    },

    unsetMonth(month) {
      this.monthsChosen = this.monthsChosen.filter(m => m !== month);
    },

    setPlace(place) {
      this.event.place = place;
    },

    changeHour({ day, type, hour, index = 0 }) {
      const entry = this.event.schedule.find(e => e.day === day);
      if (!entry || !entry.periods || !entry.periods[index]) return;

      if (type === 'start') {
        entry.periods[index].start = hour;
      } else if (type === 'end') {
        entry.periods[index].end = hour;
      }
    },

    removeHourPeriod(day, index) {
      const entry = this.event.schedule.find(e => e.day === day);
      if (entry && entry.periods?.length > index) {
        entry.periods.splice(index, 1);
      }
    },

    removeDay(day) {
      this.event.schedule = this.event.schedule.filter(d => d.day !== day);
    },

    setWeek(week) {
      this.weekChosen = week;
    },

    setEvent(event) {
      this.event = {
        ...event
      };
    },

    unsetDays() {
      this.event.schedule = [];
      this.weekChosen = [];
    },

    resetEvent() {
      this.event = initialEvent();
      this.weekChosen = [];
      this.monthsChosen = [];
    },

    resetEventSchedule() {
      this.event.schedule = [];
      this.weekChosen = [];
    },

    resetEventConfiguration() {
      this.event.month = new Date().getMonth() + 1;
      this.event.configuration.repeat = false;
    }
  },

  getters: {
    getEvent: state => state.event,
    getEvents: state => state.events,
    getDaysChosen: state =>
      [...state.event.schedule].sort((a, b) => a.day - b.day),
    getWeekChosen: state => state.weekChosen,
    getMonthsChosen: state => state.monthsChosen,
    getErrors: state => state.event.errors,
    hasError: state => Object.keys(state.event.errors || {}).length > 0
  },

  persist: true
});
