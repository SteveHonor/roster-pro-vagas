<template>
  <div ref="bell" class="relative">
    <!-- Bell button -->
    <button
      class="relative rounded-md p-1.5 text-slate-600 transition hover:bg-slate-100"
      title="Notificações"
      @click="toggle"
    >
      <BaseIcon :name="unreadCount > 0 ? 'BellAlert' : 'Bell'" class="!size-5" />
      <span
        v-if="unreadCount > 0"
        class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded px-1 bg-red-500 text-[9px] font-bold text-white leading-none"
      >
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="open"
        class="absolute right-0 top-full z-40 mt-1 w-72 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-100 px-3 py-2">
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Notificações</span>
          <button
            v-if="unreadCount > 0"
            class="text-[11px] font-medium text-slate-400 hover:text-slate-700"
            @click="markAllRead"
          >
            Marcar como lidas
          </button>
        </div>

        <!-- Lista -->
        <ul class="max-h-72 divide-y divide-slate-100 overflow-y-auto">
          <li v-if="!recent.length" class="px-3 py-6 text-center text-xs text-slate-400">
            Nenhuma notificação
          </li>

          <li
            v-for="n in recent"
            :key="n.id"
            class="flex cursor-pointer items-start gap-2.5 px-3 py-2.5 transition hover:bg-slate-50"
            :class="n.status === 'sent' ? 'bg-slate-50/60' : ''"
            @click="openNotification(n)"
          >
            <!-- Ícone pequeno com cor de origem -->
            <div
              class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded"
              :class="iconBg(n.origin)"
            >
              <BaseIcon :name="iconName(n.origin)" class="!size-3 text-white" />
            </div>

            <div class="min-w-0 flex-1">
              <p class="text-xs leading-snug text-slate-700" :class="n.status === 'sent' ? 'font-medium' : 'font-normal'">
                {{ n.message }}
              </p>
              <p class="mt-0.5 text-[10px] text-slate-400">{{ formatDate(n.notified_at || n.created_at) }}</p>
            </div>

            <!-- Dot não-lido -->
            <div v-if="n.status === 'sent'" class="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500" />
          </li>
        </ul>

        <!-- WhatsApp nudge: ativação (Essential+) ou upsell (Free) -->
        <div
          v-if="showWaNudge"
          class="flex items-center justify-between gap-2 border-t px-3 py-2"
          :class="canUseWhatsApp ? 'border-emerald-100 bg-emerald-50' : 'border-purple-100 bg-purple-50'"
        >
          <div class="flex items-center gap-1.5">
            <BaseIcon
              name="WhatsApp"
              class="!size-3.5 flex-shrink-0"
              :class="canUseWhatsApp ? 'text-emerald-500' : 'text-purple-400'"
            />
            <span
              class="text-[11px]"
              :class="canUseWhatsApp ? 'text-emerald-700' : 'text-purple-700'"
            >
              {{ canUseWhatsApp ? 'Receba avisos direto no WhatsApp' : 'WA disponível no Essential' }}
            </span>
          </div>
          <button
            class="flex-shrink-0 rounded px-2 py-0.5 text-[10px] font-bold text-white"
            :class="canUseWhatsApp ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-purple-500 hover:bg-purple-600'"
            @click="canUseWhatsApp ? activateWhatsApp() : planStore.setOpen('upgrade')"
          >
            {{ canUseWhatsApp ? 'Ativar' : 'Upgrade' }}
          </button>
        </div>

        <!-- Footer -->
        <div class="border-t border-slate-100 px-3 py-2">
          <button
            class="flex w-full items-center justify-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-700"
            @click="goToSettings"
          >
            <BaseIcon name="Cog" class="!size-3.5" />
            Configurar notificações
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import { useNotificationStore } from '@/components/notification/store';
import { useAuthStore } from '@/modules/auth/store';
import { usePlanStore } from '@/components/plan/store';
import { can } from '@/helper/can';

const WA_NUDGE_KEY = 'wa_bell_nudge_count';
const WA_NUDGE_MAX = 5;

export default {
  name: 'NotificationBell',
  components: { BaseIcon },
  data() {
    return { open: false };
  },
  computed: {
    notificationStore: () => useNotificationStore(),
    planStore: () => usePlanStore(),
    whatsappOptedIn: () => useAuthStore().whatsappOptedIn,
    canUseWhatsApp: () => can().canView('whatsapp'),
    showWaNudge() {
      if (this.whatsappOptedIn) return false;
      const count = parseInt(localStorage.getItem(WA_NUDGE_KEY) || '0', 10);
      return count < WA_NUDGE_MAX;
    },
    recent() {
      return [...this.notificationStore.notifications]
        .sort((a, b) => new Date(b.notified_at || b.created_at) - new Date(a.notified_at || a.created_at))
        .slice(0, 8);
    },
    unreadCount() {
      return this.notificationStore.notifications.filter(n => n.status === 'sent').length;
    }
  },
  mounted() {
    document.addEventListener('click', this.handleOutsideClick);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
  },
  methods: {
    toggle() {
      this.open = !this.open;
      if (this.open && this.showWaNudge) {
        const count = parseInt(localStorage.getItem(WA_NUDGE_KEY) || '0', 10);
        localStorage.setItem(WA_NUDGE_KEY, count + 1);
      }
    },
    handleOutsideClick(e) {
      if (this.$refs.bell && !this.$refs.bell.contains(e.target)) {
        this.open = false;
      }
    },
    async markAllRead() {
      await this.axios.patch('/notifications/read').catch(() => {});
      this.notificationStore.notifications.forEach(n => { n.status = 'read'; });
    },
    openNotification(n) {
      if (n.path) this.$router.push(n.path);
      this.open = false;
    },
    goToSettings() {
      this.$router.push({ path: '/settings', query: { tab: 'notifications' } });
      this.open = false;
    },
    activateWhatsApp() {
      this.$router.push({ path: '/settings', query: { tab: 'notifications', wa: '1' } });
      this.open = false;
    },
    iconName(origin) {
      const map = {
        vagas_application_created: 'Inbox',
        vagas_interview_scheduled: 'Calendar',
        vagas_offer_accepted:      'CheckCircle',
        vagas_offer_rejected:      'XMark',
        broadcast_message:         'Megaphone'
      };
      return map[origin] || 'Bell';
    },
    iconBg(origin) {
      const map = {
        vagas_application_created: 'bg-blue-500',
        vagas_interview_scheduled: 'bg-indigo-500',
        vagas_offer_accepted:      'bg-green-500',
        vagas_offer_rejected:      'bg-red-500',
        broadcast_message:         'bg-purple-500'
      };
      return map[origin] || 'bg-slate-400';
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      return this.moment(dateStr).fromNow();
    }
  }
};
</script>
