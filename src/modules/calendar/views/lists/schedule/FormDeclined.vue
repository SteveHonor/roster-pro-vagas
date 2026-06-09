<template>
  <Drawer
    context="reasonScheduleDeclined"
    :on-save="declined"
    confirm-label="Recusar Escala"
  >
    <div class="space-y-5">
      <div class="rounded-md border border-blue-100 bg-blue-50 p-4">
        <p class="mb-3 text-sm text-blue-800">
          Mesmo que não consiga colaborar na data informada, se puder em outro dia você pode simplesmente solicitar uma troca de escala:
        </p>
        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          :style="{ background: 'var(--brand-primary)' }"
          @click="changeSchedule()"
        >
          <BaseIcon name="ArrowPath" class="!size-3.5" />
          Solicitar troca de escala
        </button>
      </div>

      <div>
        <p class="mb-1.5 text-sm text-gray-600">
          Se ainda quiser seguir com o cancelamento, descreva o motivo:
        </p>
        <Textarea
          v-model="reason"
          :rows="4"
          placeholder="Ex: problema de saúde, compromisso inadiável..."
        />
      </div>

      <p class="text-center text-xs font-medium text-orange-600">
        Lembrete: essa ação é irreversível
      </p>
    </div>
  </Drawer>
</template>

<script>
import Drawer from '@/components/drawer/Drawer.vue';
import BaseIcon from '@/components/icons/BaseIcon';
import Textarea from '@/components/form/Textarea';
import { useScheduleStore } from '@/modules/calendar/store/schedule';
import { useAuthStore } from '@/modules/auth/store';

export default {
  components: {
    Drawer,
    BaseIcon,
    Textarea
  },
  data() {
    return {
      reason: ''
    };
  },
  computed: {
    scheduleStore: () => useScheduleStore(),
    authStore: () => useAuthStore()
  },
  methods: {
    async declined() {
      try {
        await this.axios
          .patch(
            `schedule_items/${this.scheduleStore?.getSchedule.mySchedule.id}/respond`,
            {
              status: 'declined',
              userId: this.authStore.user.id,
              date: this.scheduleStore.schedule.eventDay.date,
              reason: this.reason
            }
          )
          .then(() => {
            this.drawerStore.close();
          });
      } catch (error) {
        console.log(error);
      }
    },
    changeSchedule() {
      this.drawerStore.close();

      this.drawerStore.setDrawer({
        title: 'Solicitar troca de escala',
        context: 'changeSchedule',
        open: true
      });
    }
  }
};
</script>
