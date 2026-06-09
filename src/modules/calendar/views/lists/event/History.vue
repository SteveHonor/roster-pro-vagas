<template>
  <div class="w-full">
    <!-- Filtros -->
    <div class="mb-3 space-y-4 sm:flex sm:gap-4 sm:space-y-0">
      <FormInput v-model="searchTerm" placeholder="Digite para pesquisar" icon="search" class="w-full sm:w-4/6" />
      <FormSelect v-model="selectedEventId" :options="eventOptions" class="w-full sm:w-2/6" placeholder="Filtrar agendas" />
    </div>

    <!-- Skeleton -->
    <SkeletonRows v-if="loading" :rows="4" has-prefix has-trailing />

    <!-- VIEW: ADMIN -->
    <template v-else-if="$can.canAccess('admin')">
      <div v-if="filteredEvents.length" class="space-y-6">

        <!-- Pendentes -->
        <div v-if="pendingReports.length">
          <div class="mb-2 flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-orange-400" />
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Relatórios pendentes</span>
            <span class="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-600">{{ pendingReports.length }}</span>
          </div>
          <div class="flex flex-col gap-2">
            <CardRow v-for="data in pendingReports" :key="data.id">
              <template #prefix>
                <span class="text-sm font-bold leading-none text-slate-900">{{ moment(data.date).format('DD') }}</span>
                <span class="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">{{ moment(data.date).format('MMM') }}</span>
              </template>
              <div class="flex min-w-0 flex-col gap-1">
                <span class="truncate text-sm font-semibold capitalize text-slate-900">{{ data.event?.name }}</span>
                <div class="flex flex-wrap items-center gap-1.5">
                  <div v-for="(hour, i) in data.eventHours" :key="i" class="flex items-center gap-1 rounded border border-slate-300 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                    <BaseIcon name="Clock" class="!size-3" />{{ hour.startTime }}–{{ hour.endTime }}
                  </div>
                  <span v-if="data.event?.eventType" class="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">{{ eventTypes(data.event.eventType) }}</span>
                  <span v-if="data.event?.placeName" class="text-[11px] text-slate-400">› {{ data.event.placeName }}</span>
                </div>
                <div v-if="data.pendingOperators?.length" class="mt-0.5 flex flex-wrap gap-1">
                  <span
                    v-for="op in data.pendingOperators"
                    :key="op.id"
                    class="flex items-center gap-1 rounded bg-orange-50 px-1.5 py-0.5 text-[11px] font-medium text-orange-600"
                  >
                    <BaseIcon name="Clock" class="!size-2.5" />{{ op.name }}
                  </span>
                </div>
              </div>
              <template #trailing>
                <button class="inline-flex items-center gap-1.5 rounded border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-50" @click="scaleReport(data)">
                  <BaseIcon name="DocumentText" class="!size-3.5" />Ver Relatório
                </button>
              </template>
            </CardRow>
          </div>
        </div>

        <!-- Preenchidos -->
        <div v-if="doneReports.length">
          <div class="mb-2 flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-green-400" />
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Eventos finalizados</span>
            <span class="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-600">{{ doneReports.length }}</span>
          </div>
          <div class="flex flex-col gap-2">
            <CardRow v-for="data in doneReports" :key="data.id">
              <template #prefix>
                <span class="text-sm font-bold leading-none text-slate-900">{{ moment(data.date).format('DD') }}</span>
                <span class="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">{{ moment(data.date).format('MMM') }}</span>
              </template>
              <div class="flex min-w-0 flex-col gap-1">
                <span class="truncate text-sm font-semibold capitalize text-slate-900">{{ data.event?.name }}</span>
                <div class="flex flex-wrap items-center gap-1.5">
                  <div v-for="(hour, i) in data.eventHours" :key="i" class="flex items-center gap-1 rounded border border-slate-300 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                    <BaseIcon name="Clock" class="!size-3" />{{ hour.startTime }}–{{ hour.endTime }}
                  </div>
                  <span v-if="data.event?.eventType" class="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">{{ eventTypes(data.event.eventType) }}</span>
                  <span v-if="data.event?.placeName" class="text-[11px] text-slate-400">› {{ data.event.placeName }}</span>
                </div>
              </div>
              <template #trailing>
                <div class="flex items-center gap-2">
                  <span v-if="data.reportRating" class="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
                    <BaseIcon name="Star" class="!size-3" />{{ Number(data.reportRating).toFixed(1) }}
                  </span>
                  <span class="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-600">
                    <BaseIcon name="Check" class="!size-3" />Finalizado
                  </span>
                  <button class="inline-flex items-center gap-1.5 rounded border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-50" @click="scaleReport(data)">
                    <BaseIcon name="DocumentText" class="!size-3.5" />Ver Relatório
                  </button>
                </div>
              </template>
            </CardRow>
          </div>
        </div>
      </div>

      <Empty v-else title="Nenhuma agenda encontrada" description="Nenhuma agenda com data passada encontrada." class="-mt-12" />
    </template>

    <!-- VIEW: OPERADOR -->
    <template v-else-if="$can.canAccess('operator')">
      <div v-if="filteredEvents.length" class="space-y-6">

        <!-- Pendentes -->
        <div v-if="pendingReports.length">
          <div class="mb-2 flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-orange-400" />
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Relatórios pendentes</span>
            <span class="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-600">{{ pendingReports.length }}</span>
          </div>
          <div class="flex flex-col gap-2">
            <CardRow v-for="data in pendingReports" :key="data.id">
              <template #prefix>
                <span class="text-sm font-bold leading-none text-slate-900">{{ moment(data.date).format('DD') }}</span>
                <span class="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">{{ moment(data.date).format('MMM') }}</span>
              </template>
              <div class="flex min-w-0 flex-col gap-1">
                <span class="truncate text-sm font-semibold capitalize text-slate-900">{{ data.event?.name }}</span>
                <div class="flex flex-wrap items-center gap-1.5">
                  <div v-for="(hour, i) in data.eventHours" :key="i" class="flex items-center gap-1 rounded border border-slate-300 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                    <BaseIcon name="Clock" class="!size-3" />{{ hour.startTime }}–{{ hour.endTime }}
                  </div>
                  <span v-if="data.event?.eventType" class="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">{{ eventTypes(data.event.eventType) }}</span>
                  <span v-if="data.event?.placeName" class="text-[11px] text-slate-400">› {{ data.event.placeName }}</span>
                </div>
              </div>
              <template #trailing>
                <button class="inline-flex items-center gap-1.5 rounded border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-medium text-orange-600 transition hover:bg-orange-100" @click="scaleReport(data)">
                  <BaseIcon name="DocumentText" class="!size-3.5" />Preencher Relatório
                </button>
              </template>
            </CardRow>
          </div>
        </div>

        <!-- Preenchidos -->
        <div v-if="doneReports.length">
          <div class="mb-2 flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-green-400" />
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Relatórios preenchidos</span>
            <span class="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-600">{{ doneReports.length }}</span>
          </div>
          <div class="flex flex-col gap-2">
            <CardRow v-for="data in doneReports" :key="data.id">
              <template #prefix>
                <span class="text-sm font-bold leading-none text-slate-900">{{ moment(data.date).format('DD') }}</span>
                <span class="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">{{ moment(data.date).format('MMM') }}</span>
              </template>
              <div class="flex min-w-0 flex-col gap-1">
                <span class="truncate text-sm font-semibold capitalize text-slate-900">{{ data.event?.name }}</span>
                <div class="flex flex-wrap items-center gap-1.5">
                  <div v-for="(hour, i) in data.eventHours" :key="i" class="flex items-center gap-1 rounded border border-slate-300 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                    <BaseIcon name="Clock" class="!size-3" />{{ hour.startTime }}–{{ hour.endTime }}
                  </div>
                  <span v-if="data.event?.eventType" class="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">{{ eventTypes(data.event.eventType) }}</span>
                  <span v-if="data.event?.placeName" class="text-[11px] text-slate-400">› {{ data.event.placeName }}</span>
                </div>
              </div>
              <template #trailing>
                <div class="flex items-center gap-2">
                  <span v-if="data.reportRating" class="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
                    <BaseIcon name="Star" class="!size-3" />{{ Number(data.reportRating).toFixed(1) }}
                  </span>
                  <span class="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-600">
                    <BaseIcon name="Check" class="!size-3" />Finalizado
                  </span>
                  <button class="inline-flex items-center gap-1.5 rounded border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-50" @click="scaleReport(data)">
                    <BaseIcon name="DocumentText" class="!size-3.5" />Ver Relatório
                  </button>
                </div>
              </template>
            </CardRow>
          </div>
        </div>
      </div>

      <Empty v-else title="Nenhuma agenda encontrada" description="Nenhuma agenda com data passada encontrada." class="-mt-12" />
    </template>

    <!-- VIEW: WORKER -->
    <template v-else>
      <div v-if="filteredEvents.length" class="flex flex-col gap-2">
        <CardRow v-for="data in filteredEvents" :key="data.id">
          <template #prefix>
            <span class="text-sm font-bold leading-none text-slate-900">{{ moment(data.date).format('DD') }}</span>
            <span class="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">{{ moment(data.date).format('MMM') }}</span>
          </template>

          <div class="flex min-w-0 flex-col gap-1">
            <span class="truncate text-sm font-semibold capitalize text-slate-900">{{ data.event?.name }}</span>
            <div class="flex flex-wrap items-center gap-1.5">
              <div v-for="(hour, i) in data.eventHours" :key="i" class="flex items-center gap-1 rounded border border-slate-300 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                <BaseIcon name="Clock" class="!size-3" />{{ hour.startTime }}–{{ hour.endTime }}
              </div>
              <span v-if="data.event?.eventType" class="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">{{ eventTypes(data.event.eventType) }}</span>
              <span v-if="data.event?.placeName" class="text-[11px] text-slate-400">› {{ data.event.placeName }}</span>
            </div>
          </div>

          <template #trailing>
            <div v-if="data.myFeedback" class="flex items-center gap-2">
              <span class="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
                <BaseIcon name="Star" class="!size-3" />{{ data.myFeedback.rating }}
              </span>
              <span class="text-[11px] text-slate-400">Feedback enviado</span>
            </div>
            <button
              v-else-if="data.feedbackWindowOpen"
              class="inline-flex items-center gap-1.5 rounded border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-medium text-blue-600 transition hover:bg-blue-100"
              @click="openFeedback(data)"
            >
              <BaseIcon name="sparkles" class="!size-3.5" />Dar meu feedback
            </button>
            <span v-else class="text-[11px] italic text-slate-400">Prazo encerrado</span>
          </template>
        </CardRow>
      </div>

      <Empty v-else title="Nenhum evento encontrado" description="Você ainda não participou de nenhum evento." class="-mt-12" />
    </template>

    <WorkerEventFeedback @submitted="getEvents" />
    <EditEvent />
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import CardRow from '@/components/card/CardRow.vue';
import EditEvent from '@/modules/calendar/views/Edit';
import Empty from '@/components/empty/Empty';
import SkeletonRows from '@/components/skeleton/SkeletonRows';
import FormSelect from '@/components/form/Select.vue';
import FormInput from '@/components/form/Input.vue';
import WorkerEventFeedback from '@/components/workerEventFeedback/WorkerEventFeedback.vue';

import { useEventDayStore } from '@/modules/calendar/store/eventDay';
import { useWorkerEventFeedbackStore } from '@/components/workerEventFeedback/store';

export default {
  components: { BaseIcon, CardRow, EditEvent, Empty, SkeletonRows, FormSelect, FormInput, WorkerEventFeedback },

  data() {
    return { loading: true, searchTerm: '', selectedEventId: 'all' };
  },

  computed: {
    eventDayStore: () => useEventDayStore(),
    workerFeedbackStore: () => useWorkerEventFeedbackStore(),

    eventOptions() {
      const map = new Map();
      this.eventDayStore.eventDays.forEach(item => {
        const event = item.event;
        if (event && !map.has(event.id)) map.set(event.id, { label: event.name, value: event.id });
      });
      return [{ label: 'Todas as agendas', value: 'all' }, ...Array.from(map.values())];
    },

    filteredEvents() {
      return this.eventDayStore.eventDays.filter(item => {
        const matchesEvent = this.selectedEventId === 'all' || !this.selectedEventId || item.event?.id === this.selectedEventId;
        const matchesSearch = !this.searchTerm ||
          item.event?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
          item.event?.placeName?.toLowerCase().includes(this.searchTerm.toLowerCase());
        return matchesEvent && matchesSearch;
      });
    },

    pendingReports() {
      return this.filteredEvents
        .filter(i => this.isPending(i))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    doneReports() {
      return this.filteredEvents
        .filter(i => !this.isPending(i))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  },

  mounted() { this.getEvents(); },

  methods: {
    isPending(item) {
      if (this.$can.canAccess('admin')) {
        return (item.pendingOperators ?? []).length > 0;
      }
      if (item.myPendingTeamsCount != null) {
        return item.myPendingTeamsCount > 0;
      }
      return !item.myReportRating;
    },

    eventTypes(type) {
      return { place: 'Presencial', remote: 'Remoto', hybrid: 'Híbrido' }[type];
    },

    async getEvents() {
      try {
        const response = await this.axios.get('events/history');
        const localMap = Object.fromEntries(
          this.eventDayStore.eventDays
            .filter(e => e.myReportRating)
            .map(e => [e.id, e.myReportRating])
        );
        const merged = response.map(e => ({
          ...e,
          myReportRating: e.myReportRating ?? localMap[e.id] ?? null
        }));
        this.eventDayStore.setEventDays(merged);
      } finally {
        this.loading = false;
      }
    },

    scaleReport(data) {
      this.eventDayStore.setEventDay(data);
      this.$router.push(`/calendar/${data.eventDayId}/scale/report`);
    },

    openFeedback(data) {
      this.workerFeedbackStore.open(data.eventDayId);
      this.drawerStore.setDrawer({
        title: 'Feedback do Evento',
        context: 'worker-event-feedback',
        open: true
      });
    }
  }
};
</script>
