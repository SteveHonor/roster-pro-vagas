<template>
  <Drawer
    context="changeSchedule"
    :confirm-label="actionLabel"
    :on-save="actionFn"
    :on-open="() => { usersForChange(); }"
    :on-close="() => { reset(); }"
  >
    <!-- Event header -->
    <div class="mb-5 flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
      <div class="flex w-12 flex-shrink-0 flex-col items-center justify-center rounded-md bg-white py-2 text-center shadow-sm">
        <span class="text-lg font-bold leading-none text-slate-900">
          {{ moment(scheduleStore?.getSchedule.eventDay?.date).format('DD') }}
        </span>
        <span class="text-[9px] font-medium uppercase tracking-wide text-slate-400">
          {{ moment(scheduleStore?.getSchedule.eventDay?.date).format('MMM') }}
        </span>
      </div>

      <div class="flex flex-col gap-0.5">
        <div class="flex items-center gap-1.5">
          <BaseIcon name="Calendar" class="!size-3.5 text-slate-400" />
          <span class="text-sm font-semibold text-slate-900">{{ scheduleStore?.getSchedule.event?.name }}</span>
        </div>
        <div v-if="scheduleStore?.getSchedule.eventHour?.startTime" class="flex items-center gap-1.5">
          <BaseIcon name="Clock" class="!size-3.5 text-slate-400" />
          <span class="text-xs text-slate-500">
            {{ scheduleStore?.getSchedule.eventHour?.startTime }} – {{ scheduleStore?.getSchedule.eventHour?.endTime }}
          </span>
        </div>
        <div v-if="scheduleStore?.getSchedule.mySchedule?.position" class="flex items-center gap-1.5">
          <BaseIcon name="Flag" class="!size-3.5 text-slate-400" />
          <span class="text-xs font-medium text-slate-500">{{ scheduleStore?.getSchedule.mySchedule?.position?.name }}</span>
        </div>
      </div>
    </div>

    <!-- Timeline (when swap already exists) -->
    <div v-if="change.scheduleChange" class="my-6 border-y border-slate-100 py-5">
      <div class="flex items-start">
        <template v-for="(step, i) in timelineSteps" :key="i">
          <!-- Connector antes do nó (exceto o primeiro) -->
          <div
            v-if="i > 0"
            class="mt-[13px] h-0.5 flex-1 transition-colors duration-300"
            :class="{
              'bg-green-400': step.state === 'done',
              'bg-red-300': step.state === 'failed',
              'bg-slate-200': step.state === 'pending' || step.state === 'active'
            }"
          />
          <!-- Nó -->
          <div class="flex flex-col items-center gap-1.5">
            <div
              class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ring-2 ring-white transition-colors duration-300"
              :class="{
                'bg-green-500': step.state === 'done',
                'bg-amber-400': step.state === 'active',
                'bg-red-400': step.state === 'failed',
                'bg-slate-200': step.state === 'pending'
              }"
            >
              <BaseIcon v-if="step.state === 'done'" name="Check" class="!size-3.5 text-white" />
              <BaseIcon v-else-if="step.state === 'failed'" name="XMark" class="!size-3.5 text-white" />
              <BaseIcon v-else-if="step.state === 'active'" name="Clock" class="!size-3.5 text-white" />
            </div>
            <span
              class="text-[10px] font-semibold transition-colors duration-300"
              :class="{
                'text-green-600': step.state === 'done',
                'text-amber-500': step.state === 'active',
                'text-red-500': step.state === 'failed',
                'text-slate-400': step.state === 'pending'
              }"
            >{{ step.label }}</span>
          </div>
        </template>
      </div>
    </div>

    <!-- Phase: No change yet — select candidates -->
    <div v-if="!change.scheduleChange">
      <div class="mb-3 flex items-center justify-between">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Selecionar colaboradores</p>
        <span v-if="selectedUsers.length" class="text-xs font-medium" :style="{ color: 'var(--brand-primary)' }">
          {{ selectedUsers.length }} selecionado{{ selectedUsers.length > 1 ? 's' : '' }}
        </span>
      </div>

      <!-- Skeleton de carregamento -->
      <div v-if="loading" class="animate-pulse divide-y divide-slate-100 rounded-md border border-slate-200">
        <div v-for="i in 3" :key="i" class="flex items-center justify-between px-3 py-3">
          <div class="flex items-center gap-2">
            <div class="h-3.5 w-3.5 rounded-full bg-slate-200" />
            <div class="h-3.5 rounded bg-slate-200" :style="`width: ${60 + i * 22}px`" />
          </div>
          <div class="h-4 w-4 rounded bg-slate-200" />
        </div>
      </div>

      <div v-else-if="change.users && change.users.length" class="divide-y divide-slate-100 overflow-hidden rounded-md border border-slate-200">
        <label
          v-for="user in eligibleUsers"
          :key="user.id"
          class="flex cursor-pointer items-center justify-between px-3 py-2.5 transition-all"
          :class="selectedUsers.includes(user.id) ? 'bg-blue-50' : 'hover:bg-slate-50'"
          :style="selectedUsers.includes(user.id) ? { borderLeft: '3px solid var(--brand-primary)' } : { borderLeft: '3px solid transparent' }"
        >
          <div class="flex items-center gap-2.5">
            <div
              class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
              :class="selectedUsers.includes(user.id) ? 'text-white' : 'bg-slate-100 text-slate-500'"
              :style="selectedUsers.includes(user.id) ? { background: 'var(--brand-primary)' } : {}"
            >
              {{ user.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <span class="block text-sm font-medium text-slate-800">{{ user.name }}</span>
              <RatingStars v-if="user.averageRating > 0" :rating="user.averageRating" :background="false" mode="numeric" />
              <span v-else class="text-[10px] text-slate-400">Sem avaliações ainda</span>
            </div>
          </div>
          <input
            v-model="selectedUsers"
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 [accent-color:var(--brand-primary)]"
            :value="user.id"
          />
        </label>
      </div>

      <div v-else-if="!loading && change.users && !change.users.length" class="rounded-md border border-slate-200 px-4 py-6 text-center">
        <BaseIcon name="UserGroup" class="mx-auto mb-1.5 !size-7 text-slate-300" />
        <p class="text-sm font-medium text-slate-500">Nenhum colaborador disponível</p>
        <p class="mt-0.5 text-xs text-slate-400">Todos estão escalados neste horário ou com agenda bloqueada.</p>
      </div>

      <!-- Warning: só na fase de seleção -->
      <div class="mt-4 flex items-start gap-2.5 rounded-md border border-amber-100 bg-amber-50 px-3 py-2.5">
        <BaseIcon name="Exclamation" class="mt-0.5 !size-4 flex-shrink-0 text-amber-500" />
        <div>
          <p class="text-xs font-semibold text-amber-800">A lista pode estar incompleta</p>
          <p class="mt-0.5 text-xs text-amber-700">Colaboradores já escalados neste horário ou com ausência aprovada não aparecem como opção.</p>
        </div>
      </div>
    </div>

    <!-- Phase: pending_admin -->
    <div v-else-if="change.scheduleChange?.status === 'pending_admin'">
      <div class="mb-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5">
        <BaseIcon name="Clock" class="mt-0.5 !size-4 flex-shrink-0 text-amber-500" />
        <div>
          <p class="text-xs font-semibold text-amber-800">Aguardando aprovação do gestor</p>
          <p class="mt-0.5 text-xs text-amber-600">O gestor será notificado e precisará aprovar antes que os candidatos sejam contatados.</p>
        </div>
      </div>

      <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Candidatos selecionados</p>
      <div class="divide-y divide-slate-100 rounded-md border border-slate-200">
        <div
          v-for="user in change.users.filter(u => u.id !== authStore.user.id)"
          :key="user.id"
          class="flex items-center justify-between px-3 py-2.5"
        >
          <div class="flex items-center gap-2">
            <BaseIcon name="User" class="!size-3.5 text-slate-400" />
            <span class="text-sm text-slate-800">{{ user.name }}</span>
          </div>
          <span class="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">Aguardando aprovação</span>
        </div>
      </div>
    </div>

    <!-- Phase: approved_by_admin -->
    <div v-else-if="change.scheduleChange?.status === 'approved_by_admin'">
      <!-- Header com contador e cancelar -->
      <div class="mb-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-slate-700">Respostas dos candidatos</span>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
            {{ candidates.length }}
          </span>
        </div>
        <button type="button" class="text-xs font-medium text-red-500 hover:underline" @click="cancelChange">
          Cancelar troca
        </button>
      </div>

      <!-- Lista de candidatos -->
      <div class="divide-y divide-slate-100 overflow-hidden rounded-md border border-slate-200">
        <div
          v-for="user in candidates"
          :key="user.id"
          class="flex items-center justify-between px-3 py-3"
        >
          <div class="flex items-center gap-2.5">
            <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
              {{ user.name.charAt(0).toUpperCase() }}
            </div>
            <div>
              <span class="block text-sm font-medium text-slate-800">{{ user.name }}</span>
              <span class="text-[10px] text-slate-400">{{ notifiedAgo }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="!user.changeStatus || user.changeStatus === 'pending'"
              type="button"
              class="text-[11px] font-medium transition"
              :class="renotifiedUsers.includes(user.id) ? 'cursor-default text-green-600' : 'text-slate-400 hover:text-slate-600'"
              :disabled="renotifiedUsers.includes(user.id)"
              @click="renotify(user.id)"
            >
              {{ renotifiedUsers.includes(user.id) ? '✓ Reenviado' : 'Reenviar' }}
            </button>
            <span
              class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              :class="{
                'bg-amber-50 text-amber-700': !user.changeStatus || user.changeStatus === 'pending',
                'bg-green-50 text-green-700': user.changeStatus === 'accepted',
                'bg-red-50 text-red-600': user.changeStatus === 'rejected',
                'bg-slate-100 text-slate-400': user.changeStatus === 'locked'
              }"
            >
              <BaseIcon :name="candidateIcon(user.changeStatus)" class="!size-3" />
              {{ candidateLabel(user.changeStatus) }}
            </span>
          </div>
        </div>
      </div>

      <!-- O que acontece agora? -->
      <div class="mt-5 rounded-md border border-slate-200 bg-slate-50 p-4">
        <p class="mb-3 text-xs font-semibold text-slate-600">O que acontece agora?</p>
        <ul class="space-y-2.5">
          <li class="flex items-start gap-2">
            <span class="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-amber-400 text-[9px] font-bold text-white">1</span>
            <p class="text-xs text-slate-600">Os candidatos receberam uma notificação e podem aceitar ou recusar a troca.</p>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-slate-300 text-[9px] font-bold text-white">2</span>
            <p class="text-xs text-slate-500">Se alguém aceitar, a troca é concluída automaticamente e você fica liberado(a) desta escala.</p>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-slate-300 text-[9px] font-bold text-white">3</span>
            <p class="text-xs text-slate-500">Se todos recusarem, você poderá selecionar outros colaboradores para uma nova tentativa.</p>
          </li>
        </ul>
      </div>
    </div>

    <!-- Phase: accepted -->
    <div v-else-if="change.scheduleChange?.status === 'accepted'">
      <div class="flex flex-col items-center rounded-md border border-green-200 bg-green-50 px-4 py-6 text-center">
        <BaseIcon name="Check" class="mb-2 !size-8 text-green-500" />
        <p class="text-sm font-semibold text-green-800">Troca concluída</p>
        <p class="mt-0.5 text-xs text-green-600">{{ acceptedByName }} assumiu sua escala neste evento.</p>
      </div>
    </div>

    <!-- Phase: rejected_by_admin -->
    <div v-else-if="change.scheduleChange?.status === 'rejected_by_admin'">
      <div class="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5">
        <BaseIcon name="XMark" class="mt-0.5 !size-4 flex-shrink-0 text-red-400" />
        <div>
          <p class="text-xs font-semibold text-red-700">Solicitação recusada pelo gestor</p>
          <p class="mt-0.5 text-xs text-red-500">Selecione outros colaboradores para uma nova solicitação.</p>
        </div>
      </div>

      <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Nova solicitação</p>
      <div class="divide-y divide-slate-100 rounded-md border border-slate-200">
        <label
          v-for="user in eligibleUsers"
          :key="user.id"
          class="flex cursor-pointer items-center justify-between px-3 py-2.5 transition hover:bg-slate-50"
        >
          <div class="flex items-center gap-2">
            <BaseIcon name="User" class="!size-3.5 text-slate-400" />
            <span class="text-sm text-slate-800">{{ user.name }}</span>
          </div>
          <input v-model="selectedUsers" type="checkbox" class="h-4 w-4 rounded border-slate-300 [accent-color:var(--brand-primary)]" :value="user.id" />
        </label>
      </div>
    </div>

    <!-- Phase: cancelled -->
    <div v-else-if="change.scheduleChange?.status === 'cancelled'">
      <div class="mb-4 flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5">
        <BaseIcon name="UserGroup" class="mt-0.5 !size-4 flex-shrink-0 text-slate-400" />
        <div>
          <p class="text-xs font-semibold text-slate-600">Todos os candidatos recusaram</p>
          <p class="mt-0.5 text-xs text-slate-400">Selecione outros colaboradores para tentar novamente.</p>
        </div>
      </div>

      <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Nova solicitação</p>
      <div class="divide-y divide-slate-100 rounded-md border border-slate-200">
        <label
          v-for="user in eligibleUsers"
          :key="user.id"
          class="flex cursor-pointer items-center justify-between px-3 py-2.5 transition hover:bg-slate-50"
        >
          <div class="flex items-center gap-2">
            <BaseIcon name="User" class="!size-3.5 text-slate-400" />
            <span class="text-sm text-slate-800">{{ user.name }}</span>
          </div>
          <input v-model="selectedUsers" type="checkbox" class="h-4 w-4 rounded border-slate-300 [accent-color:var(--brand-primary)]" :value="user.id" />
        </label>
      </div>
    </div>

    <!-- Warning também nas fases de re-seleção -->
    <div
      v-if="change.scheduleChange?.status === 'rejected_by_admin' || change.scheduleChange?.status === 'cancelled'"
      class="mt-4 flex items-start gap-2.5 rounded-md border border-amber-100 bg-amber-50 px-3 py-2.5"
    >
      <BaseIcon name="Exclamation" class="mt-0.5 !size-4 flex-shrink-0 text-amber-500" />
      <div>
        <p class="text-xs font-semibold text-amber-800">A lista pode estar incompleta</p>
        <p class="mt-0.5 text-xs text-amber-700">Colaboradores já escalados neste horário ou com ausência aprovada não aparecem como opção.</p>
      </div>
    </div>
  </Drawer>
</template>

<script>
import Drawer from '@/components/drawer/Drawer.vue';
import BaseIcon from '@/components/icons/BaseIcon';
import RatingStars from '@/components/rating/Star';
import { useScheduleStore } from '@/modules/calendar/store/schedule';
import { useAuthStore } from '@/modules/auth/store';

export default {
  name: 'FormChange',
  components: { Drawer, BaseIcon, RatingStars },
  data() {
    return {
      change: {},
      selectedUsers: [],
      loading: false,
      renotifiedUsers: []
    };
  },
  computed: {
    scheduleStore: () => useScheduleStore(),
    authStore: () => useAuthStore(),
    eligibleUsers() {
      if (!this.change.users) return [];
      return this.change.users.filter(u => u.id !== this.authStore.user.id && !u.changeStatus);
    },
    canSendChange() {
      const status = this.change.scheduleChange?.status;
      return this.selectedUsers.length > 0 && (!status || status === 'rejected_by_admin' || status === 'cancelled');
    },
    actionLabel() {
      return this.canSendChange ? 'Solicitar Troca' : null;
    },
    actionFn() {
      return this.canSendChange ? this.sendChange : null;
    },
    candidates() {
      if (!this.change.users) return [];
      return this.change.users.filter(u => u.id !== this.authStore.user.id);
    },
    notifiedAgo() {
      const ts = this.change.scheduleChange?.updatedAt;
      if (!ts) return 'Notificado recentemente';
      const mins = this.moment().diff(this.moment(ts), 'minutes');
      if (mins < 1) return 'Notificado agora';
      if (mins < 60) return `Notificado há ${mins} min`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `Notificado há ${hours}h`;
      const days = Math.floor(hours / 24);
      return `Notificado há ${days} dia${days > 1 ? 's' : ''}`;
    },
    acceptedByName() {
      if (!this.change.users) return '';
      return this.change.users.find(u => u.changeStatus === 'accepted')?.name || '';
    },
    timelineSteps() {
      const status = this.change.scheduleChange?.status;
      const steps = [
        { label: 'Solicitado', state: 'done' },
        { label: 'Gestão', state: 'pending' },
        { label: 'Candidatos', state: 'pending' },
        { label: 'Concluído', state: 'pending' }
      ];
      if (status === 'pending_admin') {
        steps[1].state = 'active';
      } else if (status === 'approved_by_admin') {
        steps[1].state = 'done';
        steps[2].state = 'active';
      } else if (status === 'rejected_by_admin') {
        steps[1].state = 'failed';
        steps[3].state = 'failed';
      } else if (status === 'accepted') {
        steps[1].state = 'done';
        steps[2].state = 'done';
        steps[3].state = 'done';
      } else if (status === 'cancelled') {
        steps[1].state = 'done';
        steps[2].state = 'failed';
        steps[3].state = 'failed';
      }
      return steps;
    }
  },
  methods: {
    reset() {
      this.change = {};
      this.selectedUsers = [];
      this.renotifiedUsers = [];
      this.loading = false;
    },
    async renotify(userId) {
      if (this.renotifiedUsers.includes(userId)) return;
      try {
        await this.axios.post(`schedule_changes/${this.change.scheduleChangesId}/notify`, { userId });
        this.renotifiedUsers.push(userId);
      } catch (error) {
        console.error(error);
      }
    },
    candidateIcon(status) {
      const map = { pending: 'Clock', accepted: 'Check', rejected: 'XMark', locked: 'Block' };
      return map[status] || 'Clock';
    },
    candidateIconColor(status) {
      const map = { pending: 'text-amber-500', accepted: 'text-green-500', rejected: 'text-red-400', locked: 'text-slate-300' };
      return map[status] || 'text-slate-300';
    },
    candidateTextColor(status) {
      const map = { pending: 'text-amber-700', accepted: 'text-green-700', rejected: 'text-red-600', locked: 'text-slate-400' };
      return map[status] || 'text-slate-400';
    },
    candidateLabel(status) {
      const map = { pending: 'Aguardando', accepted: 'Aceitou', rejected: 'Recusou', locked: 'Indisponível' };
      return map[status] || 'Aguardando';
    },
    async usersForChange() {
      this.loading = true;
      try {
        this.change = await this.axios.get(`schedule_items/${this.scheduleStore?.getSchedule.mySchedule.id}/users`);
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    async cancelChange() {
      try {
        this.change = await this.axios.put(
          `schedule_changes/${this.change.scheduleChangesId}/cancel`
        );
        this.selectedUsers = [];
      } catch (error) {
        console.error(error);
      }
    },
    async sendChange() {
      if (!this.selectedUsers.length) return;
      try {
        this.change = await this.axios.post(
          `schedule_items/${this.scheduleStore?.getSchedule.mySchedule.id}/schedule_changes`,
          { change: this.selectedUsers }
        );
        this.selectedUsers = [];
      } catch (error) {
        console.error(error);
      }
    }
  }
};
</script>
