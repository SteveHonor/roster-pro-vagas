<template>
  <div class="flex flex-col min-h-full">

    <SkeletonRows v-if="loading" :rows="4" class="px-4 py-4" />

    <template v-else>

      <!-- ═══ MODO WIZARD ═══ -->
      <div v-if="mode === 'wizard'" class="flex flex-col px-4 pt-5 pb-4" style="min-height: calc(100vh - 112px)">

        <!-- Header contextual -->
        <div class="mb-1 flex items-start justify-between">
          <div>
            <h1 class="text-base font-bold text-slate-900">Confirmar participação</h1>
            <p class="mt-0.5 text-xs text-slate-400">Aceite ou recuse cada escala abaixo</p>
          </div>
          <button class="mt-0.5 text-xs font-medium text-indigo-600" @click="mode = 'list'">
            Ver lista
          </button>
        </div>

        <!-- Progresso -->
        <div class="mb-4 flex items-center gap-2">
          <div class="h-1.5 flex-1 rounded-full bg-slate-100">
            <div
              class="h-1.5 rounded-full bg-indigo-500 transition-all duration-500"
              :style="{ width: progressWidth }"
            />
          </div>
          <span class="text-[11px] font-semibold text-slate-400 whitespace-nowrap">
            {{ completedCount }}/{{ totalPending }}
          </span>
        </div>

        <!-- Tudo em dia -->
        <div
          v-if="allDone"
          class="flex flex-1 flex-col items-center justify-center gap-4 text-center"
        >
          <div class="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <BaseIcon name="Check" class="!size-10 text-green-600" />
          </div>
          <h2 class="text-xl font-bold text-slate-800">Tudo em dia!</h2>
          <p class="text-sm text-slate-500 leading-relaxed">
            Você respondeu todas as suas escalas pendentes.
          </p>
          <button
            class="mt-2 rounded-2xl bg-slate-900 px-8 py-3.5 text-sm font-bold text-white"
            @click="mode = 'list'"
          >
            Ver minhas escalas
          </button>
        </div>

        <!-- Stack de cards -->
        <Transition name="card-slide" mode="out-in">
          <div v-if="!allDone && currentItem" :key="currentItem.id" class="flex flex-1 flex-col">

            <!-- Stack — flex-1 empurra botões pro fundo, stack centralizado verticalmente -->
            <div class="relative flex-1 mb-4 flex items-center">
              <div class="relative w-full px-4">

                <!-- Card 3 (mais atrás) -->
                <div
                  v-if="pendingQueue.length > 2"
                  class="absolute inset-0 z-10 rounded-2xl border border-amber-200 bg-amber-100 shadow-sm"
                  style="transform: rotate(6deg); transform-origin: bottom center;"
                />

                <!-- Card 2 (meio) -->
                <div
                  v-if="pendingQueue.length > 1"
                  class="absolute inset-0 z-20 rounded-2xl border border-indigo-200 bg-indigo-100 shadow-sm"
                  style="transform: rotate(3deg); transform-origin: bottom center;"
                />

                <!-- Card principal — altura pelo conteúdo -->
                <div class="relative z-30 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">

                <!-- Faixa de data compacta -->
                <div class="flex items-center gap-3 bg-slate-900 px-5 py-4">
                  <div class="flex flex-col items-center justify-center rounded-xl bg-white/10 px-3 py-2 text-center min-w-[48px]">
                    <span class="text-2xl font-black text-white leading-none">{{ moment(currentItem.eventDay.date).format('DD') }}</span>
                    <span class="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{{ MONTH_SHORT[moment(currentItem.eventDay.date).month()] }}</span>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-white capitalize leading-snug">{{ currentItem.event?.name }}</p>
                    <p class="mt-0.5 text-xs text-slate-400">{{ formatDatePt(currentItem.eventDay.date) }}</p>
                  </div>
                </div>

                <!-- Corpo compacto -->
                <div class="px-5 py-4 space-y-3">
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-if="currentItem.eventHour"
                      class="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700"
                    >
                      <BaseIcon name="Clock" class="!size-3.5" />
                      {{ currentItem.eventHour.startTime }} – {{ currentItem.eventHour.endTime }}
                    </span>
                    <span
                      v-if="currentItem.mySchedule?.position"
                      class="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700"
                    >
                      {{ currentItem.mySchedule.position.name }}
                    </span>
                  </div>

                  <!-- Pagamento -->
                  <div
                    v-if="currentItem.event?.configuration?.type === 'paid' && currentItem.mySchedule?.effective_rate_cents"
                    class="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2.5"
                  >
                    <BaseIcon name="BankNotes" class="!size-4 text-amber-600" />
                    <span class="text-sm font-semibold text-amber-800">
                      Valor: {{ formatCents(currentItem.mySchedule.effective_rate_cents) }}
                    </span>
                  </div>

                  <!-- Observação -->
                  <button
                    v-if="currentItem.event.observation"
                    class="flex w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-left text-sm text-slate-600 active:bg-slate-50"
                    @click="openObservation(currentItem)"
                  >
                    <BaseIcon name="Chat" class="!size-4 text-slate-400" />
                    Ver observações
                  </button>
                </div>
              </div>
            </div>
            </div>

            <!-- Botões de ação -->
            <div class="mt-4 flex flex-col gap-2.5">
              <div class="grid grid-cols-2 gap-3">
                <button
                  class="flex items-center justify-center gap-2 rounded-2xl bg-red-500 py-4 text-base font-bold text-white active:bg-red-600"
                  @click="declined(currentItem)"
                >
                  <BaseIcon name="XMark" class="!size-5" />
                  Recusar
                </button>
                <button
                  class="flex items-center justify-center gap-2 rounded-2xl bg-green-600 py-4 text-base font-bold text-white active:bg-green-700"
                  @click="accepted(currentItem)"
                >
                  <BaseIcon name="Check" class="!size-5" />
                  Aceitar
                </button>
              </div>
              <button
                class="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-500 active:bg-slate-50"
                @click="changeSchedule(currentItem)"
              >
                <BaseIcon name="ArrowPath" class="!size-4" />
                Solicitar Troca
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- ═══ MODO LISTA ═══ -->
      <div v-else class="flex flex-col">

        <!-- Título da página -->
        <div class="px-4 pt-4 pb-2">
          <h1 class="text-base font-bold text-slate-800">Minhas escalas</h1>
        </div>

        <!-- Banner pendentes (se houver) -->
        <div
          v-if="pendingQueue.length"
          class="flex items-center justify-between border-b border-amber-100 bg-amber-50 px-4 py-3"
        >
          <div class="flex items-center gap-1.5">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span class="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            <span class="text-xs font-semibold text-amber-700">
              {{ pendingQueue.length }} escala{{ pendingQueue.length > 1 ? 's' : '' }} aguardando resposta
            </span>
          </div>
          <button class="text-xs font-bold text-indigo-600" @click="mode = 'wizard'">
            Responder →
          </button>
        </div>

        <!-- Filtro -->
        <div class="sticky top-12 z-10 bg-white px-4 pt-3 pb-2.5 border-b border-slate-100">
          <FormSelect
            v-model="selectedMonth"
            :options="monthOptions"
            placeholder="Todos os meses"
            class="w-full"
          />
        </div>

        <div class="px-4 py-4">
          <template v-if="groupedEvents.length">
            <div v-for="group in groupedEvents" :key="group.month" class="mb-6">

              <!-- Cabeçalho do mês -->
              <div class="mb-3 flex items-center gap-2">
                <span class="text-[11px] font-bold uppercase tracking-widest text-slate-400">{{ group.label }}</span>
                <div class="h-px flex-1 bg-slate-100" />
                <span class="text-[11px] text-slate-400">{{ group.items.length }}</span>
              </div>

              <div class="flex flex-col gap-3">
                <!-- ── Card PENDENTE (expandido) ── -->
                <div
                  v-for="item in group.items"
                  :key="item.id"
                >
                  <template v-if="isRefusable(item) && item.mySchedule?.status === 'pending'">
                    <div class="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
                      <div class="flex items-start gap-3 px-4 pt-4 pb-3">
                        <div class="flex w-10 flex-shrink-0 flex-col items-center justify-center rounded-lg border border-slate-100 bg-slate-50 py-2 text-center">
                          <span class="text-base font-black leading-none text-slate-900">{{ moment(item.eventDay.date).format('DD') }}</span>
                          <span class="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400">{{ MONTH_SHORT[moment(item.eventDay.date).month()] }}</span>
                        </div>
                        <div class="flex min-w-0 flex-1 flex-col gap-1.5">
                          <span class="truncate text-sm font-bold capitalize text-slate-900 leading-snug">{{ item.event?.name }}</span>
                          <div class="flex flex-wrap items-center gap-1.5">
                            <span v-if="item.eventHour" class="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                              <BaseIcon name="Clock" class="!size-3" />{{ item.eventHour.startTime }}–{{ item.eventHour.endTime }}
                            </span>
                            <span v-if="item.mySchedule?.position" class="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{{ item.mySchedule.position.name }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="border-t border-amber-100 px-4 py-3">
                        <div class="mb-3 flex items-center gap-1.5">
                          <span class="relative flex h-2 w-2">
                            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                            <span class="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                          </span>
                          <span class="text-xs font-semibold text-amber-700">Aguardando sua resposta</span>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                          <button class="flex items-center justify-center gap-1.5 rounded-xl bg-red-500 py-3 text-sm font-bold text-white active:bg-red-600" @click="declinedFromList(item)">
                            <BaseIcon name="XMark" class="!size-4" /> Recusar
                          </button>
                          <button class="flex items-center justify-center gap-1.5 rounded-xl bg-green-600 py-3 text-sm font-bold text-white active:bg-green-700" @click="acceptedFromList(item)">
                            <BaseIcon name="Check" class="!size-4" /> Aceitar
                          </button>
                        </div>
                        <button class="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-500 active:bg-slate-50" @click="changeScheduleFromList(item)">
                          <BaseIcon name="ArrowPath" class="!size-4" /> Solicitar Troca
                        </button>
                      </div>
                    </div>
                  </template>

                  <!-- ── Card RESPONDIDO (compacto) ── -->
                  <template v-else>
                    <div class="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3 py-2.5">
                      <!-- Data compacta -->
                      <div class="flex w-9 flex-shrink-0 flex-col items-center">
                        <span class="text-sm font-black leading-none text-slate-700">{{ moment(item.eventDay.date).format('DD') }}</span>
                        <span class="text-[9px] font-semibold uppercase tracking-wide text-slate-400">{{ MONTH_SHORT[moment(item.eventDay.date).month()] }}</span>
                      </div>

                      <!-- Info -->
                      <div class="flex min-w-0 flex-1 flex-col">
                        <span class="truncate text-sm font-semibold capitalize text-slate-700 leading-snug">{{ item.event?.name }}</span>
                        <span v-if="item.eventHour" class="text-[11px] text-slate-400">
                          {{ item.eventHour.startTime }}–{{ item.eventHour.endTime }}
                          <template v-if="item.mySchedule?.position"> · {{ item.mySchedule.position.name }}</template>
                        </span>
                      </div>

                      <!-- Status chip -->
                      <div class="flex flex-shrink-0 items-center gap-1.5">
                        <template v-if="!isRefusable(item)">
                          <span class="text-xs font-medium text-green-600">Auto</span>
                        </template>
                        <template v-else-if="item.mySchedule?.status === 'accepted'">
                          <BaseIcon name="Check" class="!size-3.5 text-green-500" />
                          <span class="text-xs font-medium text-green-600">Confirmado</span>
                        </template>
                        <template v-else-if="item.mySchedule?.status === 'declined'">
                          <BaseIcon name="XMark" class="!size-3.5 text-red-400" />
                          <span class="text-xs font-medium text-red-500">Recusado</span>
                        </template>
                        <template v-else-if="item.mySchedule?.status === 'rescheduled'">
                          <BaseIcon name="ArrowPath" class="!size-3.5 text-slate-400" />
                          <span class="text-xs font-medium text-slate-500">Substituído</span>
                        </template>
                        <template v-else-if="item.mySchedule?.status === 'blocked'">
                          <BaseIcon name="Clock" class="!size-3.5 text-amber-500" />
                          <span class="text-xs font-medium text-amber-600">Ausência</span>
                        </template>
                        <template v-else-if="item.mySchedule?.status === 'change_request_admin'">
                          <BaseIcon name="ArrowPath" class="!size-3.5 text-amber-500" />
                          <span class="text-xs font-medium text-amber-600">Troca</span>
                        </template>
                        <template v-else-if="item.mySchedule?.status === 'change_request_user'">
                          <BaseIcon name="UserGroup" class="!size-3.5 text-blue-500" />
                          <span class="text-xs font-medium text-blue-600">Candidatos</span>
                        </template>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </template>

          <Empty
            v-else
            title="Nenhuma escala encontrada"
            description="Assim que você for escalado em alguma agenda, você verá aqui."
          />
        </div>
      </div>
    </template>

    <FormDeclined />
    <FormChange />
    <ScaleObservation />
    <ScaleAttachment />
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import Empty from '@/components/empty/Empty';
import SkeletonRows from '@/components/skeleton/SkeletonRows';
import FormSelect from '@/components/form/Select.vue';
import FormDeclined from '@/modules/calendar/views/lists/schedule/FormDeclined';
import FormChange from '@/modules/calendar/views/lists/schedule/FormChange';
import ScaleObservation from '@/modules/calendar/components/scale/Observation';
import ScaleAttachment from '@/modules/calendar/components/scale/Attachment';

import { useScheduleStore } from '@/modules/calendar/store/schedule';
import { useAuthStore } from '@/modules/auth/store';
import { useEventDayStore } from '@/modules/calendar/store/eventDay';

const MONTH_NAMES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];

const MONTH_SHORT = [
  'Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'
];

const DAY_NAMES = [
  'Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'
];

export default {
  components: {
    BaseIcon, Empty, SkeletonRows, FormSelect,
    FormDeclined, FormChange, ScaleObservation, ScaleAttachment
  },

  data() {
    return {
      loading: true,
      mode: 'list',
      pendingQueue: [],
      totalPending: 0,
      selectedMonth: null,
      MONTH_SHORT
    };
  },

  computed: {
    scheduleStore: () => useScheduleStore(),
    authStore:     () => useAuthStore(),
    eventDayStore: () => useEventDayStore(),

    currentItem()    { return this.pendingQueue[0] || null; },
    allDone()        { return this.mode === 'wizard' && this.pendingQueue.length === 0; },
    completedCount() { return this.totalPending - this.pendingQueue.length; },
    progressWidth()  {
      if (!this.totalPending) return '0%';
      return `${(this.completedCount / this.totalPending) * 100}%`;
    },

    monthOptions() {
      const current = this.moment().month() + 1;
      return MONTH_NAMES.map((label, i) => ({ label, value: i + 1, disabled: i + 1 < current }));
    },

    filteredSchedules() {
      return (this.scheduleStore?.getSchedules || []).filter(item =>
        this.selectedMonth === null || item.event?.month === Number(this.selectedMonth)
      );
    },

    groupedEvents() {
      const map = new Map();
      for (const item of this.filteredSchedules) {
        const date  = this.moment(item.eventDay?.date);
        const key   = date.format('YYYY-MM');
        const label = `${MONTH_NAMES[date.month()]} ${date.year()}`;
        if (!map.has(key)) map.set(key, { month: key, label, items: [] });
        map.get(key).items.push(item);
      }
      return Array.from(map.values());
    }
  },

  mounted() {
    this.getSchedules();
  },

  methods: {
    formatDatePt(date) {
      const d = this.moment(date);
      return `${DAY_NAMES[d.day()]}, ${d.format('DD')} de ${MONTH_NAMES[d.month()]}`;
    },

    formatCents(cents) {
      if (!cents) return '–';
      return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
    },

    isRefusable(item) {
      const r = item?.event?.configuration?.refuse;
      return r === true || r === 'true';
    },

    cardAccent(item) {
      const map = {
        pending:              'border-l-4 border-l-amber-400',
        accepted:             'border-l-4 border-l-green-500',
        declined:             'border-l-4 border-l-red-400',
        blocked:              'border-l-4 border-l-amber-500',
        change_request_admin: 'border-l-4 border-l-amber-400',
        change_request_user:  'border-l-4 border-l-blue-400',
        rescheduled:          'border-l-4 border-l-slate-300'
      };
      return map[item.mySchedule?.status] || 'border-l-4 border-l-slate-200';
    },

    async getSchedules() {
      try {
        const response = await this.axios.get(`/users/${this.authStore.user.id}/schedules`);
        this.scheduleStore.setSchedules(response);

        const pending = (response || [])
          .filter(i => this.isRefusable(i) && i.mySchedule?.status === 'pending')
          .sort((a, b) => new Date(a.eventDay.date) - new Date(b.eventDay.date));

        this.pendingQueue = pending;
        this.totalPending = pending.length;
        this.mode = pending.length > 0 ? 'wizard' : 'list';
      } finally {
        this.loading = false;
      }
    },

    removeFromQueue(item) {
      const idx = this.pendingQueue.findIndex(i => i.id === item.id);
      if (idx !== -1) this.pendingQueue.splice(idx, 1);
    },

    refreshInBackground() {
      this.axios.get(`/users/${this.authStore.user.id}/schedules`).then(r => {
        this.scheduleStore.setSchedules(r);
      }).catch(() => {});
    },

    // ── Wizard actions ──

    async accepted(item) {
      this.removeFromQueue(item);
      try {
        await this.axios.patch(`schedule_items/${item.mySchedule.id}/respond`, {
          status: 'accepted', user_id: this.authStore.user.id
        });
        this.refreshInBackground();
      } catch (e) {
        this.pendingQueue.unshift(item);
        console.error(e);
      }
    },

    declined(item) {
      this.scheduleStore.setSchedule(item);
      this.drawerStore.setDrawer({
        title: 'Motivo da recusa',
        context: 'reasonScheduleDeclined',
        open: true,
        onSave: () => { this.removeFromQueue(item); this.refreshInBackground(); }
      });
    },

    changeSchedule(item) {
      this.scheduleStore.setSchedule(item);
      this.drawerStore.setDrawer({
        title: 'Troca de escala',
        context: 'changeSchedule',
        open: true,
        onSave: () => { this.removeFromQueue(item); this.refreshInBackground(); }
      });
    },

    // ── List actions (refresh full list after) ──

    async acceptedFromList(item) {
      try {
        await this.axios.patch(`schedule_items/${item.mySchedule.id}/respond`, {
          status: 'accepted', user_id: this.authStore.user.id
        });
        this.removeFromQueue(item);
        this.getSchedules();
      } catch (e) { console.error(e); }
    },

    declinedFromList(item) {
      this.scheduleStore.setSchedule(item);
      this.drawerStore.setDrawer({
        title: 'Motivo da recusa',
        context: 'reasonScheduleDeclined',
        open: true,
        onSave: () => { this.removeFromQueue(item); this.getSchedules(); }
      });
    },

    changeScheduleFromList(item) {
      this.scheduleStore.setSchedule(item);
      this.drawerStore.setDrawer({
        title: 'Troca de escala',
        context: 'changeSchedule',
        open: true,
        onSave: () => { this.removeFromQueue(item); this.getSchedules(); }
      });
    },

    openObservation(item) {
      this.eventDayStore.setEventDay(item);
      this.drawerStore.setDrawer({ title: 'Observações', context: 'scale-observation', open: true });
    },

    openAttachment(item) {
      this.eventDayStore.setEventDay(item);
      this.drawerStore.setDrawer({ title: 'Arquivos Anexos', context: 'scale-attachment', open: true });
    }
  }
};
</script>

<style scoped>
.card-slide-enter-active,
.card-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.25s ease;
}
.card-slide-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.card-slide-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}
</style>
