<template>
  <div class="flex w-full flex-col gap-2">
    <div
      class="mb-6 flex w-full flex-wrap md:flex-nowrap"
      :class="{ 'gap-4': $can.canAccess('operator') }"
    >
      <div class="size-auto w-full grow">
        <FormInput
          v-model="search"
          placeholder="Digite para pesquisar"
          class="w-full"
          icon="search"
        />
      </div>
      <div v-if="$can.canAccess('operator')" class="group/add relative w-full md:w-auto">
        <BaseButton
          icon="plus"
          :disabled="operatorBlocked"
          :class="operatorBlocked ? 'opacity-50 cursor-not-allowed' : ''"
          @click="addTeam()"
        >
          Adicionar
        </BaseButton>
        <div v-if="operatorBlocked" class="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-lg bg-gray-800 px-3 py-2 text-center text-xs leading-snug text-white opacity-0 group-hover/add:opacity-100 transition-opacity duration-150 shadow-lg z-50 whitespace-normal">
          Fale com o administrador para adicionar novas equipes.
          <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </div>
      </div>
    </div>

    <div
      v-if="teamStore.getTeams.length > 1"
      class="flex w-full justify-end text-sm text-gray-500"
    >
      Total de equipes: {{ teamStore.getTeams.length }}
    </div>

    <SkeletonRows v-if="loading" :rows="3" has-trailing class="w-full" />

    <template v-else-if="filteredTeam.length >= 1">
      <CardRow
        v-for="(team, index) in filteredTeam"
        :key="index"
      >
        <div class="flex items-center gap-2">
          <p class="text-sm font-bold" :class="team.plan_locked ? 'text-slate-400' : 'text-slate-800'">{{ team.name }}</p>
          <span
            v-if="team.plan_locked"
            class="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
          >
            <BaseIcon name="lock-closed" class="h-3 w-3" />
            Suspenso
          </span>
        </div>
        <p class="text-xs text-slate-500">
          {{ team.positions.length }}
          {{ team.positions.length > 1 ? 'Posições Cadastradas' : 'Posição Cadastrada' }}
        </p>

        <template #trailing>
          <div class="flex items-center gap-1">
            <button
              class="cursor-pointer rounded-full p-2 hover:bg-slate-200"
              @click="getUsers(team)"
            >
              <BaseIcon name="users" class="h-4 w-4 text-slate-500" />
            </button>
            <button
              v-if="canManageTeam(team)"
              class="cursor-pointer rounded-full p-2 hover:bg-slate-200"
              @click="editTeam(team)"
            >
              <BaseIcon name="pencil" class="h-4 w-4 text-slate-500" />
            </button>
            <button
              v-if="canManageTeam(team)"
              class="cursor-pointer rounded-full p-2 hover:bg-slate-200"
              @click="removeTeam(team.id)"
            >
              <BaseIcon name="trash" class="h-4 w-4 text-red-400" />
            </button>
          </div>
        </template>
      </CardRow>
    </template>

    <div v-else class="flex w-full justify-center">
      <Empty
        title="Nenhuma Equipe Encontrada"
        class="-mt-12"
        :description="
          $can.canAccess('operator')
            ? 'Crie equipes para organizar seus colaboradores, clique no botão abaixo para começar.'
            : 'Nenhuma equipe foi criada ainda. Entre em contato com o administrador para mais informações.'
        "
      >
        <BaseButton
          v-if="$can.canAccess('operator')"
          icon="plus"
          @click="addTeam()"
        >
          Adicionar
        </BaseButton>
      </Empty>
    </div>
  </div>
</template>

<script>
import BaseButton from '@/components/base/Button';
import BaseIcon from '@/components/icons/BaseIcon';
import CardRow from '@/components/card/CardRow';
import Empty from '@/components/empty/Empty';
import FormInput from '@/components/form/Input';
import SkeletonRows from '@/components/skeleton/SkeletonRows';

import { useConfirmationStore } from '@/components/confirmation/store';
import { useTeamStore } from '@/modules/users/store/team';
import { useAuthStore } from '@/modules/auth/store';

export default {
  components: {
    BaseButton,
    BaseIcon,
    CardRow,
    Empty,
    FormInput,
    SkeletonRows
  },
  data() {
    return {
      loading: true,
      search: ''
    };
  },
  computed: {
    authStore: () => useAuthStore(),
    confirmationStore: () => useConfirmationStore(),
    teamStore: () => useTeamStore(),
    operatorBlocked() {
      return !this.$can.canAccess('admin') && !this.$can.canCreate('teams');
    },
    filteredTeam() {
      const searchTerm = this.search.toLowerCase();

      return this.teamStore.getTeams.filter(user =>
        user.name.toLowerCase().includes(searchTerm)
      );
    }
  },
  mounted() {
    this.getTeams();
  },
  methods: {
    canManageTeam(team) {
      if (this.$can.canAccess('admin')) return true;
      return this.authStore.getManagedTeamIds.includes(team.id);
    },
    async getTeams() {
      try {
        await this.axios.get('teams').then(response => {
          this.teamStore.setTeams(response);
        });
      } finally {
        this.loading = false;
      }
    },
    getUsers(data) {
      this.teamStore.setTeam(data);

      this.drawerStore.setDrawer({
        title: data.name,
        context: 'team-users',
        open: true
      });
    },
    editTeam(data) {
      this.teamStore.setTeam(data);

      this.drawerStore.setDrawer({
        title: 'Editar equipe',
        context: 'team',
        open: true
      });
    },
    removeTeam(id) {
      this.confirmationStore.setConfirmation({
        title: 'Remover essa equipe?',
        description:
          'Tem certeza de que deseja remover essa equipe? Será removida permanentemente. Esta ação não pode ser desfeita.',
        open: true,
        onConfirm: async () => {
          await this.axios.delete(`teams/${id}`).then(response => {
            this.teamStore.setTeams(response);

            this.confirmationStore.close();
          });
        }
      });
    },
    addTeam() {
      if (!this.$can.canCreate('teams')) {
        if (this.$can.canAccess('admin')) this.planStore.setOpen('limit');
        return;
      }
      this.drawerStore.setDrawer({
        title: 'Criar equipe',
        context: 'team',
        open: true
      });
    }
  }
};
</script>
