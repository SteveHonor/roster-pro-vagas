<template>
  <Tab :tabs="handleTabs()">
    <template #header>
      <MonthlyRenewalBanner @cloned="onCloned" />
      <PlanLimitBanner v-if="eventLimitNear" resource="events" />
    </template>
    <template #tabs="{ isActive }">
      <div v-if="isActive('scales')">
        <ScheduleList />
      </div>
      <div v-if="isActive('events')">
        <EventList />
      </div>
      <div v-if="isActive('history')">
        <EventHistory />
      </div>
      <div v-if="isActive('broadcasts')">
        <Broadcasts />
      </div>
    </template>
  </Tab>
</template>

<script>
import Tab from '@/components/tab/Tab';
import PlanLimitBanner from '@/components/plan/PlanLimitBanner';
import MonthlyRenewalBanner from '@/components/plan/MonthlyRenewalBanner';
import EventList from '@/modules/calendar/views/lists/event/List';
import ScheduleList from '@/modules/calendar/views/lists/schedule/List';
import EventHistory from '@/modules/calendar/views/lists/event/History';
import Broadcasts from '@/modules/calendar/views/Broadcasts';
import { useAuthStore } from '@/modules/auth/store';
import { usePlanStore } from '@/components/plan/store';

export default {
  components: { Tab, EventList, ScheduleList, EventHistory, Broadcasts, PlanLimitBanner, MonthlyRenewalBanner },

  data() {
    return { pendingReportsCount: 0 };
  },

  computed: {
    authStore: () => useAuthStore(),
    planStore: () => usePlanStore(),
    eventLimitNear() {
      const l = this.planStore.limits?.events;
      if (!l || !l.max) return false;
      return this.$can.canAccess('admin') && (l.used / l.max) >= 0.8;
    }
  },

  async mounted() {
    if (this.$can.canAccess('operator')) {
      try {
        const data = await this.axios.get('events/pending_reports_count');
        this.pendingReportsCount = data.count || 0;
      } catch { /* silently ignore */ }
    }
  },

  methods: {
    handleTabs() {
      const tabs = {
        events: { name: 'Agenda',        key: 'events',    icon: 'calendar'     },
        scales: { name: 'Minhas Escalas', key: 'scales',    icon: 'rocket'       },
        history: {
          name:  'Pós-Evento',
          key:   'history',
          icon:  'archive-box',
          badge: this.$can.canAccess('operator') && this.pendingReportsCount > 0
            ? this.pendingReportsCount
            : undefined
        },
        broadcasts: { name: 'Comunicados', key: 'broadcasts', icon: 'megaphone' }
      };

      const orderedTabs = this.$can.canAccess('admin')
        ? ['events', 'scales']
        : ['scales', 'events'];

      return [
        ...orderedTabs.map(key => tabs[key]),
        tabs.history,
        this.$can.canAccess('operator') && tabs.broadcasts
      ].filter(Boolean);
    },

    onCloned({ cloned }) {
      if (cloned > 0) this.$router.go(0);
    }
  }
};
</script>
