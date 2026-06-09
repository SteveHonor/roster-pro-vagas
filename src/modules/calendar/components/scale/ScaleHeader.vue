<template>
  <div class="mb-6 flex items-center justify-between gap-4 border-b pb-4">
    <!-- Data + Título -->
    <div class="flex min-w-0 items-center gap-3">
      <span class="flex shrink-0 items-center gap-2 rounded bg-white px-3 py-1.5 text-sm font-extrabold text-gray-600 border border-slate-200">
        <BaseIcon name="calendar" class="!size-4" />
        {{ moment(eventDayStore.eventDay.date).format('DD/MM/YYYY') }}
      </span>
      <div class="hidden h-6 border-l border-slate-200 sm:block" />
      <div class="min-w-0">
        <h2 class="truncate text-lg font-semibold uppercase text-blue-700">
          {{ eventDayStore.eventDay.event.name }}
        </h2>
        <p
          v-if="['place', 'hybrid'].includes(eventDayStore.eventDay.event?.type)"
          class="truncate text-xs text-gray-500 capitalize"
        >
          {{ eventDayStore.eventDay.event?.place }}
        </p>
      </div>
    </div>

    <!-- Ações -->
    <ScaleTabActions />
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import ScaleTabActions from './ScaleTabActions.vue';
import { useEventDayStore } from '@/modules/calendar/store/eventDay';

export default {
  components: { BaseIcon, ScaleTabActions },
  computed: {
    eventDayStore: () => useEventDayStore()
  }
};
</script>
