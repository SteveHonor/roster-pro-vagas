<template>
  <div v-if="schedules?.present" class="flex flex-col gap-2">
    <!-- Banner de recusas pendentes -->
    <div
      v-if="pendingRefusals.length"
      class="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2"
    >
      <BaseIcon name="Clock" class="!size-3.5 flex-shrink-0 text-amber-600" />
      <p class="text-xs text-amber-800">
        <strong>{{ pendingRefusals.length }}</strong>
        {{ pendingRefusals.length > 1 ? 'ausências pendentes de aprovação' : 'ausência pendente de aprovação' }}
        — clique no item para analisar e encontrar um substituto.
      </p>
    </div>

    <ul class="flex flex-col gap-2">
      <li
        v-for="(selected, index) in schedules.schedules"
        :key="index"
        class="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2.5 shadow-sm"
      >
        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
          <span
            class="truncate text-sm font-semibold capitalize"
            :class="selected.status === 'rescheduled' ? 'text-slate-400 line-through' : 'text-slate-900'"
          >
            {{ selected?.name }}
          </span>
          <div class="flex flex-wrap items-center gap-1.5">
            <RatingStars :rating="parseFloat(selected.averageRating) || 0" :background="false" mode="numeric" />
            <span class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
              {{ selected.totals?.month || 0 }}× mês
            </span>
            <span class="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium text-orange-600">
              {{ selected.totals?.event || 0 }}× evento
            </span>
          </div>
        </div>

        <div class="flex flex-shrink-0 items-center">
          <div v-if="selected.status === 'declined'" class="relative">
            <button
              class="flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-medium text-red-600 shadow-sm transition hover:bg-red-100 active:scale-95 cursor-pointer"
              @click.stop="togglePopover(selected.scheduleItemId)"
            >
              <BaseIcon name="XMark" class="!size-3" />
              Recusado
              <BaseIcon name="ChevronDown" class="!size-3 opacity-60" />
            </button>
            <div
              v-if="activePopover === selected.scheduleItemId"
              class="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-md border border-slate-200 bg-white p-3 shadow-lg"
              @click.stop
            >
              <p class="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Justificativa
              </p>
              <p v-if="selected.declineReason" class="text-xs leading-relaxed text-slate-700">
                "{{ selected.declineReason }}"
              </p>
              <p v-else class="text-xs italic text-slate-400">
                Nenhuma justificativa informada.
              </p>
            </div>
          </div>
          <button
            v-else-if="statusConfig(selected.status).clickable"
            class="flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium shadow-sm transition hover:opacity-90 active:scale-95 cursor-pointer"
            :class="statusConfig(selected.status).cls"
            @click="handleStatusAction(selected)"
          >
            <BaseIcon :name="statusConfig(selected.status).icon" class="!size-3" />
            {{ statusConfig(selected.status).text }}
          </button>
          <span
            v-else
            class="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium"
            :class="statusConfig(selected.status).cls"
          >
            <BaseIcon :name="statusConfig(selected.status).icon" class="!size-3" />
            {{ statusConfig(selected.status).text }}
          </span>
        </div>
      </li>
    </ul>
  </div>

  <div
    v-else-if="scaleStore.current.position?.status === 'done'"
    class="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-slate-200 py-8"
  >
    <span class="text-xs text-slate-400">Nenhum colaborador escalado para esta posição</span>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import RatingStars from '@/components/rating/Star';
import { useScaleStore } from '@/modules/calendar/store/scale';
import { useBlockStore } from '@/modules/requests/block';

export default {
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
  data() {
    return {
      activePopover: null
    };
  },
  computed: {
    scaleStore: () => useScaleStore(),
    blockStore: () => useBlockStore(),
    pendingRefusals() {
      return this.schedules?.schedules?.filter(s => s.status === 'blocked') || [];
    }
  },
  mounted() {
    document.addEventListener('click', this.closePopover);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closePopover);
  },
  methods: {
    closePopover() {
      this.activePopover = null;
    },
    togglePopover(id) {
      this.activePopover = this.activePopover === id ? null : id;
    },
    statusConfig(status) {
      const map = {
        pending: { icon: 'Clock', text: 'Aguardando colaborador', cls: 'bg-amber-50 text-amber-700', clickable: false },
        accepted: { icon: 'Check', text: 'Confirmado', cls: 'bg-green-50 text-green-700', clickable: false },
        declined: { icon: 'XMark', text: 'Recusado', cls: 'bg-red-50 text-red-600', clickable: false },
        change_request_admin: { icon: 'ArrowPath', text: 'Solicitou troca', cls: 'bg-amber-50 text-amber-700 border-amber-200', clickable: true },
        change_request_user: { icon: 'UserGroup', text: 'Candidatos notificados', cls: 'bg-blue-50 text-blue-700 border-blue-200', clickable: true },
        rescheduled: { icon: 'ArrowPath', text: 'Substituído', cls: 'bg-slate-50 text-slate-500', clickable: false },
        blocked: { icon: 'Clock', text: 'Ausência pendente', cls: 'bg-amber-50 text-amber-700 border-amber-200', clickable: true }
      };
      return map[status] || { icon: 'Check', text: 'Publicado', cls: 'bg-green-50 text-green-700', clickable: false };
    },
    async handleStatusAction(selected) {
      if (selected.status === 'change_request_admin') {
        this.drawerStore.setDrawer({
          title: 'Solicitação de Troca',
          context: 'changeScheduleRequest',
          open: true,
          reference: selected.scheduleItemId
        });
      }
      if (selected.status === 'blocked' && selected.blockId) {
        try {
          const block = await this.axios.get(
            `/users/${selected.id}/blocks/${selected.blockId}`
          );
          this.blockStore.setBlock(block);
          this.blockStore.positionName = this.scaleStore.current.position?.name || '';
          this.drawerStore.setDrawer({
            title: 'Recusa de Escala',
            context: 'block-reason',
            open: true
          });
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
};
</script>
