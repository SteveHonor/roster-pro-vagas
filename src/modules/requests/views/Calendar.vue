<template>
  <div>
    <div class="mb-3">
      <div class="flex items-center gap-4">
        <button
          class="flex w-24 flex-col items-center justify-center rounded bg-gray-50 py-3 text-sm font-medium text-gray-500 shadow"
          role="tab"
          @click="
            $router.replace({
              path: '/requests',
              query: { tab: 'absences' }
            })
          "
        >
          <div class="flex items-center">
            <BaseIcon name="chevron-left" class="mr-1 h-5 w-5" />
            <span class="font-bold">Voltar</span>
          </div>
        </button>

        <div class="flex w-full justify-between gap-4">
          <button
            class="flex w-52 justify-center rounded bg-gray-50 py-3 text-sm font-medium text-gray-500 shadow"
            @click="prevMonth"
          >
            {{ prevMonthLabel }}
          </button>
          <span
            class="w-full rounded border bg-white px-3 py-2 text-center font-bold text-gray-600"
            >{{ monthYearLabel }}</span
          >
          <button
            class="flex w-52 justify-center rounded bg-gray-50 py-3 text-sm font-medium text-gray-500 shadow"
            @click="nextMonth"
          >
            {{ nextMonthLabel }}
          </button>
        </div>
      </div>
    </div>

    <Card class="min-h-[auto]">
      <div class="mb-4 grid grid-cols-7 gap-2">
        <div
          v-for="(day, index) in weekDays"
          :key="index"
          class="flex h-8 items-center justify-center rounded bg-gray-600 text-sm font-bold text-white"
        >
          {{ day }}
        </div>
        <div
          v-for="day in calendarDays"
          :key="day.date.toISOString()"
          :class="calendarDayClass(day)"
          @click="selectDay(day)"
        >
          {{ day.date.date() }}
        </div>
      </div>

      <div v-if="blockStore.selectedDates?.length">
        <span class="text-sm text-gray-800">Dias de ausência:</span>
        <div class="rounded bg-gray-100 p-2">
          <div class="flex flex-wrap gap-2">
            <div
              v-for="day in blockStore.selectedDates"
              :key="day"
              class="flex items-center gap-2 rounded bg-white px-3 py-2"
            >
              <div class="text-sm font-bold">
                {{ formatDate(day) }}
              </div>
              <div
                class="cursor-pointer"
                @click="blockStore.toggleDate(day)"
              >
                <BaseIcon name="trash" class="w-[15px] text-red-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="my-5">
        {{ blockStore.onservation }}
        <label class="text-sm text-gray-800">Motivo: (obrigatório)</label>
        <textarea
          v-model="blockStore.observation"
          placeholder="Explique o motivo"
          class="focus:ring focus:ring-gray-500 w-full appearance-none rounded border border-gray-200 bg-gray-100 p-2 focus:outline-none"
          cols="30"
          rows="3"
        ></textarea>
      </div>

      <div class="mt-10 flex justify-end border-t pt-10">
        <button
          :class="submitClass"
          :disabled="!canSubmit"
          class="rounded px-4 py-2"
          @click="submitBlock"
        >
          Informar Ausências
        </button>
      </div>
    </Card>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import Card from '@/components/card/Card';
import moment from 'moment';

import { useAuthStore } from '@/modules/auth/store';
import { useBlockStore } from '@/modules/requests/block';

export default {
  name: 'BlockDates',
  components: {
    Card,
    BaseIcon
  },
  data() {
    return {
      currentMonth: moment().month(),
      currentYear: moment().year(),
      weekDays: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
    };
  },
  computed: {
    authStore: () => useAuthStore(),
    blockStore: () => useBlockStore(),
    calendarDays() {
      const startOfMonth = moment([
        this.currentYear,
        this.currentMonth
      ]).startOf('month');
      const endOfMonth = moment([this.currentYear, this.currentMonth]).endOf(
        'month'
      );

      const days = [];

      const startCalendar = startOfMonth.clone().startOf('week');
      const endCalendar = endOfMonth.clone().endOf('week');

      let day = startCalendar.clone();

      while (day.isBefore(endCalendar, 'day')) {
        days.push({
          date: day.clone(),
          isCurrentMonth: day.month() === this.currentMonth
        });
        day.add(1, 'day');
      }

      return days;
    },
    monthYearLabel() {
      return moment([this.currentYear, this.currentMonth]).format('MMMM YYYY');
    },
    prevMonthLabel() {
      return moment([this.currentYear, this.currentMonth])
        .subtract(1, 'month')
        .format('MMMM');
    },
    nextMonthLabel() {
      return moment([this.currentYear, this.currentMonth])
        .add(1, 'month')
        .format('MMMM');
    },
    canSubmit() {
      return (
        this.blockStore.selectedDates.length > 0 &&
        this.blockStore.observation !== ''
      );
    },
    submitClass() {
      return this.canSubmit
        ? 'bg-gray-700 text-white'
        : 'bg-gray-300 text-white';
    }
  },
  mounted() {
    this.blockStore.resetBlock();
  },
  methods: {
    formatDate(dateStr) {
      return moment(dateStr).format('DD/MM/YY');
    },
    prevMonth() {
      const date = moment([this.currentYear, this.currentMonth]).subtract(
        1,
        'month'
      );
      this.currentMonth = date.month();
      this.currentYear = date.year();
    },
    nextMonth() {
      const date = moment([this.currentYear, this.currentMonth]).add(
        1,
        'month'
      );
      this.currentMonth = date.month();
      this.currentYear = date.year();
    },
    selectDay(day) {
      if (day.date.isBefore(moment(), 'day')) return;

      const dateStr = day.date.format('YYYY-MM-DD');
      this.blockStore.toggleDate(dateStr);
    },
    calendarDayClass(day) {
      const dateStr = day.date.format('YYYY-MM-DD');
      const isSelected = this.blockStore.selectedDates.includes(dateStr);
      const isPast = day.date.isBefore(moment(), 'day');

      return [
        'flex items-center justify-center rounded py-4 text-center',
        day.isCurrentMonth ? 'bg-gray-100' : 'bg-gray-50 text-gray-400',
        isSelected && 'bg-gray-700 font-bold text-white',
        isPast && 'cursor-not-allowed opacity-50'
      ].join(' ');
    },
    goBack() {
      this.$router.replace({
        path: '/calendar',
        query: { tab: 'blocks' }
      });
    },
    submitBlock() {
      this.confirmationStore.setConfirmation({
        title: 'Aviso de Ausência',
        description: 'Confirma cadastro dessas ausências?',
        open: true,
        onConfirm: async () => {
          try {
            this.axios
              .post(`users/${this.authStore.user.id}/blocks`, {
                selectedDates: this.blockStore.selectedDates,
                observation: this.blockStore.observation
              })
              .then(() => {
                this.confirmationStore.close();

                this.blockStore.resetBlock();

                this.$router.replace({
                  path: '/requests',
                  query: { tab: 'absences' }
                });
              })
              .catch(err => {
                console.error(err);
                this.confirmationStore.close();
              });
          } catch (error) {
            console.error('Erro ao remover eventos:', error);
            this.confirmationStore.close();
          }
        }
      });
    }
  }
};
</script>
