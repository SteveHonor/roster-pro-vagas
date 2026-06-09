<template>
  <div class="pb-6">
    <div class="space-y-3 px-4 pt-3">

      <!-- Header inline -->
      <div class="pb-1">
        <button
          class="mb-1 flex items-center gap-1 text-xs font-medium text-slate-400 active:text-slate-600"
          @click="$router.replace({ path: '/member/requests', query: { tab: 'absences' } })"
        >
          <BaseIcon name="chevron-left" class="!size-3.5" />
          Voltar
        </button>
        <span class="text-lg font-bold text-slate-800">Informar Ausência</span>
      </div>

      <!-- Card: calendário -->
      <div class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">

        <!-- Navegação do mês -->
        <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <button
            class="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition active:bg-slate-100"
            @click="prevMonth"
          >
            <BaseIcon name="chevron-left" class="!size-4" />
          </button>
          <span class="text-sm font-bold text-slate-800">{{ monthYearLabel }}</span>
          <button
            class="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition active:bg-slate-100"
            @click="nextMonth"
          >
            <BaseIcon name="ChevronRight" class="!size-4" />
          </button>
        </div>

        <!-- Cabeçalho dias da semana -->
        <div class="grid grid-cols-7 px-2 pt-2">
          <div
            v-for="(day, i) in weekDays"
            :key="i"
            class="py-1 text-center text-[11px] font-semibold text-slate-400"
          >
            {{ day }}
          </div>
        </div>

        <!-- Dias -->
        <div class="grid grid-cols-7 px-2 pb-3">
          <button
            v-for="day in calendarDays"
            :key="day.date.toISOString()"
            :disabled="isPast(day)"
            class="relative flex h-10 items-center justify-center text-sm transition"
            :class="dayClass(day)"
            @click="selectDay(day)"
          >
            <span
              class="flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all"
              :class="dayInnerClass(day)"
              :style="isSelected(day) ? 'background: var(--brand-primary, #6366f1)' : ''"
            >
              {{ day.date.date() }}
            </span>
            <span
              v-if="isToday(day) && !isSelected(day)"
              class="absolute bottom-0.5 h-1 w-1 rounded-full"
              :style="'background: var(--brand-primary, #6366f1)'"
            />
          </button>
        </div>
      </div>

      <!-- Card: dias selecionados + motivo -->
      <div class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">

        <!-- Dias selecionados -->
        <div class="border-b border-slate-100 px-4 pb-3 pt-4">
          <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Dias selecionados</p>
          <div v-if="blockStore.selectedDates?.length" class="flex flex-wrap gap-2">
            <div
              v-for="day in blockStore.selectedDates"
              :key="day"
              class="flex items-center gap-1.5 rounded-2xl bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
            >
              {{ formatDate(day) }}
              <button class="text-slate-400 active:text-red-500" @click="blockStore.toggleDate(day)">
                <BaseIcon name="XMark" class="!size-3" />
              </button>
            </div>
          </div>
          <p v-else class="text-sm text-slate-400">Toque nos dias para selecionar</p>
        </div>

        <!-- Motivo -->
        <div class="px-4 pb-4 pt-3">
          <label class="mb-1.5 block text-sm font-medium text-slate-700">
            Motivo <span class="font-normal text-slate-400">(obrigatório)</span>
          </label>
          <textarea
            v-model="blockStore.observation"
            placeholder="Explique o motivo da ausência"
            rows="3"
            class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-slate-300 focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      <!-- Botão fora do card -->
      <button
        :disabled="!canSubmit"
        class="w-full rounded-2xl py-3.5 text-sm font-bold transition"
        :style="'background: var(--brand-primary, #6366f1); color: #fff;'"
        :class="!canSubmit ? 'opacity-40 cursor-not-allowed' : ''"
        @click="submitBlock"
      >
        Informar Ausências
      </button>

    </div>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import moment from 'moment';
import { useAuthStore } from '@/modules/auth/store';
import { useBlockStore } from '@/modules/requests/block';

export default {
  name: 'CalendarMobile',
  components: { BaseIcon },
  data() {
    return {
      currentMonth: moment().month(),
      currentYear:  moment().year(),
      weekDays:     ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']
    };
  },
  computed: {
    authStore: () => useAuthStore(),
    blockStore: () => useBlockStore(),
    calendarDays() {
      const start = moment([this.currentYear, this.currentMonth]).startOf('month').startOf('week');
      const end   = moment([this.currentYear, this.currentMonth]).endOf('month').endOf('week');
      const days  = [];
      let day = start.clone();
      while (day.isBefore(end, 'day')) {
        days.push({ date: day.clone(), isCurrentMonth: day.month() === this.currentMonth });
        day.add(1, 'day');
      }
      return days;
    },
    monthYearLabel() {
      return moment([this.currentYear, this.currentMonth]).format('MMMM YYYY');
    },
    canSubmit() {
      return this.blockStore.selectedDates.length > 0 && this.blockStore.observation !== '';
    }
  },
  mounted() {
    this.blockStore.resetBlock();
  },
  methods: {
    isPast(day)     { return day.date.isBefore(moment(), 'day'); },
    isToday(day)    { return day.date.isSame(moment(), 'day'); },
    isSelected(day) { return this.blockStore.selectedDates.includes(day.date.format('YYYY-MM-DD')); },
    dayClass(day) {
      return [
        !day.isCurrentMonth && 'opacity-30',
        this.isPast(day) && 'cursor-not-allowed'
      ].filter(Boolean).join(' ');
    },
    dayInnerClass(day) {
      if (this.isSelected(day)) return 'text-white font-bold';
      if (this.isToday(day))    return 'font-bold';
      return 'text-slate-700';
    },
    prevMonth() {
      const d = moment([this.currentYear, this.currentMonth]).subtract(1, 'month');
      this.currentMonth = d.month();
      this.currentYear  = d.year();
    },
    nextMonth() {
      const d = moment([this.currentYear, this.currentMonth]).add(1, 'month');
      this.currentMonth = d.month();
      this.currentYear  = d.year();
    },
    selectDay(day) {
      if (this.isPast(day) || !day.isCurrentMonth) return;
      this.blockStore.toggleDate(day.date.format('YYYY-MM-DD'));
    },
    formatDate(dateStr) {
      return moment(dateStr).format('DD/MM/YY');
    },
    submitBlock() {
      this.confirmationStore.setConfirmation({
        title:       'Aviso de Ausência',
        description: 'Confirma cadastro dessas ausências?',
        open:        true,
        onConfirm:   async () => {
          try {
            await this.axios.post(`users/${this.authStore.user.id}/blocks`, {
              selectedDates: this.blockStore.selectedDates,
              observation:   this.blockStore.observation
            });
            this.confirmationStore.close();
            this.blockStore.resetBlock();
            this.$router.replace({ path: '/member/requests', query: { tab: 'absences' } });
          } catch (err) {
            console.error(err);
            this.confirmationStore.close();
          }
        }
      });
    }
  }
};
</script>
