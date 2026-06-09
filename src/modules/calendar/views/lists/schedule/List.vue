<template>
  <div class="w-full">
    <!-- Filtros -->
    <div class="mb-4">
      <!-- Mobile: toggle collapsível -->
      <div class="sm:hidden">
        <button
          class="mb-2 flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-500"
          @click="showFilters = !showFilters"
        >
          <BaseIcon name="Cog" class="!size-3.5" />
          <span>Filtros</span>
          <span
            v-if="activeFilterCount > 0"
            class="ml-1 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600"
          >{{ activeFilterCount }}</span>
          <BaseIcon :name="showFilters ? 'ChevronUp' : 'ChevronDown'" class="!size-3.5 ml-auto" />
        </button>
        <div v-show="showFilters" class="grid grid-cols-2 gap-2">
          <FormSelect v-model="selectedMonth" placeholder="Todos os meses" :options="monthOptions" class="w-full" />
          <FormSelect v-model="selectedEventId" :options="eventOptions" class="w-full" />
          <FormSelect v-model="selectedStatus" :options="statusOptions" class="col-span-2 w-full" />
        </div>
      </div>
      <!-- Desktop: sempre visível -->
      <div class="hidden sm:flex sm:flex-row sm:items-center sm:justify-end sm:gap-3">
        <FormSelect v-model="selectedMonth" placeholder="Todos os meses" :options="monthOptions" class="w-full" />
        <FormSelect v-model="selectedEventId" :options="eventOptions" class="w-full" />
        <FormSelect v-model="selectedStatus" :options="statusOptions" class="w-full" />
      </div>
    </div>

    <!-- Skeleton / Lista -->
    <SkeletonRows v-if="loading" :rows="4" has-prefix has-trailing />
    <div v-else-if="filteredEvents.length">
      <div class="mb-3 flex justify-end">
        <span class="text-xs font-medium text-slate-400">
          {{ filteredEvents.length }} escala{{ filteredEvents.length > 1 ? 's' : '' }}
        </span>
      </div>

      <div class="flex flex-col gap-2">
        <CardRow
          v-for="data in filteredEvents"
          :key="data.id"
          :accent="statusAccent(data?.mySchedule?.status)"
        >
          <!-- Data -->
          <template #prefix>
            <span class="text-sm font-bold leading-none text-slate-900">
              {{ moment(data.eventDay.date).format('DD') }}
            </span>
            <span class="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              {{ moment(data.eventDay.date).format('MMM') }}
            </span>
          </template>

          <!-- Informações principais -->
          <div class="flex min-w-0 flex-col gap-1">
            <span class="truncate text-sm font-semibold capitalize text-slate-900">{{ data?.event?.name }}</span>
            <div class="flex flex-wrap items-center gap-1.5">
              <div v-if="data?.eventHour" class="flex flex-shrink-0 items-center gap-1 rounded border border-slate-300 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                <BaseIcon name="Clock" class="!size-3" />
                {{ data?.eventHour?.startTime }}–{{ data?.eventHour?.endTime }}
              </div>
              <span
                v-if="data?.mySchedule?.position"
                class="max-w-[120px] truncate rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600"
              >
                {{ data?.mySchedule?.position?.name }}
              </span>
              <!-- Chip de pagamento -->
              <template v-if="data?.event?.configuration?.type === 'paid' && data?.mySchedule">
                <span
                  v-if="data.mySchedule.payment_status === 'paid'"
                  class="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700"
                >
                  <BaseIcon name="Check" class="!size-3" />
                  Recebido · {{ formatCents(data.mySchedule.effective_rate_cents) }}
                </span>
                <span
                  v-else
                  class="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700"
                >
                  <BaseIcon name="BankNotes" class="!size-3" />
                  A receber · {{ formatCents(data.mySchedule.effective_rate_cents) }}
                </span>
              </template>
            </div>
          </div>

          <!-- Status + Ações -->
          <template #trailing>

            <!-- PENDING: 2 linhas — primária (status + aceitar/recusar) / secundária (trocar + obs/anexos) -->
            <template v-if="isRefusable(data) && data?.mySchedule?.status === 'pending'">
              <div class="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-1.5">
                <!-- Linha 1: status + ações primárias -->
                <div class="flex items-center gap-1.5">
                  <div class="flex items-center gap-1">
                    <span class="relative flex h-1.5 w-1.5 flex-shrink-0">
                      <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                      <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                    </span>
                    <span class="text-xs font-semibold text-amber-700">Pendente</span>
                  </div>
                  <button
                    class="inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-[11px] font-semibold text-white transition"
                    :class="processing[data.mySchedule.id] ? 'cursor-not-allowed bg-green-400' : 'bg-green-600 hover:bg-green-700'"
                    :disabled="!!processing[data.mySchedule.id]"
                    @click="accepted(data)"
                  >
                    <svg v-if="processing[data.mySchedule.id] === 'accepting'" class="!size-3.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    <BaseIcon v-else name="Check" class="!size-3.5" />
                    {{ processing[data.mySchedule.id] === 'accepting' ? 'Aguarde...' : 'Aceitar' }}
                  </button>
                  <button
                    class="inline-flex items-center gap-1 rounded px-2.5 py-1.5 text-[11px] font-semibold text-white transition"
                    :class="processing[data.mySchedule.id] ? 'cursor-not-allowed bg-red-300' : 'bg-red-500 hover:bg-red-600'"
                    :disabled="!!processing[data.mySchedule.id]"
                    @click="declined(data)"
                  >
                    <BaseIcon name="XMark" class="!size-3.5" />
                    Recusar
                  </button>
                </div>
                <!-- Linha 2: ações secundárias -->
                <div class="flex items-center gap-1.5">
                  <button
                    class="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-50"
                    @click="changeSchedule(data)"
                  >
                    <BaseIcon name="ArrowPath" class="!size-3.5" />
                    Trocar
                  </button>
                  <div class="ml-auto flex items-center gap-0.5 border-l border-slate-200 pl-2">
                    <button
                      class="inline-flex items-center justify-center rounded p-1.5 transition"
                      :class="data.event.observation ? 'text-slate-500 hover:bg-slate-100' : 'cursor-default text-slate-300'"
                      :title="data.event.observation ? 'Ver observações' : 'Sem observações'"
                      @click="data.event.observation && openObservation(data)"
                    ><BaseIcon name="Chat" class="!size-4" /></button>
                    <button
                      class="relative inline-flex items-center justify-center rounded p-1.5 transition"
                      :class="data.event.attachmentsUrls?.length ? 'text-slate-500 hover:bg-slate-100' : 'cursor-default text-slate-300'"
                      :title="data.event.attachmentsUrls?.length ? 'Ver anexos' : 'Sem anexos'"
                      @click="data.event.attachmentsUrls?.length && openAttachment(data)"
                    >
                      <BaseIcon name="PaperClip" class="!size-4" />
                      <span v-if="data.event.attachmentsUrls?.length" class="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-700 text-[7px] font-bold text-white">{{ data.event.attachmentsUrls.length }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </template>

            <!-- Todos os outros status: 1 linha -->
            <template v-else>
              <div class="flex w-full items-center gap-1.5">

                <!-- AUTO -->
                <template v-if="!isRefusable(data)">
                  <BaseIcon name="Check" class="!size-3.5 text-green-500" />
                  <span class="text-xs font-medium text-green-700">Automático</span>
                </template>

                <!-- ACCEPTED -->
                <template v-else-if="data?.mySchedule?.status === 'accepted'">
                  <BaseIcon name="Check" class="!size-3.5 text-green-500" />
                  <span class="text-xs font-medium text-green-700">Confirmado</span>
                  <button
                    class="ml-1 inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                    @click="changeSchedule(data)"
                  >
                    <BaseIcon name="ArrowPath" class="!size-3.5" />
                    Trocar
                  </button>
                </template>

                <!-- DECLINED -->
                <template v-else-if="data?.mySchedule?.status === 'declined'">
                  <BaseIcon name="XMark" class="!size-3.5 text-red-400" />
                  <span class="text-xs font-medium text-red-600">Recusado</span>
                </template>

                <!-- BLOCKED -->
                <template v-else-if="data?.mySchedule?.status === 'blocked'">
                  <BaseIcon name="Clock" class="!size-3.5 text-amber-500" />
                  <span class="text-xs font-medium text-amber-700">Ausência — aguardando aprovação</span>
                </template>

                <!-- CHANGE_REQUEST_ADMIN -->
                <button
                  v-else-if="data?.mySchedule?.status === 'change_request_admin'"
                  class="inline-flex items-center gap-1.5 hover:opacity-75"
                  @click="changeSchedule(data)"
                >
                  <BaseIcon name="ArrowPath" class="!size-3.5 animate-spin text-amber-500" style="animation-duration:3s" />
                  <span class="text-xs font-medium text-amber-700">Troca — aguardando gestor</span>
                </button>

                <!-- CHANGE_REQUEST_USER -->
                <button
                  v-else-if="data?.mySchedule?.status === 'change_request_user'"
                  class="inline-flex items-center gap-1.5 hover:opacity-75"
                  @click="changeSchedule(data)"
                >
                  <BaseIcon name="UserGroup" class="!size-3.5 text-blue-500" />
                  <span class="text-xs font-medium text-blue-700">Candidatos notificados</span>
                </button>

                <!-- RESCHEDULED -->
                <template v-else-if="data?.mySchedule?.status === 'rescheduled'">
                  <BaseIcon name="ArrowPath" class="!size-3.5 text-slate-400" />
                  <span class="text-xs font-medium text-slate-500">Substituído</span>
                </template>

                <!-- Obs + Anexos sempre no final -->
                <div class="ml-auto flex items-center gap-0.5 border-l border-slate-200 pl-2">
                  <button
                    class="inline-flex items-center justify-center rounded p-1.5 transition"
                    :class="data.event.observation ? 'text-slate-500 hover:bg-slate-100' : 'cursor-default text-slate-300'"
                    :title="data.event.observation ? 'Ver observações' : 'Sem observações'"
                    @click="data.event.observation && openObservation(data)"
                  ><BaseIcon name="Chat" class="!size-4" /></button>
                  <button
                    class="relative inline-flex items-center justify-center rounded p-1.5 transition"
                    :class="data.event.attachmentsUrls?.length ? 'text-slate-500 hover:bg-slate-100' : 'cursor-default text-slate-300'"
                    :title="data.event.attachmentsUrls?.length ? 'Ver anexos' : 'Sem anexos'"
                    @click="data.event.attachmentsUrls?.length && openAttachment(data)"
                  >
                    <BaseIcon name="PaperClip" class="!size-4" />
                    <span v-if="data.event.attachmentsUrls?.length" class="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-slate-700 text-[7px] font-bold text-white">{{ data.event.attachmentsUrls.length }}</span>
                  </button>
                </div>

              </div>
            </template>

          </template>
        </CardRow>
      </div>
    </div>

    <!-- Empty -->
    <Empty
      v-else-if="!loading"
      class="-mt-12"
      title="Nenhuma escala encontrada"
      description="Assim que você for escalado em alguma agenda, você verá aqui."
    />

    <!-- Modais -->
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
import FormDeclined from '@/modules/calendar/views/lists/schedule/FormDeclined';
import FormChange from '@/modules/calendar/views/lists/schedule/FormChange';
import ScaleObservation from '@/modules/calendar/components/scale/Observation';
import ScaleAttachment from '@/modules/calendar/components/scale/Attachment';
import FormSelect from '@/components/form/Select.vue';
import CardRow from '@/components/card/CardRow.vue';

import { useConfirmationStore } from '@/components/confirmation/store';
import { useScheduleStore } from '@/modules/calendar/store/schedule';
import { useAuthStore } from '@/modules/auth/store';
import { useEventDayStore } from '@/modules/calendar/store/eventDay';

export default {
  components: {
    BaseIcon,
    FormDeclined,
    Empty,
    SkeletonRows,
    ScaleObservation,
    ScaleAttachment,
    FormSelect,
    FormChange,
    CardRow
  },
  data() {
    return {
      loading: true,
      selectedEventId: 'all',
      selectedMonth: null,
      selectedStatus: 'all',
      showFilters: false,
      processing: {}
    };
  },
  computed: {
    eventDayStore: () => useEventDayStore(),
    confirmationStore: () => useConfirmationStore(),
    scheduleStore: () => useScheduleStore(),
    authStore: () => useAuthStore(),
    monthOptions() {
      const currentMonth = this.moment().month() + 1;
      return [
        { value: 1, label: 'Janeiro' },
        { value: 2, label: 'Fevereiro' },
        { value: 3, label: 'Março' },
        { value: 4, label: 'Abril' },
        { value: 5, label: 'Maio' },
        { value: 6, label: 'Junho' },
        { value: 7, label: 'Julho' },
        { value: 8, label: 'Agosto' },
        { value: 9, label: 'Setembro' },
        { value: 10, label: 'Outubro' },
        { value: 11, label: 'Novembro' },
        { value: 12, label: 'Dezembro' }
      ].map(m => ({ ...m, disabled: m.value < currentMonth }));
    },
    statusOptions() {
      return [
        { label: 'Todos os status', value: 'all' },
        { label: 'Pendente', value: 'pending' },
        { label: 'Confirmada', value: 'accepted' },
        { label: 'Recusada', value: 'declined' },
        { label: 'Solicitou troca', value: 'change_request_admin' }
      ];
    },
    eventOptions() {
      const map = new Map();
      this.scheduleStore?.getSchedules.forEach(item => {
        const event = item.event;
        if (event && !map.has(event.id)) {
          map.set(event.id, { label: event.name, value: event.id });
        }
      });
      return [{ label: 'Todas as agendas', value: 'all' }, ...Array.from(map.values())];
    },
    activeFilterCount() {
      let count = 0;
      if (this.selectedMonth !== null) count++;
      if (this.selectedEventId !== 'all') count++;
      if (this.selectedStatus !== 'all') count++;
      return count;
    },
    filteredEvents() {
      return this.scheduleStore?.getSchedules.filter(item => {
        const matchesEvent = this.selectedEventId === 'all' || item.event?.id === this.selectedEventId;
        const matchesMonth = this.selectedMonth === null || item.event?.month === Number(this.selectedMonth);
        const matchesStatus = this.selectedStatus === 'all' || item.mySchedule?.status === this.selectedStatus;
        return matchesEvent && matchesMonth && matchesStatus;
      });
    }
  },
  mounted() {
    this.getSchedules();
  },
  methods: {
    formatCents(cents) {
      if (!cents) return '–';
      return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
    },
    isRefusable(data) {
      const refuse = data?.event?.configuration?.refuse;
      return refuse === true || refuse === 'true';
    },
    statusAccent(status) {
      const map = {
        pending:              'border-l-2 border-l-amber-400',
        accepted:             'border-l-2 border-l-green-500',
        declined:             'border-l-2 border-l-red-400',
        blocked:              'border-l-2 border-l-amber-500',
        change_request_admin: 'border-l-2 border-l-amber-400',
        change_request_user:  'border-l-2 border-l-blue-400',
        rescheduled:          'border-l-2 border-l-slate-300'
      };
      return map[status] || '';
    },
    async accepted(data) {
      const id = data?.mySchedule?.id;
      if (!id || this.processing[id]) return;
      this.processing[id] = 'accepting';
      try {
        await this.axios.patch(`schedule_items/${id}/respond`, {
          status: 'accepted',
          user_id: this.authStore.user.id
        });
        // Atualização otimista: muda o status na hora sem esperar reload
        const item = this.scheduleStore.schedules.find(s => s.mySchedule?.id === id);
        if (item?.mySchedule) item.mySchedule.status = 'accepted';
        this.getSchedules();
      } catch (error) {
        console.error(error);
      } finally {
        delete this.processing[id];
      }
    },
    declined(data) {
      this.scheduleStore.setSchedule(data);
      this.drawerStore.setDrawer({
        title: 'Motivo da recusa',
        context: 'reasonScheduleDeclined',
        open: true,
        onSave: () => { this.getSchedules(); }
      });
    },
    async getSchedules() {
      try {
        await this.axios.get(`/users/${this.authStore.user.id}/schedules`).then(response => {
          this.scheduleStore.setSchedules(response);
        });
      } finally {
        this.loading = false;
      }
    },
    openObservation(data) {
      this.eventDayStore.setEventDay(data);
      this.drawerStore.setDrawer({ title: 'Observações', context: 'scale-observation', open: true });
    },
    openAttachment(data) {
      this.eventDayStore.setEventDay(data);
      this.drawerStore.setDrawer({ title: 'Arquivos Anexos', context: 'scale-attachment', open: true });
    },
    changeSchedule(data) {
      this.scheduleStore.setSchedule(data);
      this.drawerStore.setDrawer({
        title: 'Troca de escala',
        context: 'changeSchedule',
        open: true,
        onSave: () => { this.getSchedules(); }
      });
    }
  }
};
</script>
