<template>
  <Drawer context="add-collaborator" action-close-name="Fechar">
    <ListToScale :schedules="schedules" :schedule-item-id="scheduleItemId" @all-scaled="close" />
  </Drawer>
</template>

<script>
import Drawer from '@/components/drawer/Drawer';
import ListToScale from '@/modules/calendar/components/scale/ListToScale';
import { useScaleStore } from '@/modules/calendar/store/scale';
import { useDrawerStore } from '@/components/drawer/store';

export default {
  name: 'AddCollaboratorDrawer',
  components: { Drawer, ListToScale },
  computed: {
    scaleStore: () => useScaleStore(),
    drawerStore: () => useDrawerStore(),
    schedules() {
      const teamId = this.scaleStore.current.team?.id;
      const positionId = this.scaleStore.current.position?.id;
      if (!teamId || !positionId) return { present: 0, schedules: [] };
      const list = this.scaleStore.getSchedulesForPosition(teamId, positionId);
      return { present: list.length, schedules: list };
    },
    scheduleItemId() {
      const teamId = this.scaleStore.current.team?.id;
      const positionId = this.scaleStore.current.position?.id;
      if (!teamId || !positionId) return null;
      return (
        this.scaleStore.getSchedulesForPosition(teamId, positionId)
          .find(s => s.scheduleItemId)?.scheduleItemId || null
      );
    }
  },
  methods: {
    close() {
      this.drawerStore.close();
    }
  }
};
</script>
