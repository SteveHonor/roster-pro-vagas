<template>
  <div class="w-full">
    <!-- Filtros -->
    <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
      <FormInput
        v-model="searchTerm"
        placeholder="Digite para pesquisar"
        icon="search"
        class="w-full"
      />
      <FormSelect
        v-model="selectedMonth"
        placeholder="Filtre por mês"
        :options="monthOptions"
        class="w-full sm:w-56"
      />
      <BaseButton
        v-if="$can.canAccess('operator')"
        icon="Plus"
        @click="() => $can.canCreate('events') ? $router.push('/calendar/new') : planStore.setOpen('limit')"
      >
        Criar Nova Agenda
      </BaseButton>
    </div>

    <!-- Skeleton / Lista -->
    <SkeletonRows v-if="loading" :rows="4" has-prefix has-trailing />

    <div v-else-if="filteredEvents.length">
      <!-- Banner info -->
      <div class="mb-4 flex items-center gap-2 text-xs text-slate-400">
        <BaseIcon name="Exclamation" class="!size-3.5 flex-shrink-0 text-slate-300" />
        Agendas concluídas são movidas para o <strong class="font-medium text-slate-500">Histórico</strong>&nbsp;após 24h do término.
      </div>

      <div class="flex flex-col gap-2">
        <CardRow
          v-for="data in filteredEvents"
          :key="data.id"
        >
          <!-- Data -->
          <template #prefix>
            <span class="text-sm font-bold leading-none text-slate-900">
              {{ moment(data.date).format('DD') }}
            </span>
            <span class="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              {{ moment(data.date).format('MMM') }}
            </span>
          </template>

          <!-- Info -->
          <div class="flex min-w-0 flex-col gap-1">
            <span class="truncate text-sm font-semibold capitalize text-slate-900">{{ data.event?.name }}</span>
            <div class="flex flex-wrap items-center gap-1.5">
              <div
                v-for="(hour, i) in data.eventHours"
                :key="i"
                class="flex flex-shrink-0 items-center gap-1 rounded border border-slate-300 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
              >
                <BaseIcon name="Clock" class="!size-3" />
                {{ hour.startTime }}–{{ hour.endTime }}
              </div>
              <span
                v-if="data.event?.type"
                class="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500"
              >
                {{ eventTypes(data.event.type) }}
              </span>
            </div>
          </div>

          <!-- Ações -->
          <template v-if="$can.canAccess('operator')" #trailing>
            <div class="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
              <div class="flex items-center gap-1.5">
                <button
                  v-if="data.status === 'report'"
                  class="inline-flex items-center gap-1.5 rounded border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-50"
                  @click="scaleReport(data)"
                >
                  <BaseIcon name="DocumentText" class="!size-3.5" />
                  Relatório
                </button>
                <button
                  v-if="data.event?.configuration?.type === 'paid'"
                  class="inline-flex items-center gap-1.5 rounded border border-green-200 bg-green-100 px-3 py-1.5 text-[11px] font-medium text-green-700 transition hover:bg-green-100"
                  @click="$router.push(`calendar/${data.eventDayId}/payments`)"
                >
                  <BaseIcon name="BankNotes" class="!size-3.5" />
                  Pagamentos
                </button>
                <button
                  v-if="data.status === 'unstarted'"
                  class="inline-flex items-center gap-1.5 rounded bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-blue-700"
                  @click="scale(data.eventDayId)"
                >
                  <BaseIcon name="Calendar" class="!size-3.5" />
                  Gerenciar Escalas
                </button>
              </div>
              <div class="flex items-center gap-1">
                <button
                  class="inline-flex items-center justify-center rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  title="Configurar agenda"
                  @click="editEvent(data)"
                >
                  <BaseIcon name="Cog" class="!size-4" />
                </button>
                <button
                  class="inline-flex items-center justify-center rounded p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  title="Cancelar agenda"
                  @click="remove(data.eventDayId)"
                >
                  <BaseIcon name="Trash" class="!size-4" />
                </button>
              </div>
            </div>
          </template>
        </CardRow>
      </div>
    </div>

    <!-- Empty -->
    <Empty
      v-else-if="!loading"
      title="Nenhuma agenda encontrada"
      description="Para adicionar uma nova agenda clique em 'Criar Nova Agenda'"
      class="-mt-12"
    />

    <EditEvent />
  </div>
</template>

<script>
import BaseButton from '@/components/base/Button';
import BaseIcon from '@/components/icons/BaseIcon';
import CardRow from '@/components/card/CardRow.vue';
import EditEvent from '@/modules/calendar/views/Edit';
import Empty from '@/components/empty/Empty';
import SkeletonRows from '@/components/skeleton/SkeletonRows';
import FormSelect from '@/components/form/Select.vue';
import FormInput from '@/components/form/Input.vue';

import { useConfirmationStore } from '@/components/confirmation/store';
import { useEventDayStore } from '@/modules/calendar/store/eventDay';
import { useEventStore } from '@/modules/calendar/store/event';
import { useAuthStore } from '@/modules/auth/store';

export default {
  components: { BaseButton, BaseIcon, CardRow, EditEvent, Empty, SkeletonRows, FormSelect, FormInput },
  data() {
    return {
      loading: true,
      searchTerm: '',
      selectedEventId: 'all',
      selectedMonth: this.moment().month() + 1,
      selectedIds: []
    };
  },
  computed: {
    authStore: () => useAuthStore(),
    confirmationStore: () => useConfirmationStore(),
    eventDayStore: () => useEventDayStore(),
    eventStore: () => useEventStore(),
    filteredEvents() {
      return this.eventDayStore.eventDays.filter(eventItem => {
        const matchesEvent =
          this.selectedEventId === 'all' ||
          !this.selectedEventId ||
          eventItem?.event?.id === this.selectedEventId;

        const matchesMonth =
          this.selectedMonth === 'all' ||
          eventItem.event?.month === Number(this.selectedMonth);

        const matchesSearch =
          !this.searchTerm ||
          eventItem.event?.name
            ?.toLowerCase()
            .includes(this.searchTerm.toLowerCase());

        return matchesEvent && matchesSearch && matchesMonth;
      });
    },
    monthOptions() {
      const currentMonth = this.moment().month() + 1;

      return [
        { label: 'Todos os meses', value: 'all' },
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
      ].map(m => ({
        ...m,
        disabled: m.value < currentMonth
      }));
    }
  },
  watch: {
    filteredEvents() {
      this.selectedIds = [];
    }
  },
  mounted() {
    this.getEvents();
  },
  methods: {
    eventTypes(eventTypes) {
      let type = {
        place: 'Presencial',
        remote: 'Remoto',
        hybrid: 'Híbrido'
      };

      return type[eventTypes];
    },
    async getEvents() {
      try {
        await this.axios.get('events').then(response => {
          this.eventDayStore.setEventDays(response);
        });
      } finally {
        this.loading = false;
      }
    },
    scale(eventDayId) {
      this.$router.push(`calendar/${eventDayId}/scale`);
    },
    scaleReport(data) {
      this.eventDayStore.setEventDay(data);
      this.$router.push(`/calendar/${data.eventDayId}/scale/report`);
    },
    editEvent(data) {
      this.eventDayStore.setEventDay(data);
      this.eventStore.setEvent(data.event);

      this.drawerStore.setDrawer({
        title: 'Configurar Agenda',
        context: 'event',
        size: 'large',
        open: true
      });
    },
    async remove(id) {
      this.confirmationStore.setConfirmation({
        title: 'Cancelar esta data?',
        description:
          '<p>Você está cancelando <strong>apenas esta ocorrência</strong> da agenda.</p>' +
          '<p class="italic my-2 text-gray-600">Colaboradores escalados nesta data serão notificados de acordo com suas preferências.</p>' +
          '<p class="my-3 text-gray-500 text-xs">Para cancelar todas as datas desta agenda, use a opção "Cancelar Agenda Completa" nas configurações da agenda.</p>' +
          '<p class="mt-3 text-red-500 text-sm font-medium">Essa ação é irreversível.</p>',
        open: true,
        onConfirm: async () => {
          try {
            this.axios.delete(`events/${id}`).then(response => {
              this.eventDayStore.setEventDays(response);
              this.confirmationStore.close();
            });
          } catch (error) {
            console.error('Erro ao remover evento:', error);
          }
        }
      });
    }
  }
};
</script>
