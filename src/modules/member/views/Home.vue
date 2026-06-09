<template>
  <div class="space-y-4 pb-6">

    <!-- Toast WhatsApp (flutuante, 1x por dia) -->
    <Transition name="wa-toast">
      <div
        v-if="showWaToast"
        class="fixed left-4 right-4 top-4 z-50 flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow-xl ring-1 ring-black/5"
      >
        <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-emerald-500">
          <BaseIcon name="WhatsApp" class="!size-4 text-white" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-slate-800">Ative o WhatsApp</p>
          <p class="text-xs text-slate-500">Confirme escalas em 1 toque, sem abrir o app.</p>
        </div>
        <div class="flex flex-shrink-0 items-center gap-1">
          <button
            class="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white active:bg-emerald-600"
            @click="toastActivate"
          >
            Ativar
          </button>
          <button class="rounded-md p-1.5 text-slate-300 active:text-slate-500" @click="dismissToast">
            <BaseIcon name="XMark" class="!size-3.5" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- Hero greeting -->
    <div class="px-4 pt-5 pb-1">
      <p v-if="orgName" class="mb-1 flex items-center gap-1 text-xs text-slate-400">
        <BaseIcon name="Company" class="!size-3" />
        {{ orgName }}
      </p>
      <h1 class="text-2xl font-bold text-slate-800">
        Olá, <span :style="{ color: 'var(--brand-primary, #6366f1)' }">{{ firstName }}</span> 👋
      </h1>
      <div class="mt-2.5 flex flex-wrap items-center gap-1.5">
        <div
          v-if="kpis[0].value > 0"
          class="flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1"
        >
          <BaseIcon name="Calendar" class="!size-3 text-indigo-500" />
          <span class="text-xs font-medium text-indigo-700">{{ kpis[0].value }} este mês</span>
        </div>
        <div
          v-if="kpis[2].value !== '–'"
          class="flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1"
        >
          <BaseIcon name="Star" class="!size-3 text-amber-500" />
          <span class="text-xs font-medium text-amber-700">Nota {{ kpis[2].value }}</span>
        </div>
        <div
          v-if="pendingCount > 0"
          class="flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-2.5 py-1"
        >
          <span class="relative flex h-1.5 w-1.5 flex-shrink-0">
            <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
          </span>
          <span class="text-xs font-medium text-red-700">{{ pendingCount }} pendente{{ pendingCount !== 1 ? 's' : '' }}</span>
        </div>
        <div
          v-if="!loading && kpis[0].value === 0 && kpis[2].value === '–' && pendingCount === 0"
          class="flex items-center gap-1 rounded-full border border-green-100 bg-green-50 px-2.5 py-1"
        >
          <BaseIcon name="Check" class="!size-3 text-green-500" />
          <span class="text-xs font-medium text-green-700">Tudo em dia</span>
        </div>
      </div>
    </div>

    <!-- WhatsApp activation nudge -->
    <div
      v-if="showWaBanner"
      class="mx-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3"
    >
      <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-emerald-500">
        <BaseIcon name="WhatsApp" class="!size-4 text-white" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-emerald-900">Ative notificações no WhatsApp</p>
        <p class="text-xs leading-snug text-emerald-700">Confirme escalas em 1 toque e receba lembretes direto no celular.</p>
      </div>
      <div class="flex flex-shrink-0 items-center gap-1">
        <button
          class="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white active:bg-emerald-600"
          @click="goActivateWa"
        >
          Ativar
        </button>
        <button class="rounded-md p-1.5 text-emerald-400" @click="dismissWaBanner">
          <BaseIcon name="XMark" class="!size-3.5" />
        </button>
      </div>
    </div>

    <!-- Push notification opt-in -->
    <div
      v-if="showPushBanner"
      class="mx-4 flex items-center gap-3 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3"
    >
      <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-indigo-500">
        <BaseIcon name="Bell" class="!size-4 text-white" />
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-indigo-900">Ative as notificações</p>
        <p class="text-xs leading-snug text-indigo-700">Receba alertas mesmo com o app fechado.</p>
      </div>
      <div class="flex flex-shrink-0 items-center gap-1">
        <button
          class="rounded-md bg-indigo-500 px-3 py-1.5 text-xs font-bold text-white active:bg-indigo-600"
          :disabled="pushLoading"
          @click="activatePush"
        >
          {{ pushLoading ? '...' : 'Ativar' }}
        </button>
        <button class="rounded-md p-1.5 text-indigo-300" @click="dismissPushBanner">
          <BaseIcon name="XMark" class="!size-3.5" />
        </button>
      </div>
    </div>

    <!-- KPI grid 2x2 -->
    <div class="grid grid-cols-2 gap-3 px-4">
      <div
        v-for="kpi in kpis"
        :key="kpi.label"
        class="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4"
      >
        <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md" :class="kpi.iconBg">
          <BaseIcon :name="kpi.icon" class="!size-4" :class="kpi.iconColor" />
        </div>
        <div class="min-w-0 flex-1">
          <template v-if="loading">
            <div class="mb-1 h-3 w-12 animate-pulse rounded bg-slate-100" />
            <div class="h-5 w-8 animate-pulse rounded bg-slate-100" />
            <div class="mt-1 h-2.5 w-16 animate-pulse rounded bg-slate-100" />
          </template>
          <template v-else>
            <p class="mb-1 text-xs leading-none text-slate-400">{{ kpi.label }}</p>
            <p class="text-xl font-bold leading-none" :class="kpi.valueColor">{{ kpi.value }}</p>
            <p class="mt-1 text-[11px] leading-snug text-slate-400">{{ kpi.description }}</p>
          </template>
        </div>
      </div>
    </div>

    <!-- Escalas pendentes CTA -->
    <div
      v-if="pendingCount > 0"
      class="mx-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
    >
      <div class="flex items-center gap-2.5">
        <span class="relative flex h-2 w-2 flex-shrink-0">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span class="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </span>
        <p class="text-sm font-medium text-amber-800">
          <strong class="font-bold">{{ pendingCount }}</strong>
          {{ pendingCount !== 1 ? 'escalas aguardando' : 'escala aguardando' }}
        </p>
      </div>
      <router-link
        to="/member/scales"
        class="flex-shrink-0 rounded-md bg-amber-500 px-3 py-1.5 text-xs font-bold text-white"
      >
        Responder
      </router-link>
    </div>

    <!-- Comunicado ativo -->
    <div v-if="activeBroadcast" class="mx-4 flex gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div class="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-indigo-50">
        <BaseIcon name="Megaphone" class="!size-4 text-indigo-500" />
      </div>
      <div class="min-w-0 flex-1">
        <div class="mb-1.5 flex items-center justify-between gap-2">
          <span class="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Comunicado</span>
          <span class="flex-shrink-0 text-[11px] text-slate-400">{{ formatDate(activeBroadcast.visibleUntil) }}</span>
        </div>
        <p class="text-sm font-medium leading-snug text-slate-800">{{ activeBroadcast.content }}</p>
        <p class="mt-2 text-[11px] text-slate-400">— <strong class="font-semibold text-slate-500">{{ activeBroadcast.senderName }}</strong></p>
      </div>
    </div>

    <!-- Próximas escalas -->
    <div class="px-4">
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-800">Próximas escalas</h2>
        <router-link to="/member/scales" class="flex items-center gap-1 text-xs text-indigo-500 hover:underline">
          Ver tudo
          <BaseIcon name="ChevronRight" class="!size-3" />
        </router-link>
      </div>

      <!-- Skeleton -->
      <div v-if="loading" class="space-y-2">
        <div v-for="i in 3" :key="i" class="h-[68px] animate-pulse rounded-lg border border-slate-200 bg-white" />
      </div>

      <!-- Lista -->
      <div v-else-if="upcoming.length" class="space-y-2">
        <div
          v-for="item in upcoming"
          :key="item.id"
          class="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3"
        >
          <!-- Data box -->
          <div
            class="flex w-11 flex-shrink-0 flex-col items-center rounded-md py-1.5"
            :class="dateBg(item.mySchedule?.status)"
          >
            <span class="text-base font-bold leading-none" :class="dateTxt(item.mySchedule?.status)">
              {{ formatDay(item.eventDay?.date) }}
            </span>
            <span class="mt-0.5 text-[9px] font-bold uppercase tracking-wide" :class="dateTxt(item.mySchedule?.status)">
              {{ formatMonth(item.eventDay?.date) }}
            </span>
          </div>

          <!-- Info -->
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold capitalize text-slate-800">{{ item.event?.name }}</p>
            <div class="mt-0.5 flex flex-wrap items-center gap-1.5">
              <span class="flex items-center gap-1 text-[11px] text-slate-400">
                <BaseIcon name="Clock" class="!size-3" />
                {{ item.eventHour?.startTime }}–{{ item.eventHour?.endTime }}
              </span>
              <span v-if="item.mySchedule?.position" class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                {{ item.mySchedule.position.name }}
              </span>
            </div>
          </div>

          <!-- Status -->
          <span :class="['inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold', statusPill(item.mySchedule?.status).class]">
            <BaseIcon :name="statusPill(item.mySchedule?.status).icon" class="!size-2.5" />
            {{ statusPill(item.mySchedule?.status).label }}
          </span>
        </div>
      </div>

      <!-- Empty -->
      <div v-else class="rounded-lg border border-slate-200 bg-white p-8 text-center">
        <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100">
          <BaseIcon name="Calendar" class="!size-6 text-slate-300" />
        </div>
        <p class="text-sm font-semibold text-slate-500">Nenhuma escala futura</p>
        <p class="mt-1 text-xs text-slate-400">Você verá suas próximas escalas aqui</p>
      </div>
    </div>

  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import { useAuthStore } from '@/modules/auth/store';
import { useCompanyStore } from '@/modules/users/store/company';
import { useMemberStore } from '@/modules/member/store';
import { can } from '@/helper/can';
import { isPushSupported, isPushGranted, isPushDenied, subscribe as subscribePush } from '@/services/pushNotifications';

const WA_MEMBER_BANNER_KEY  = 'wa_member_banner_dismissed';
const WA_TOAST_DATE_KEY     = 'wa_toast_last_shown';
const PUSH_BANNER_KEY       = 'push_banner_dismissed';

export default {
  components: { BaseIcon },

  data() {
    return {
      loading: true,
      broadcasts: [],
      waBannerDismissed:  !!localStorage.getItem(WA_MEMBER_BANNER_KEY),
      waToastVisible:     false,
      waToastTimer:       null,
      pushBannerDismissed: !!localStorage.getItem(PUSH_BANNER_KEY),
      pushLoading:        false,
      pushGranted:        isPushGranted()
    };
  },

  computed: {
    authStore() {
      return useAuthStore();
    },
    companyStore() {
      return useCompanyStore();
    },
    memberStore() {
      return useMemberStore();
    },

    whatsappOptedIn() { return useAuthStore().whatsappOptedIn; },
    canUseWhatsApp()  { return can().canView('whatsapp'); },
    showWaBanner() {
      return this.canUseWhatsApp && !this.whatsappOptedIn && !this.waBannerDismissed;
    },
    showWaToast() {
      return this.canUseWhatsApp && !this.whatsappOptedIn && this.waToastVisible;
    },
    showPushBanner() {
      return isPushSupported() &&
        !isPushDenied() &&
        !this.pushGranted &&
        !this.pushBannerDismissed;
    },

    firstName() {
      const name = this.authStore.me?.name || '';
      return name.trim().split(/\s+/)[0] || '';
    },

    orgName() {
      return this.companyStore?.getChosenCompany?.name || '';
    },

    pendingCount() {
      return this.memberStore.pendingCount || 0;
    },

    kpis() {
      const schedules = Array.isArray(this.memberStore.upcomingSchedules)
        ? this.memberStore.upcomingSchedules
        : [];

      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();

      const thisMonth = schedules.filter(s => {
        try {
          const d = new Date(s.eventDay?.date);
          return d.getMonth() === month && d.getFullYear() === year;
        } catch { return false; }
      }).length;

      const confirmed = schedules.filter(s => s.mySchedule?.status === 'accepted').length;
      const rating = this.authStore.me?.averageRating;
      const hasPending = this.pendingCount > 0;

      return [
        {
          label: 'Escalas',
          value: thisMonth,
          description: 'este mês',
          icon: 'Calendar',
          iconBg: 'bg-indigo-50',
          iconColor: 'text-indigo-500',
          valueColor: 'text-slate-800'
        },
        {
          label: 'Confirmadas',
          value: confirmed,
          description: 'no total',
          icon: 'Check',
          iconBg: 'bg-green-50',
          iconColor: 'text-green-500',
          valueColor: 'text-green-600'
        },
        {
          label: 'Avaliação',
          value: rating ? Number(rating).toFixed(1) : '–',
          description: 'nota média',
          icon: 'Star',
          iconBg: 'bg-amber-50',
          iconColor: 'text-amber-500',
          valueColor: 'text-amber-600'
        },
        {
          label: 'Pendentes',
          value: this.pendingCount,
          description: 'aguardando resposta',
          icon: 'Clock',
          iconBg: hasPending ? 'bg-red-50' : 'bg-slate-50',
          iconColor: hasPending ? 'text-red-400' : 'text-slate-300',
          valueColor: hasPending ? 'text-red-500' : 'text-slate-300'
        }
      ];
    },

    upcoming() {
      const schedules = Array.isArray(this.memberStore.upcomingSchedules)
        ? this.memberStore.upcomingSchedules
        : [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return schedules
        .filter(item => {
          try {
            return item.eventDay?.date && new Date(item.eventDay.date) >= today;
          } catch { return false; }
        })
        .slice(0, 4);
    },

    activeBroadcast() {
      if (!Array.isArray(this.broadcasts)) return null;
      const now = new Date();
      return this.broadcasts.find(m => {
        try { return new Date(m.visibleUntil) > now; } catch { return false; }
      }) || null;
    }
  },

  async mounted() {
    try {
      const userId = this.authStore.user?.id;
      await Promise.allSettled([
        this.memberStore.fetchHome(this.axios, userId),
        this.memberStore.fetchPendingCount(this.axios, userId),
        this.fetchBroadcasts()
      ]);
    } catch (_e) {
      // silently continue even if data fails
    } finally {
      this.loading = false;
    }

    this.maybeShowToast();
  },

  beforeUnmount() {
    clearTimeout(this.waToastTimer);
  },

  methods: {
    maybeShowToast() {
      if (!this.canUseWhatsApp || this.whatsappOptedIn) return;
      const today = new Date().toISOString().slice(0, 10);
      if (localStorage.getItem(WA_TOAST_DATE_KEY) === today) return;
      this.waToastVisible = true;
      this.waToastTimer = setTimeout(() => { this.waToastVisible = false; }, 8000);
    },
    dismissToast() {
      clearTimeout(this.waToastTimer);
      this.waToastVisible = false;
      localStorage.setItem(WA_TOAST_DATE_KEY, new Date().toISOString().slice(0, 10));
    },
    toastActivate() {
      this.dismissToast();
      this.$router.push({ path: '/member/notifications', query: { wa: '1' } });
    },
    goActivateWa() {
      this.$router.push({ path: '/member/notifications', query: { wa: '1' } });
    },
    dismissWaBanner() {
      localStorage.setItem(WA_MEMBER_BANNER_KEY, '1');
      this.waBannerDismissed = true;
    },
    async activatePush() {
      this.pushLoading = true;
      try {
        const sub = await subscribePush(this.axios);
        if (sub) {
          this.pushGranted = true;
          this.pushBannerDismissed = true;
        } else if (isPushDenied()) {
          this.pushBannerDismissed = true;
          localStorage.setItem(PUSH_BANNER_KEY, '1');
        }
      } catch (_e) {
        console.error('[Push] subscribe failed', _e);
      } finally {
        this.pushLoading = false;
      }
    },
    dismissPushBanner() {
      localStorage.setItem(PUSH_BANNER_KEY, '1');
      this.pushBannerDismissed = true;
    },

    async fetchBroadcasts() {
      try {
        const res = await this.axios.get('broadcast_messages');
        this.broadcasts = Array.isArray(res) ? res : [];
      } catch { /* ignore */ }
    },

    formatDay(date) {
      try {
        return new Date(date).getDate().toString().padStart(2, '0');
      } catch { return '–'; }
    },
    formatMonth(date) {
      try {
        return new Date(date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
      } catch { return ''; }
    },
    formatDate(date) {
      try {
        return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      } catch { return ''; }
    },

    dateBg(status) {
      const map = {
        pending: 'bg-amber-50',
        accepted: 'bg-green-50',
        declined: 'bg-red-50'
      };
      return map[status] || 'bg-slate-50';
    },
    dateTxt(status) {
      const map = {
        pending: 'text-amber-600',
        accepted: 'text-green-600',
        declined: 'text-red-500'
      };
      return map[status] || 'text-slate-600';
    },

    statusPill(status) {
      const map = {
        pending:              { label: 'Pendente',    icon: 'Clock',     class: 'bg-amber-100 text-amber-700' },
        accepted:             { label: 'Confirmado',  icon: 'Check',     class: 'bg-green-100 text-green-700' },
        declined:             { label: 'Recusado',    icon: 'XMark',     class: 'bg-red-100 text-red-600' },
        blocked:              { label: 'Ausência',    icon: 'Clock',     class: 'bg-amber-100 text-amber-700' },
        change_request_admin: { label: 'Troca',       icon: 'ArrowPath', class: 'bg-amber-100 text-amber-700' },
        rescheduled:          { label: 'Substituído', icon: 'ArrowPath', class: 'bg-slate-100 text-slate-500' }
      };
      return map[status] || { label: 'Auto', icon: 'Check', class: 'bg-green-100 text-green-700' };
    }
  }
};
</script>

<style scoped>
.wa-toast-enter-active { transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
.wa-toast-leave-active { transition: all 0.2s ease-in; }
.wa-toast-enter-from,
.wa-toast-leave-to    { opacity: 0; transform: translateY(-20px); }
</style>
