<template>
  <div class="flex shrink-0 items-center gap-2">
    <button
      class="relative flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600 transition hover:bg-slate-50"
      @click="openObservation"
    >
      <BaseIcon name="chat" class="!size-4" />
      <span>Observação</span>
      <span v-if="hasObservation" class="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
    </button>

    <button
      class="relative flex h-9 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600 transition hover:bg-slate-50"
      @click="openAttachment"
    >
      <BaseIcon name="paper-clip" class="!size-4" />
      <span>Anexos</span>
      <span
        v-if="attachmentsCount"
        class="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white"
      >{{ attachmentsCount }}</span>
    </button>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import { useEventDayStore } from '@/modules/calendar/store/eventDay';
import { useDrawerStore } from '@/components/drawer/store';

export default {
  components: { BaseIcon },
  computed: {
    eventDayStore: () => useEventDayStore(),
    drawerStore: () => useDrawerStore(),
    attachmentsCount() {
      return this.eventDayStore.eventDay?.event?.attachmentsUrls?.length || 0;
    },
    hasObservation() {
      return Boolean(this.eventDayStore.eventDay?.event?.observation);
    }
  },
  methods: {
    openObservation() {
      this.drawerStore.setDrawer({ title: 'Observação', context: 'scale-observation', open: true });
    },
    openAttachment() {
      this.drawerStore.setDrawer({ title: 'Anexos', context: 'scale-attachment', open: true });
    }
  }
};
</script>
