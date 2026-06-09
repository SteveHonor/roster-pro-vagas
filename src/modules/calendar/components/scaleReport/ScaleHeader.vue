<template>
  <CardRow>
    <template #prefix>
      <span class="text-sm font-bold leading-none text-slate-900">
        {{ moment(eventDayStore.eventDay.date).format('DD') }}
      </span>
      <span class="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">
        {{ moment(eventDayStore.eventDay.date).format('MMM') }}
      </span>
    </template>

    <div class="flex min-w-0 flex-col gap-1">
      <span class="truncate text-sm font-semibold uppercase text-slate-900">
        {{ eventDayStore.eventDay.event?.name }}
      </span>
      <div class="flex flex-wrap items-center gap-1 text-xs text-slate-400">
        <span>{{ eventTypes(eventDayStore.eventDay.event?.eventType) }}</span>
        <template v-if="eventDayStore.eventDay.event?.placeName">
          <span>›</span>
          <span class="capitalize">{{ eventDayStore.eventDay.event.placeName }}</span>
        </template>
      </div>
    </div>

    <template #trailing>
      <div class="flex items-center gap-1.5">
        <button
          class="relative flex h-8 w-8 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          title="Observações"
          @click="openObservation"
        >
          <BaseIcon name="chat" class="!size-4" />
          <span
            v-if="hasObservation"
            class="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-500"
          />
        </button>

        <button
          class="relative flex h-8 w-8 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          title="Anexos"
          @click="openAttachment"
        >
          <BaseIcon name="paper-clip" class="!size-4" />
          <span
            v-if="attachmentsCount > 0"
            class="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-700 text-[9px] font-bold text-white"
          >
            {{ attachmentsCount }}
          </span>
        </button>
      </div>
    </template>
  </CardRow>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import CardRow from '@/components/card/CardRow.vue';
import { useEventDayStore } from '@/modules/calendar/store/eventDay';

export default {
  components: { BaseIcon, CardRow },

  computed: {
    eventDayStore: () => useEventDayStore(),
    attachmentsCount() {
      return this.eventDayStore.eventDay.event?.attachmentsUrls?.length || 0;
    },
    hasObservation() {
      return !!this.eventDayStore.eventDay.event?.observation;
    }
  },

  methods: {
    eventTypes(type) {
      return { place: 'Presencial', remote: 'Remoto', hybrid: 'Híbrido' }[type] || '';
    },
    openObservation() {
      this.drawerStore.setDrawer({ title: 'Observação', context: 'scale-observation', open: true });
    },
    openAttachment() {
      this.drawerStore.setDrawer({ title: 'Anexos', context: 'scale-attachment', open: true });
    }
  }
};
</script>
