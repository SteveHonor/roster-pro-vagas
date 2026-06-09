<template>
  <section class="mb-8">
    <span class="text-sm font-light text-gray-800">
      Defina os dias da semana (obrigatório)
    </span>
    <div class="mt-1 grid grid-cols-7 gap-2">
      <div
        v-for="(week, index) in weekDays"
        :key="index"
        class="flex h-12 cursor-pointer items-center justify-center rounded border py-4 text-sm font-bold shadow-lg"
        :class="
          eventStore.getDaysChosen.map(chose => chose['day']).includes(week.day)
            ? 'bg-gray-700 text-white'
            : 'bg-gray-100 hover:text-gray-600'
        "
        @click="
          eventStore.getDaysChosen.map(chose => chose['day']).includes(week.day)
            ? unsetDay(week.day)
            : setDay(week.day)
        "
      >
        {{ week.name }}
      </div>
    </div>
  </section>
</template>

<script>
import { useEventStore } from '@/modules/calendar/store/event/';
import moment from 'moment';
import DateHelper from '@/helper/Date';

export default {
  props: {
    selectedMonth: {
      type: Number,
      default: () => moment().month()
    }
  },
  data() {
    return {
      weekDays: [
        { day: 1, name: 'Segunda' },
        { day: 2, name: 'Terça' },
        { day: 3, name: 'Quarta' },
        { day: 4, name: 'Quinta' },
        { day: 5, name: 'Sexta' },
        { day: 6, name: 'Sábado' },
        { day: 7, name: 'Domingo' }
      ]
    };
  },
  computed: {
    eventStore: () => useEventStore()
  },

  methods: {
    setDay(weekday) {
      this.eventStore.setDay(
        weekday,
        DateHelper.getAllDaysOfWeekInMonth(
          this.moment().year(),
          this.selectedMonth,
          weekday
        )
      );
    },
    unsetDay(day) {
      this.eventStore.unsetDay(day);
    },
  }
};
</script>
