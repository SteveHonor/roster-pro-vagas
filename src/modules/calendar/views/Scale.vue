<template>
  <section>
    <!-- Skeleton inicial -->
    <div v-if="loading" class="animate-pulse space-y-4">
      <div class="flex items-center gap-3">
        <div class="h-8 w-28 rounded bg-slate-200"></div>
        <div class="h-6 w-48 rounded bg-slate-200"></div>
      </div>
      <div class="flex gap-2">
        <div class="h-9 w-32 rounded-full bg-slate-200"></div>
        <div class="h-9 w-32 rounded-full bg-slate-100"></div>
      </div>
      <SkeletonRows :rows="4" has-trailing />
    </div>

    <ScaleHeader v-else-if="eventDayStore.eventDay?.eventHours?.length" />

    <Tab
      v-if="!loading && eventDayStore.eventDay?.eventHours?.length"
      :tabs="hourTabs"
      :on-tab="handleTabChange"
      :to-back="() => $router.replace('/calendar')"
      :min-hight="false"
    >
      <template #tabs="{ isActive }">
        <div
          v-for="hour in eventDayStore.eventDay.eventHours"
          v-show="isActive(hour.id)"
          :key="hour.id"
        >
          <!-- Skeleton de posições -->
          <div v-if="loadingPositions" class="space-y-3">
            <SkeletonRows :rows="2" has-trailing />
            <SkeletonRows :rows="3" has-trailing />
          </div>

          <!-- Conteúdo: equipes + posições -->
          <div v-else class="-m-4 rounded-md bg-slate-50">

            <!-- Área scrollável -->
            <div class="p-4 space-y-6 pb-2">
              <template v-for="team in scaleStore.teams" :key="team.id">
                <div v-if="scaleStore.getPositionsForTeam(team.id).length">
                  <!-- Header de equipe estilo Linear -->
                  <div class="mb-3 flex items-center gap-3">
                    <span class="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                      {{ team.name }}
                    </span>
                    <div class="h-px flex-1 bg-slate-200" />
                    <span class="text-[11px] text-slate-400">
                      {{ scaleStore.getPositionsForTeam(team.id).length }}
                      posição{{ scaleStore.getPositionsForTeam(team.id).length > 1 ? 'ões' : '' }}
                    </span>
                  </div>

                  <!-- Cards de posição -->
                  <div class="space-y-2">
                    <PositionCard
                      v-for="position in scaleStore.getPositionsForTeam(team.id)"
                      :key="position.id"
                      :position="position"
                      :team="team"
                      :scaled-users="scaleStore.getSchedulesForPosition(team.id, position.id)"
                      :duplicate-users="duplicateUsersInCurrentHour"
                      @add="openAddDrawer(team, position)"
                      @remove="handleRemoveUser($event, team, position)"
                    />
                  </div>
                </div>
              </template>

              <!-- Sem equipes -->
              <Empty
                v-if="!scaleStore.teams.length"
                title="Nenhuma equipe encontrada"
                description="Vá para Cadastros > Equipes para configurar suas equipes."
                class="w-full"
              />
            </div>

            <!-- Footer sticky: publicar turno -->
            <div class="sticky bottom-0 z-10 flex items-center justify-end gap-3 rounded-b-md border-t border-slate-200 bg-slate-50 px-4 py-3 shadow-[0_-2px_8px_0_rgba(0,0,0,0.06)]">
              <span v-if="stagedCountForCurrentHour > 0" class="text-xs text-slate-400">
                {{ stagedCountForCurrentHour }} colaborador{{ stagedCountForCurrentHour > 1 ? 'es' : '' }} aguardando publicação
              </span>
              <button
                class="inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition"
                :class="hasStagedForCurrentHour
                  ? 'bg-slate-900 text-white hover:bg-slate-700'
                  : 'cursor-not-allowed bg-slate-100 text-slate-400'"
                :disabled="!hasStagedForCurrentHour"
                @click="save"
              >
                <BaseIcon name="Play" class="!size-4" />
                Publicar {{ currentHourLabel }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </Tab>

    <!-- Drawers -->
    <ScaleObservation />
    <ScaleAttachment />
    <ScaleChange @save="fetchSchedules(scaleStore.current.hour)" />
    <FormReason />
    <AddCollaboratorDrawer />
  </section>
</template>

<script>
import Tab from '@/components/tab/Tab';
import Empty from '@/components/empty/Empty';
import BaseIcon from '@/components/icons/BaseIcon';
import SkeletonRows from '@/components/skeleton/SkeletonRows';

import ScaleHeader from '@/modules/calendar/components/scale/ScaleHeader';
import ScaleObservation from '@/modules/calendar/components/scale/Observation';
import ScaleAttachment from '@/modules/calendar/components/scale/Attachment';
import ScaleChange from '@/modules/calendar/components/scale/ScaleChange';
import FormReason from '@/modules/requests/drawer/FormReason';
import PositionCard from '@/modules/calendar/components/scale/PositionCard';
import AddCollaboratorDrawer from '@/modules/calendar/components/scale/AddCollaboratorDrawer';

import { useEventDayStore } from '@/modules/calendar/store/eventDay';
import { useScaleStore } from '@/modules/calendar/store/scale';
import { useDrawerStore } from '@/components/drawer/store';

export default {
  components: {
    Tab,
    Empty,
    BaseIcon,
    SkeletonRows,
    ScaleHeader,
    ScaleObservation,
    ScaleAttachment,
    ScaleChange,
    FormReason,
    PositionCard,
    AddCollaboratorDrawer
  },

  data() {
    return {
      loading: true,
      loadingPositions: false,
      hourStatuses: {},
      pollingInterval: null
    };
  },

  computed: {
    eventDayStore: () => useEventDayStore(),
    scaleStore: () => useScaleStore(),
    drawerStore: () => useDrawerStore(),

    hasPendingChanges() {
      const schedules = Array.isArray(this.scaleStore.schedules) ? this.scaleStore.schedules : [];
      return schedules.some(s => s.status === 'change_request_admin' || s.status === 'pending');
    },

    blockReasonDrawerOpen() {
      return this.drawerStore.drawer?.['block-reason']?.open || false;
    },

    hourTabs() {
      return (
        this.eventDayStore.eventDay?.eventHours?.map(hour => ({
          name: `${hour.startTime}–${hour.endTime}`,
          key: hour.id,
          icon: 'Clock',
          hour,
          status: this.hourStatuses[hour.id] ?? null
        })) || []
      );
    },

    hasStagedForCurrentHour() {
      const hourId = this.scaleStore.current.hour?.id;
      if (!hourId) return false;
      return Object.values(this.scaleStore.scales).some(teamScales => {
        const hourScales = teamScales[hourId];
        return hourScales && Object.values(hourScales).some(users => users.length > 0);
      });
    },

    stagedCountForCurrentHour() {
      const hourId = this.scaleStore.current.hour?.id;
      if (!hourId) return 0;
      return Object.values(this.scaleStore.scales).reduce((total, teamScales) => {
        const hourScales = teamScales[hourId] || {};
        return total + Object.values(hourScales).reduce((t, users) => t + users.length, 0);
      }, 0);
    },

    currentHourLabel() {
      const hour = this.scaleStore.current.hour;
      return hour ? `${hour.startTime}–${hour.endTime}` : '';
    },

    duplicateUsersInCurrentHour() {
      const counts = {};
      this.scaleStore.teams.forEach(team => {
        this.scaleStore.getPositionsForTeam(team.id).forEach(position => {
          this.scaleStore.getSchedulesForPosition(team.id, position.id).forEach(user => {
            counts[user.id] = (counts[user.id] || 0) + 1;
          });
        });
      });
      return new Set(Object.keys(counts).filter(id => counts[id] > 1));
    }
  },

  watch: {
    blockReasonDrawerOpen(isOpen) {
      if (!isOpen && this.scaleStore.current.hour?.id) {
        this.fetchSchedules(this.scaleStore.current.hour);
      }
    },
    hasPendingChanges(val) {
      if (val) this.startPolling();
      else this.stopPolling();
    }
  },

  async mounted() {
    this.scaleStore.sendScales = false;
    try {
      await this.getEvents();
      await this.fetchTeams();
      this.prefetchHourStatuses();
    } finally {
      this.loading = false;
    }
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  },

  beforeUnmount() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    this.stopPolling();
    this.scaleStore.clearData();
  },

  methods: {
    async getEvents() {
      this.eventDayStore.setEventDay({});
      await this.axios.get(`events/${this.$route.params.id}`).then(response => {
        this.eventDayStore.setEventDay(response);
      });
    },

    async fetchTeams() {
      this.scaleStore.teams = await this.axios.get('/teams/users');
    },

    async fetchSchedules(hour) {
      if (!hour?.id) return;
      await this.scaleStore.fetchSchedules(
        this.axios,
        this.eventDayStore.eventDay.event.id,
        hour.id
      );
    },

    async prefetchHourStatuses() {
      const eventId = this.eventDayStore.eventDay?.event?.id;
      const hours = this.eventDayStore.eventDay?.eventHours;
      if (!eventId || !hours?.length) return;

      const results = await Promise.all(
        hours.map(hour =>
          this.axios
            .get(`/schedule_items/${eventId}/schedules/${hour.id}`)
            .then(response => ({ hourId: hour.id, schedules: response || [] }))
            .catch(() => ({ hourId: hour.id, schedules: [] }))
        )
      );

      const statuses = {};
      results.forEach(({ hourId, schedules }) => {
        if (!schedules.length) {
          statuses[hourId] = 'empty';
        } else if (schedules.some(s => s.status === 'pending' || s.status === 'change_request_admin')) {
          statuses[hourId] = 'pending';
        } else if (schedules.some(s => s.status === 'declined' || s.status === 'blocked')) {
          statuses[hourId] = 'attention';
        } else {
          statuses[hourId] = 'done';
        }
      });
      this.hourStatuses = statuses;
    },

    async handleTabChange(tab) {
      this.scaleStore.setHour(tab.hour);
      this.loadingPositions = true;
      try {
        await Promise.all([
          this.scaleStore.fetchSchedules(
            this.axios,
            this.eventDayStore.eventDay.event.id,
            tab.hour.id
          ),
          this.scaleStore.fetchAllPositions(
            this.axios,
            this.eventDayStore.eventDay.eventDayId
          )
        ]);
      } finally {
        this.loadingPositions = false;
      }
    },

    openAddDrawer(team, position) {
      this.scaleStore.setTeam(team);
      this.scaleStore.current.position = position;
      this.drawerStore.setDrawer({
        title: `Adicionar — ${position.name}`,
        context: 'add-collaborator',
        open: true,
        size: 'medium'
      });
    },

    handleRemoveUser(user, team, position) {
      this.scaleStore.setTeam(team);
      this.scaleStore.current.position = position;
      this.scaleStore.restoreUserToPosition(user);
      this.scaleStore.removeScale(user);
    },

    async save() {
      const hourId = this.scaleStore.current.hour?.id;
      this.confirmationStore.setConfirmation({
        title: `Publicar turno ${this.currentHourLabel}?`,
        open: true,
        onConfirm: async () => {
          await this.axios
            .post(`/events/${this.eventDayStore.eventDay.event.id}/schedules`, {
              schedule: this.scaleStore.getScaleBuilded(hourId)
            })
            .then(async () => {
              this.confirmationStore.close();
              this.scaleStore.clearHourScales(hourId);
              await this.scaleStore.fetchSchedules(
                this.axios,
                this.eventDayStore.eventDay.event.id,
                hourId
              );
              this.prefetchHourStatuses();
            });
        }
      });
    },

    startPolling() {
      if (this.pollingInterval) return;
      this.pollingInterval = setInterval(() => {
        if (!document.hidden && this.scaleStore.current.hour?.id) {
          this.fetchSchedules(this.scaleStore.current.hour);
        }
      }, 10000);
    },

    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    },

    handleVisibilityChange() {
      if (!document.hidden && this.scaleStore.current.hour?.id) {
        this.fetchSchedules(this.scaleStore.current.hour);
        this.prefetchHourStatuses();
      }
    }
  }
};
</script>
