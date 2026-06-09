<template>
  <section class="mb-8">
    <p class="mb-3 text-sm font-light text-gray-800">
      Defina os dias de {{ months[selectedMonth - 1] }} <span class="text-gray-400">(obrigatório)</span>
    </p>

    <div class="grid grid-cols-7 gap-2">
      <!-- Cabeçalho -->
      <div
        v-for="(day, index) in weekDays"
        :key="index"
        class="flex h-8 items-center justify-center rounded bg-gray-600 text-sm font-bold text-white"
      >
        {{ day }}
      </div>

      <!-- Dias -->
      <div
        v-for="(day, index) in daysInCalendar"
        :key="index"
        :class="dayClass(day)"
        @click="selectDay(day)"
      >
        {{ day.date.date() }}
      </div>
    </div>
  </section>
</template>

<script>
import { useEventStore } from '@/modules/calendar/store/event';
import moment from 'moment';

export default {
  props: {
    selectedMonth: {
      type: Number,
      default: () => moment().month()
    }
  },
  data() {
    return {
      months: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ],
      weekDays: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
      daysInCalendar: []
    };
  },
  computed: {
    eventStore: () => useEventStore()
  },
  watch: {
    selectedMonth: 'updateDays'
  },
  mounted() {
    this.updateDays();
  },
  methods: {
    updateDays() {
      const year = moment().year();
      const startOfMonth = moment([year, this.selectedMonth - 1]).startOf('month');
      const startCalendar = startOfMonth.clone().startOf('week');

      this.daysInCalendar = Array.from({ length: 42 }, (_, i) => {
        const date = startCalendar.clone().add(i, 'days');
        return {
          date,
          isCurrentMonth: date.month() === this.selectedMonth - 1
        };
      });
    },
    selectDay(day) {
      if (!day.isCurrentMonth) return;
      if (day.date.isBefore(moment(), 'day')) return;

      const dayNum = day.date.date();
      const isSelected = this.eventStore.getDaysChosen.map(c => c.day).includes(dayNum);

      if (isSelected) {
        this.eventStore.unsetDay(dayNum);
      } else {
        this.eventStore.setDay(dayNum);
      }
    },
    dayClass(day) {
      const dayNum = day.date.date();
      const isSelected = this.eventStore.getDaysChosen.map(c => c.day).includes(dayNum);
      const isPast = day.date.isBefore(moment(), 'day');

      return [
        'flex items-center justify-center rounded py-4 text-center text-sm transition',
        day.isCurrentMonth ? 'bg-gray-100' : 'bg-gray-50 text-gray-300',
        isSelected ? '!bg-gray-700 font-bold !text-white' : '',
        !day.isCurrentMonth || isPast
          ? 'cursor-default'
          : 'cursor-pointer hover:border hover:border-gray-400'
      ].join(' ');
    }
  }
};
</script>
