<template>
  <Drawer context="scale-observation">
    <div v-if="eventDayStore.eventDay.event.observation">
      {{ eventDayStore.eventDay.event.observation }}
    </div>
    <div v-else>
      <Empty
        title="Nenhum observação"
        description="foi adicionada a este evento"
      />
    </div>
  </Drawer>
</template>

<script>
import Drawer from '@/components/drawer/Drawer';
import Empty from '@/components/empty/Empty';
import { useEventDayStore } from '@/modules/calendar/store/eventDay';

export default {
  components: {
    Drawer,
    Empty
  },
  computed: {
    eventDayStore: () => useEventDayStore()
  }
};
</script>
