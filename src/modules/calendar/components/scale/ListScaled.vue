<template>
  <section class="space-y-2">
    <div class="flex items-center gap-2">
      <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {{ scaleStore.current.position.name }} — Escalados
      </span>
      <span class="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
        {{ handleSchedules.schedules.length }}
      </span>
    </div>

    <ul v-if="handleSchedules.present" class="flex flex-col gap-2">
      <li
        v-for="user in handleSchedules.schedules"
        :key="user.id"
        class="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
      >
        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
          <span class="truncate text-sm font-semibold capitalize text-slate-900">{{ user.name }}</span>
          <div class="flex flex-wrap items-center gap-1.5">
            <RatingStars :rating="parseFloat(user.averageRating) || 0" :background="false" mode="numeric" />
            <span
              v-if="user.totals?.month"
              class="text-[10px] text-slate-400"
              :title="`Escalado ${user.totals.month}× neste mês (escalas aceitas)`"
            >· {{ user.totals.month }}× este mês</span>
            <span
              v-if="user.totals?.event"
              class="text-[10px] text-slate-400"
              :title="`Já tem ${user.totals.event} escala(s) aceita(s) neste evento (todos os dias e horários)`"
            >· {{ user.totals.event }}× neste evento</span>
          </div>
        </div>

        <div class="flex flex-shrink-0 items-center gap-2">
          <template v-if="user.status">
            <span v-if="user.status === 'pending'" class="flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
              <BaseIcon name="Clock" class="!size-3" />Pendente
            </span>
            <span v-else-if="user.status === 'accepted'" class="flex items-center gap-1 rounded bg-green-50 px-1.5 py-0.5 text-[10px] font-medium text-green-700">
              <BaseIcon name="Check" class="!size-3" />Confirmado
            </span>
            <span v-else-if="user.status === 'declined'" class="flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
              <BaseIcon name="XMark" class="!size-3" />Recusado
            </span>
            <span v-else-if="user.status === 'change_request_admin'" class="flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
              <BaseIcon name="ArrowPath" class="!size-3" />Troca
            </span>
          </template>

          <button
            class="inline-flex items-center justify-center rounded p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
            title="Remover colaborador"
            @click="removeUser(user)"
          >
            <BaseIcon name="Trash" class="!size-4" />
          </button>
        </div>
      </li>
    </ul>

    <div v-else class="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-slate-200 py-8">
      <BaseIcon name="UserGroup" class="!size-7 text-slate-200" />
      <span class="text-xs text-slate-400">Nenhum colaborador escalado ainda</span>
    </div>
  </section>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import RatingStars from '@/components/rating/Star';

import { useScaleStore } from '@/modules/calendar/store/scale';

export default {
  name: 'ListScaled',
  components: {
    BaseIcon,
    RatingStars
  },
  props: {
    schedules: {
      type: Object,
      required: true
    }
  },
  computed: {
    scaleStore: () => useScaleStore(),
    handleSchedules() {
      return this.schedules;
    }
  },
  methods: {
    removeUser(user) {
      if (!this.scaleStore.current.position || !user) return;
      this.scaleStore.restoreUserToPosition(user);
      this.scaleStore.removeScale(user);
    }
  }
};
</script>
