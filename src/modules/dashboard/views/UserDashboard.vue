<template>
  <div class="space-y-6">

    <!-- Header pessoal -->
    <div class="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div class="flex flex-wrap items-center gap-x-8 gap-y-4">
        <!-- Avatar + saudação -->
        <div class="flex items-center gap-3">
          <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
            {{ initials }}
          </div>
          <div>
            <p class="text-base font-semibold text-slate-800">Olá, {{ authStore.me?.name?.split(' ')[0] }}</p>
            <RatingStars :rating="stats.averageRating || 0" :background="false" mode="numeric" />
          </div>
        </div>

        <div class="h-10 w-px bg-slate-200 hidden sm:block" />

        <!-- Stats -->
        <div class="flex gap-6">
          <div class="flex flex-col">
            <span class="text-xl font-bold leading-none text-slate-800">{{ stats.monthCount ?? 0 }}</span>
            <span class="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">Escalas este mês</span>
          </div>
          <div class="h-10 w-px bg-slate-200" />
          <div class="flex flex-col">
            <span class="text-xl font-bold leading-none text-slate-800">{{ stats.totalCount ?? 0 }}</span>
            <span class="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">Confirmadas no total</span>
          </div>
          <template v-if="stats.averageRating">
            <div class="h-10 w-px bg-slate-200" />
            <div class="flex flex-col">
              <span class="text-xl font-bold leading-none text-slate-800">{{ parseFloat(stats.averageRating).toFixed(1) }}</span>
              <span class="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">Avaliação média</span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Broadcast banners -->
    <div v-if="!loading && activeBroadcasts.length" class="flex flex-col gap-2">
      <div
        v-for="msg in activeBroadcasts.slice(0, 3)"
        :key="msg.id"
        class="rounded-md border border-blue-200 bg-blue-50 px-4 py-3"
      >
        <div class="mb-2 flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <BaseIcon name="megaphone" class="!size-3.5 text-blue-500" />
            <span class="text-[11px] font-semibold uppercase tracking-wide text-blue-600">Comunicado</span>
          </div>
          <div class="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>de <strong class="text-slate-500">{{ msg.senderName }}</strong></span>
            <span>·</span>
            <span>Expira {{ moment(msg.visibleUntil).format('DD/MM') }}</span>
          </div>
        </div>
        <p class="text-sm text-slate-700">{{ msg.content }}</p>
      </div>
      <router-link
        v-if="activeBroadcasts.length > 3"
        to="/calendar?tab=broadcasts"
        class="flex items-center justify-center gap-1 rounded-md border border-blue-200 bg-blue-50 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100"
      >
        Ver todos os comunicados ({{ activeBroadcasts.length }})
        <BaseIcon name="ChevronRight" class="!size-3.5" />
      </router-link>
    </div>

    <!-- Precisa de ação -->
    <div v-if="!loading && pending.length">
      <div class="mb-2 flex items-center gap-2">
        <span class="relative flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
        </span>
        <h2 class="text-sm font-semibold text-slate-700">Precisa de ação</h2>
        <span class="rounded bg-amber-100 px-1.5 py-px text-[10px] font-semibold text-amber-700">{{ pending.length }}</span>
      </div>
      <div class="flex flex-col gap-2">
        <CardRow
          v-for="data in pending"
          :key="data.id"
          accent="border-l-2 border-l-amber-400"
        >
          <template #prefix>
            <span class="text-sm font-bold leading-none text-slate-900">{{ moment(data.eventDay.date).format('DD') }}</span>
            <span class="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">{{ moment(data.eventDay.date).format('MMM') }}</span>
          </template>
          <div class="flex min-w-0 flex-col gap-1">
            <span class="truncate text-sm font-semibold capitalize text-slate-900">{{ data.event?.name }}</span>
            <div class="flex flex-wrap items-center gap-1.5">
              <div class="flex flex-shrink-0 items-center gap-1 rounded border border-slate-300 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                <BaseIcon name="Clock" class="!size-3" />
                {{ data.eventHour?.startTime }}–{{ data.eventHour?.endTime }}
              </div>
              <span v-if="mySchedule(data)?.position" class="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                {{ mySchedule(data).position.name }}
              </span>
            </div>
          </div>
          <template #trailing>
            <div class="flex flex-wrap items-center gap-1.5">
              <button
                class="inline-flex items-center gap-1 rounded bg-green-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-green-700"
                @click="accept(data)"
              >
                <BaseIcon name="Check" class="!size-3.5" />
                Aceitar
              </button>
              <button
                class="inline-flex items-center gap-1 rounded bg-red-500 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-red-600"
                @click="decline(data)"
              >
                <BaseIcon name="XMark" class="!size-3.5" />
                Recusar
              </button>
              <button
                class="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-50"
                @click="change(data)"
              >
                <BaseIcon name="ArrowPath" class="!size-3.5" />
                Trocar
              </button>
            </div>
          </template>
        </CardRow>
      </div>
    </div>

    <!-- Próximas escalas -->
    <div class="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <BaseIcon name="Calendar" class="!size-4 text-slate-400" />
        Próximas escalas
      </h2>

      <SkeletonRows v-if="loading" :rows="3" has-prefix has-trailing />

      <div v-else-if="upcoming.length" class="flex flex-col gap-2">
        <CardRow
          v-for="data in upcoming"
          :key="data.id"
          :accent="statusAccent(mySchedule(data)?.status)"
        >
          <template #prefix>
            <span class="text-sm font-bold leading-none text-slate-900">{{ moment(data.eventDay.date).format('DD') }}</span>
            <span class="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-slate-400">{{ moment(data.eventDay.date).format('MMM') }}</span>
          </template>
          <div class="flex min-w-0 flex-col gap-1">
            <span class="truncate text-sm font-semibold capitalize text-slate-900">{{ data.event?.name }}</span>
            <div class="flex flex-wrap items-center gap-1.5">
              <div class="flex flex-shrink-0 items-center gap-1 rounded border border-slate-300 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                <BaseIcon name="Clock" class="!size-3" />
                {{ data.eventHour?.startTime }}–{{ data.eventHour?.endTime }}
              </div>
              <span v-if="mySchedule(data)?.position" class="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
                {{ mySchedule(data).position.name }}
              </span>
            </div>
          </div>
          <template #trailing>
            <div class="flex items-center gap-2">
              <template v-if="mySchedule(data)?.status === 'accepted'">
                <BaseIcon name="Check" class="!size-3.5 text-green-500" />
                <span class="text-xs font-medium text-green-700">Confirmado</span>
              </template>
              <template v-else-if="mySchedule(data)?.status === 'pending'">
                <span class="relative flex h-1.5 w-1.5">
                  <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                  <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                </span>
                <span class="text-xs font-medium text-amber-700">Pendente</span>
              </template>
              <template v-else-if="mySchedule(data)?.status === 'declined'">
                <BaseIcon name="XMark" class="!size-3.5 text-red-400" />
                <span class="text-xs font-medium text-red-600">Recusado</span>
              </template>
              <template v-else-if="mySchedule(data)?.status === 'blocked'">
                <BaseIcon name="Clock" class="!size-3.5 text-amber-500" />
                <span class="text-xs font-medium text-amber-700">Ausência pendente</span>
              </template>
            </div>
          </template>
        </CardRow>
      </div>

      <Empty
        v-else
        title="Nenhuma escala próxima"
        description="Assim que você for escalado em algum evento, você verá aqui."
      />
    </div>

    <!-- Notificações recentes -->
    <div class="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <BaseIcon name="Bell" class="!size-4 text-slate-400" />
        Notificações recentes
      </h2>
      <SkeletonRows v-if="loading" :rows="3" />
      <div v-else-if="notifications.length" class="flex flex-col divide-y divide-slate-100">
        <div
          v-for="n in notifications"
          :key="n.id"
          class="flex items-start gap-3 py-2.5"
        >
          <span
            class="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full"
            :class="n.status === 'sent' ? 'bg-blue-500' : 'bg-slate-300'"
          />
          <div class="flex min-w-0 flex-col gap-0.5">
            <span class="text-sm text-slate-700">{{ n.message }}</span>
            <span class="text-[11px] text-slate-400">{{ moment(n.notifiedAt).fromNow() }}</span>
          </div>
        </div>
      </div>
      <p v-else class="py-4 text-center text-xs text-slate-400">Nenhuma notificação recente</p>
    </div>

    <!-- Últimos feedbacks -->
    <div class="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
      <h2 class="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <BaseIcon name="Star" class="!size-4 text-slate-400" />
        Últimas avaliações
      </h2>
      <SkeletonRows v-if="loading" :rows="2" />
      <div v-else-if="feedbacks.length" class="flex flex-col gap-2">
        <div
          v-for="f in feedbacks"
          :key="f.id"
          class="rounded-md border border-slate-100 bg-slate-50 px-4 py-3"
        >
          <div class="flex items-center justify-between gap-2">
            <RatingStars :rating="f.rating" :background="false" mode="stars" />
            <span class="text-[11px] text-slate-400">{{ moment(f.createdAt).format('DD/MM/YY') }}</span>
          </div>
          <p v-if="f.comment" class="mt-1.5 text-sm text-slate-600">{{ f.comment }}</p>
          <p class="mt-1 text-[11px] text-slate-400">por {{ f.reviewer }}</p>
        </div>
      </div>
      <p v-else class="py-4 text-center text-xs text-slate-400">Nenhuma avaliação ainda</p>
    </div>

    <FormDeclined />
    <FormChange />
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import CardRow from '@/components/card/CardRow';
import RatingStars from '@/components/rating/Star';
import Empty from '@/components/empty/Empty';
import SkeletonRows from '@/components/skeleton/SkeletonRows';
import FormDeclined from '@/modules/calendar/views/lists/schedule/FormDeclined';
import FormChange from '@/modules/calendar/views/lists/schedule/FormChange';
import { useAuthStore } from '@/modules/auth/store';
import { useScheduleStore } from '@/modules/calendar/store/schedule';
import { useMessageStore } from '@/modules/calendar/store/message';

export default {
  name: 'UserDashboard',
  components: { BaseIcon, CardRow, RatingStars, Empty, SkeletonRows, FormDeclined, FormChange },
  data() {
    return {
      loading: true,
      stats: {},
      pending: [],
      upcoming: [],
      notifications: [],
      feedbacks: []
    };
  },
  computed: {
    authStore: () => useAuthStore(),
    scheduleStore: () => useScheduleStore(),
    messageStore: () => useMessageStore(),
    activeBroadcasts() {
      const now = this.moment();
      return this.messageStore.messages
        .filter(m => this.moment(m.visibleUntil).isAfter(now))
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    initials() {
      const name = this.authStore.me?.name || '';
      return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
    }
  },
  mounted() {
    this.fetchDashboard();
  },
  methods: {
    async fetchDashboard() {
      try {
        const [data, messages] = await Promise.all([
          this.axios.get(`/users/${this.authStore.user.id}/dashboard`),
          this.axios.get('broadcast_messages')
        ]);
        this.stats = data.stats;
        this.pending = data.pending;
        this.upcoming = data.upcoming;
        this.notifications = data.notifications || [];
        this.feedbacks = data.feedbacks || [];
        this.messageStore.setMessages(messages);
      } finally {
        this.loading = false;
      }
    },
    mySchedule(data) {
      return data.mySchedule || null;
    },
    async accept(data) {
      const item = this.mySchedule(data);
      if (!item) return;
      await this.axios.patch(`/schedule_items/${item.id}/respond`, {
        status: 'accepted',
        user_id: this.authStore.user.id
      });
      this.fetchDashboard();
    },
    decline(data) {
      this.scheduleStore.setSchedule(data);
      this.drawerStore.setDrawer({
        title: 'Motivo da recusa',
        context: 'reasonScheduleDeclined',
        open: true,
        onSave: () => this.fetchDashboard()
      });
    },
    change(data) {
      this.scheduleStore.setSchedule(data);
      this.drawerStore.setDrawer({
        title: 'Troca de escala',
        context: 'changeSchedule',
        open: true,
        onSave: () => this.fetchDashboard()
      });
    },
    statusAccent(status) {
      return {
        pending:  'border-l-2 border-l-amber-400',
        accepted: 'border-l-2 border-l-green-500',
        declined: 'border-l-2 border-l-red-400',
        blocked:  'border-l-2 border-l-amber-500'
      }[status] || '';
    }
  }
};
</script>
