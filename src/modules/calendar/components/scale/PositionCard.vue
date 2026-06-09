<template>
  <div class="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
    <!-- Header da posição -->
    <div class="flex items-center justify-between bg-white px-4 py-3">
      <div class="flex items-center gap-2">
        <span class="text-sm font-semibold text-slate-800">{{ position.name }}</span>
        <!-- Coverage badge: cor indica saúde da posição -->
        <span
          v-if="scaledUsers.length"
          class="rounded-full px-2 py-0.5 text-[11px] font-semibold"
          :class="coverageBadge.cls"
          :title="coverageBadge.title"
        >{{ coverageBadge.label }}</span>
      </div>
      <button
        class="flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
        @click="$emit('add')"
      >
        <BaseIcon name="Plus" class="!size-3.5" />
        Adicionar
      </button>
    </div>

    <!-- Lista de usuários -->
    <ul v-if="scaledUsers.length" class="divide-y divide-slate-100 border-t border-slate-100">
      <li
        v-for="user in scaledUsers"
        :key="user.id"
        class="flex items-center gap-3 px-4 py-2.5 transition-colors"
        :class="rowClass(user)"
      >
        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
          <div class="flex items-center gap-1.5">
            <span
              class="truncate text-sm font-medium capitalize"
              :class="user.status === 'rescheduled' ? 'text-slate-400 line-through' : 'text-slate-800'"
            >{{ user.name }}</span>
            <span
              v-if="duplicateUsers.has(user.id)"
              class="flex items-center gap-0.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700"
              title="Este colaborador está em mais de uma posição neste turno"
            >
              <BaseIcon name="Exclamation" class="!size-3" />
              2 posições
            </span>
          </div>
          <div class="flex flex-wrap items-center gap-1.5">
            <RatingStars :rating="parseFloat(user.averageRating) || 0" :background="false" mode="numeric" />
            <span
              v-if="user.totals?.month > 0"
              class="text-[10px] text-slate-400"
            >· {{ user.totals.month }}× mês</span>
            <span
              v-if="user.totals?.event > 0"
              class="text-[10px] text-orange-500"
            >· {{ user.totals.event }}× evento</span>
          </div>
        </div>

        <div class="flex flex-shrink-0 items-center gap-2">
          <!-- Usuário publicado: mostra status com ação opcional -->
          <template v-if="user.status">
            <div v-if="user.status === 'declined'" class="relative">
              <button
                class="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium"
                :class="statusConfig('declined').cls"
                @click.stop="togglePopover(user.id)"
              >
                <BaseIcon name="XMark" class="!size-3" />
                Recusado
              </button>
              <div
                v-if="activePopover === user.id"
                class="absolute right-0 top-full z-50 mt-1 w-56 rounded-md border border-slate-200 bg-white p-3 shadow-lg"
                @click.stop
              >
                <p class="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Justificativa</p>
                <p v-if="user.declineReason" class="text-xs leading-relaxed text-slate-700">"{{ user.declineReason }}"</p>
                <p v-else class="text-xs italic text-slate-400">Nenhuma justificativa informada.</p>
              </div>
            </div>
            <button
              v-else-if="statusConfig(user.status).clickable"
              class="flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium transition hover:opacity-80"
              :class="statusConfig(user.status).cls"
              @click="handleStatusAction(user)"
            >
              <BaseIcon :name="statusConfig(user.status).icon" class="!size-3" />
              {{ statusConfig(user.status).text }}
            </button>
            <span
              v-else
              class="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium"
              :class="statusConfig(user.status).cls"
            >
              <BaseIcon :name="statusConfig(user.status).icon" class="!size-3" />
              {{ statusConfig(user.status).text }}
            </span>
          </template>

          <!-- Usuário staged (não publicado): badge + trash -->
          <template v-else>
            <span class="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
              <BaseIcon name="Clock" class="!size-3" />
              A publicar
            </span>
            <button
              class="flex items-center justify-center rounded p-1 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
              title="Remover"
              @click="$emit('remove', user)"
            >
              <BaseIcon name="Trash" class="!size-4" />
            </button>
          </template>
        </div>
      </li>
    </ul>

    <!-- Empty state compacto -->
    <div
      v-else
      class="border-t border-slate-100 bg-slate-50/50 px-4 py-2 text-[11px] italic text-slate-400"
    >
      Nenhum colaborador escalado
    </div>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import RatingStars from '@/components/rating/Star';
import { useDrawerStore } from '@/components/drawer/store';
import { useBlockStore } from '@/modules/requests/block';

export default {
  name: 'PositionCard',
  components: { BaseIcon, RatingStars },
  props: {
    position: { type: Object, required: true },
    team: { type: Object, required: true },
    scaledUsers: { type: Array, default: () => [] },
    duplicateUsers: { type: Set, default: () => new Set() }
  },
  emits: ['add', 'remove'],
  data() {
    return { activePopover: null };
  },
  computed: {
    drawerStore: () => useDrawerStore(),
    blockStore: () => useBlockStore(),
    coverageBadge() {
      const users = this.scaledUsers;
      const total = users.length;
      if (!total) return { label: '0', cls: 'bg-slate-100 text-slate-500', title: '' };

      const declined = users.filter(u => u.status === 'declined').length;
      const blocked  = users.filter(u => u.status === 'blocked').length;
      const accepted = users.filter(u => u.status === 'accepted').length;
      const published = users.filter(u => u.status).length;
      const staged   = total - published;

      if (declined + blocked > 0) {
        const bad = declined + blocked;
        return {
          label: `${bad} recus.`,
          cls: 'bg-red-100 text-red-600',
          title: `${bad} colaborador(es) recusaram ou têm ausência pendente`
        };
      }
      if (published > 0 && accepted === published && staged === 0) {
        return {
          label: `${total} ✓`,
          cls: 'bg-green-100 text-green-700',
          title: 'Todos confirmados'
        };
      }
      if (published > 0) {
        return {
          label: `${accepted}/${published}`,
          cls: 'bg-amber-100 text-amber-700',
          title: `${accepted} confirmados de ${published} publicados`
        };
      }
      // Somente staged
      return { label: String(total), cls: 'bg-slate-100 text-slate-600', title: `${total} a publicar` };
    }
  },
  mounted() {
    document.addEventListener('click', this.closePopover);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closePopover);
  },
  methods: {
    closePopover() { this.activePopover = null; },
    togglePopover(id) { this.activePopover = this.activePopover === id ? null : id; },
    rowClass(user) {
      if (user.status === 'declined') return 'bg-red-50/70 border-l-2 border-l-red-400';
      if (user.status === 'blocked')  return 'bg-amber-50/60 border-l-2 border-l-amber-400';
      return 'hover:bg-slate-50';
    },
    statusConfig(status) {
      const map = {
        pending:              { icon: 'Clock',     text: 'Aguardando',       cls: 'bg-amber-50 text-amber-700',   clickable: false },
        accepted:             { icon: 'Check',     text: 'Confirmado',       cls: 'bg-green-50 text-green-700',   clickable: false },
        declined:             { icon: 'XMark',     text: 'Recusado',         cls: 'bg-red-50 text-red-600',       clickable: false },
        blocked:              { icon: 'Clock',     text: 'Ausência pendente',cls: 'bg-amber-50 text-amber-700 border-amber-200', clickable: true },
        change_request_admin: { icon: 'ArrowPath', text: 'Solicitou troca',  cls: 'bg-amber-50 text-amber-700 border-amber-200', clickable: true },
        change_request_user:  { icon: 'UserGroup', text: 'Candidatos notificados', cls: 'bg-blue-50 text-blue-700 border-blue-200', clickable: false },
        rescheduled:          { icon: 'ArrowPath', text: 'Substituído',      cls: 'bg-slate-50 text-slate-400',   clickable: false }
      };
      return map[status] || { icon: 'Check', text: 'Publicado', cls: 'bg-green-50 text-green-700', clickable: false };
    },
    async handleStatusAction(user) {
      if (user.status === 'change_request_admin') {
        this.drawerStore.setDrawer({
          title: 'Solicitação de Troca',
          context: 'changeScheduleRequest',
          open: true,
          reference: user.scheduleItemId
        });
      }
      if (user.status === 'blocked' && user.blockId) {
        try {
          const block = await this.axios.get(`/users/${user.id}/blocks/${user.blockId}`);
          this.blockStore.setBlock(block);
          this.blockStore.positionName = this.position?.name || '';
          this.drawerStore.setDrawer({ title: 'Recusa de Escala', context: 'block-reason', open: true });
        } catch (e) {
          console.error(e);
        }
      }
    }
  }
};
</script>
