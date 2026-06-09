<template>
  <Drawer context="team-users" :on-open="fetchUsers">
    <div class="space-y-6">

      <!-- SKELETON -->
      <template v-if="loading">
        <div>
          <div class="mb-2 h-3 w-20 animate-pulse rounded bg-slate-200" />
          <div class="space-y-2">
            <div v-for="i in 2" :key="'sk-op-' + i" class="h-11 animate-pulse rounded-md bg-slate-100" />
          </div>
        </div>
        <div>
          <div class="mb-2 h-3 w-24 animate-pulse rounded bg-slate-200" />
          <div class="space-y-2">
            <div v-for="i in 4" :key="'sk-u-' + i" class="h-14 animate-pulse rounded-md bg-slate-100" />
          </div>
        </div>
      </template>

      <template v-else>
        <!-- OPERADORES -->
        <div v-if="operators.length">
          <div class="mb-2 flex items-center gap-2">
            <BaseIcon name="Shield" class="!size-3.5 text-amber-500" />
            <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Operadores</span>
          </div>
          <div class="overflow-hidden rounded-md border border-amber-100">
            <div
              v-for="(user, index) in operators"
              :key="'op-' + index"
              class="flex items-center justify-between bg-amber-50 px-3.5 py-2.5"
              :class="index < operators.length - 1 ? 'border-b border-amber-100' : ''"
            >
              <div class="flex items-center gap-2.5">
                <div class="flex h-7 w-7 items-center justify-center rounded-full bg-amber-200 text-[11px] font-bold text-amber-700">
                  {{ initials(user.user) }}
                </div>
                <span class="text-sm font-medium text-slate-800">{{ user.user }}</span>
              </div>
              <WaBadge :active="user.whatsappOptedIn" />
            </div>
          </div>
        </div>

        <!-- COLABORADORES -->
        <div v-if="collaborators.length">
          <div class="mb-2 flex items-center gap-2">
            <BaseIcon name="Users" class="!size-3.5 text-slate-400" />
            <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Colaboradores</span>
          </div>
          <div class="overflow-hidden rounded-md border border-slate-200">
            <div
              v-for="(user, index) in collaborators"
              :key="'user-' + index"
              class="flex items-center justify-between bg-white px-3.5 py-2.5"
              :class="index < collaborators.length - 1 ? 'border-b border-slate-100' : ''"
            >
              <div class="flex items-center gap-2.5">
                <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-500">
                  {{ initials(user.user) }}
                </div>
                <div>
                  <p class="text-sm font-medium text-slate-800">{{ user.user }}</p>
                  <div class="mt-1 flex flex-wrap gap-1">
                    <span
                      v-for="pos in user.positions"
                      :key="pos"
                      class="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500"
                    >{{ pos }}</span>
                  </div>
                </div>
              </div>
              <WaBadge :active="user.whatsappOptedIn" />
            </div>
          </div>
        </div>

        <!-- EMPTY STATE -->
        <div
          v-if="!operators.length && !collaborators.length"
          class="flex flex-col items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 py-10 text-center"
        >
          <BaseIcon name="Users" class="!size-8 text-slate-300" />
          <p class="mt-3 text-sm font-medium text-slate-500">Nenhum colaborador neste time</p>
          <p class="mt-1 text-xs text-slate-400">Aloque colaboradores na aba de edição.</p>
        </div>
      </template>

    </div>
  </Drawer>
</template>

<script>
import Drawer from '@/components/drawer/Drawer.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { useTeamStore } from '@/modules/users/store/team';

const WaBadge = {
  components: { BaseIcon },
  props: { active: { type: Boolean, default: false } },
  template: `
    <span
      class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      :class="active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'"
      :title="active ? 'WhatsApp ativo' : 'WhatsApp inativo'"
    >
      <BaseIcon name="WhatsApp" class="!h-2.5 !w-2.5" />
      WA
    </span>
  `
};

export default {
  components: { Drawer, BaseIcon, WaBadge },
  data() {
    return { users: [], loading: false };
  },
  computed: {
    teamStore: () => useTeamStore(),
    operators() {
      return this.users
        .filter(u => u.profile !== 'user')
        .filter((u, i, arr) => arr.findIndex(x => x.user === u.user) === i);
    },
    collaborators() {
      const map = {};
      this.users.forEach(u => {
        if (!map[u.user]) {
          map[u.user] = { user: u.user, profile: u.profile, whatsappOptedIn: u.whatsappOptedIn, positions: [] };
        }
        if (u.position) map[u.user].positions.push(u.position);
      });
      return Object.values(map);
    }
  },
  methods: {
    initials(name) {
      return (name || '')
        .split(' ')
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase();
    },
    async fetchUsers() {
      this.loading = true;
      try {
        this.users = await this.axios.get(`/teams/${this.teamStore.team.id}/responsibilities`);
      } catch (e) {
        console.error('Erro ao buscar usuários do time', e);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
