<template>
  <div class="flex w-full flex-col gap-2">
    <!-- Search + Button -->
    <div
class="mb-5 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      :class="{ 'sm:gap-4': $can.canAccess('operator') }">
      <FormInput v-model="search" placeholder="Digite para pesquisar" class="w-full" icon="search" />

      <BaseButton v-if="$can.canAccess('operator')" icon="plus" @click="addUser()">
        Convidar
      </BaseButton>
    </div>

    <!-- Total + toggle inativos -->
    <div v-if="userStore.getUsers.length > 1" class="flex w-full items-center justify-between text-xs text-gray-500">
      <button
        v-if="inactiveUsers.length > 0"
        class="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors"
        :class="showInactive
          ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
          : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'"
        @click="showInactive = !showInactive"
      >
        <BaseIcon name="ArrowPath" class="!size-3.5" />
        {{ showInactive ? 'Ocultar inativos' : `Ver inativos (${inactiveUsers.length})` }}
      </button>
      <span v-else />
      <span>Total de colaboradores: {{ filteredUsers.length }}</span>
    </div>

    <SkeletonRows v-if="loading" :rows="4" has-trailing class="w-full" />

    <CardRow
      v-for="user in filteredUsers"
      v-else
      :key="user.id"
    >
      <div class="flex flex-col gap-1">
        <span class="text-sm font-bold capitalize text-slate-800">{{ user.name }}</span>
        <div class="flex flex-wrap gap-1">
          <span class="rounded border border-slate-100 bg-white px-2 py-0.5 text-xs text-slate-600">{{ user.email }}</span>
          <span class="rounded border border-slate-100 bg-white px-2 py-0.5 text-xs text-slate-600">{{ user.phone }}</span>
          <span class="rounded border border-slate-100 bg-white px-2 py-0.5 text-xs" :class="handleProfile(user.profile)?.color">
            {{ handleProfile(user.profile)?.name }}
          </span>
        </div>
      </div>

      <template #trailing>
        <div class="flex items-center gap-1">
          <span
            v-if="user.plan_locked"
            class="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1.5 text-xs font-medium text-amber-700"
          >
            <BaseIcon name="lock-closed" class="h-3.5 w-3.5" />
            <span class="hidden md:block">Suspenso pelo plano</span>
          </span>
          <button
            v-if="authStore.user.id != user.id && !user.plan_locked"
            class="flex items-center gap-1.5 rounded-full bg-white px-2 py-1.5 text-xs"
            :class="handleStatus(user.status)?.color"
          >
            <BaseIcon :name="handleStatus(user.status)?.icon" class="h-4 w-4" />
            <span class="hidden md:block">{{ handleStatus(user.status)?.name }}</span>
          </button>

          <button
            v-if="authStore.user.id != user.id && user.status == 'active'"
            class="flex items-center gap-1.5 rounded-full bg-white px-2 py-1.5 text-xs text-orange-600"
            @click="feedback(user)"
          >
            <BaseIcon name="heart" class="h-4 w-4" />
            <span class="hidden md:block">Avaliar</span>
          </button>

          <button
            v-if="handleEditPermissions(user)"
            class="cursor-pointer rounded-full p-2 hover:bg-slate-200"
            @click="editUser(user)"
          >
            <BaseIcon name="pencil" class="h-4 w-4 text-slate-500" />
          </button>

          <button
            v-if="handlePermissions(user) && user.status !== 'inactive'"
            class="cursor-pointer rounded-full p-2 hover:bg-slate-200"
            title="Desativar colaborador"
            @click="deactivateUser(user)"
          >
            <BaseIcon name="trash" class="h-4 w-4 text-red-400" />
          </button>

          <button
            v-if="handlePermissions(user) && user.status === 'inactive'"
            class="cursor-pointer rounded-full p-2 hover:bg-slate-200"
            title="Reativar colaborador"
            @click="reactivateUser(user)"
          >
            <BaseIcon name="ArrowPath" class="h-4 w-4 text-green-500" />
          </button>
        </div>
      </template>
    </CardRow>

    <!-- Inativos -->
    <template v-if="showInactive && inactiveUsers.length > 0">
      <div class="mt-2 flex items-center gap-2">
        <div class="h-px flex-1 bg-gray-100" />
        <span class="text-xs font-medium text-gray-400 uppercase tracking-wider">Inativos</span>
        <div class="h-px flex-1 bg-gray-100" />
      </div>

      <CardRow v-for="user in inactiveUsers" :key="user.id">
        <div class="flex flex-col gap-1 opacity-50">
          <span class="flex items-center gap-3 text-sm font-bold capitalize text-slate-500">
            {{ user.name }}
          </span>
          <div class="flex flex-wrap gap-1">
            <span class="rounded border border-slate-100 bg-white px-2 py-0.5 text-xs text-slate-400">{{ user.email }}</span>
            <span class="rounded border border-slate-100 bg-white px-2 py-0.5 text-xs text-slate-400">{{ handleProfile(user.profile)?.name }}</span>
          </div>
        </div>

        <template #trailing>
          <div v-if="handlePermissions(user)" class="flex items-center gap-2">
            <button
              class="flex items-center gap-1.5 rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 transition hover:bg-green-100"
              @click="reactivateUser(user)"
            >
              <BaseIcon name="ArrowPath" class="!size-3.5" />
              Reativar
            </button>
            <button
              class="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              @click="archiveUser(user)"
            >
              <BaseIcon name="ArchiveBox" class="!size-3.5" />
              Arquivar
            </button>
          </div>
        </template>
      </CardRow>
    </template>

    <!-- Arquivados -->
    <template v-if="showInactive && archivedUsers.length > 0">
      <div class="mt-2 flex items-center gap-2">
        <div class="h-px flex-1 bg-red-100" />
        <span class="text-xs font-medium text-red-400 uppercase tracking-wider">Arquivados — LGPD</span>
        <div class="h-px flex-1 bg-red-100" />
      </div>

      <CardRow v-for="user in archivedUsers" :key="user.id" class="border-red-100 bg-red-50/30">
        <div class="flex flex-col gap-1 opacity-60">
          <span class="text-sm font-bold capitalize text-slate-500">{{ user.name }}</span>
          <div class="flex flex-wrap items-center gap-1">
            <span class="rounded border border-slate-100 bg-white px-2 py-0.5 text-xs text-slate-400">{{ user.email }}</span>
            <span class="rounded border border-red-100 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-500">
              Será removido em {{ user.daysUntilRemoval }} dia{{ user.daysUntilRemoval === 1 ? '' : 's' }} de acordo com a LGPD
            </span>
          </div>
        </div>

        <template #trailing>
          <button
            v-if="handlePermissions(user)"
            class="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
            @click="unarchiveUser(user)"
          >
            <BaseIcon name="ArrowPath" class="!size-3.5" />
            Cancelar arquivamento
          </button>
        </template>
      </CardRow>
    </template>

    <FeedbackForm />
  </div>
</template>

<script>
import BaseButton from '@/components/base/Button';
import BaseIcon from '@/components/icons/BaseIcon';
import CardRow from '@/components/card/CardRow';
import FeedbackForm from '@/components/feedback/Feedback';
import FormInput from '@/components/form/Input';
import SkeletonRows from '@/components/skeleton/SkeletonRows';

import { useConfirmationStore } from '@/components/confirmation/store';
import { useFeedbackStore } from '@/components/feedback/store';
import { useUserStore } from '@/modules/users/store/user';
import { useAuthStore } from '@/modules/auth/store';

export default {
  components: {
    BaseButton,
    BaseIcon,
    CardRow,
    FeedbackForm,
    FormInput,
    SkeletonRows
  },
  data() {
    return {
      loading: true,
      search: '',
      showInactive: false
    };
  },
  computed: {
    confirmationStore: () => useConfirmationStore(),
    feedbackStore: () => useFeedbackStore(),
    userStore: () => useUserStore(),
    authStore: () => useAuthStore(),
    inactiveUsers() {
      return this.userStore.getUsers.filter(u => u.status === 'inactive' && !u.archivedAt);
    },
    archivedUsers() {
      return this.userStore.getUsers.filter(u => u.archivedAt);
    },
    filteredUsers() {
      const searchTerm = this.search.toLowerCase();

      return this.userStore.getUsers.filter(
        user =>
          user.status !== 'inactive' &&
          (user.name.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          user.profile.toLowerCase().includes(searchTerm) ||
          user.phone.toLowerCase().includes(searchTerm))
      );
    }
  },
  mounted() {
    this.getUsers();
  },
  methods: {
    async getUsers() {
      try {
        await this.axios.get('users').then(response => {
          this.userStore.setUsers(response);
        });
      } finally {
        this.loading = false;
      }
    },
    async block(user) {
      await this.axios
        .put(`users/${user.id}`, {
          status: user.status === 'blocked' ? 'active' : 'blocked'
        })
        .then(response => {
          this.userStore.setUsers(response);
        });
    },
    handleStatus(status) {
      const handle = {
        active: {
          name: 'Ativo',
          color: 'bg-white text-gray-600',
          icon: 'check'
        },
        blocked: {
          name: 'Bloqueado',
          color: 'bg-white text-red-600',
          icon: 'lock-closed'
        },
        waiting: {
          name: 'Aguardando Cadastro',
          color: 'bg-white text-orange-600',
          icon: 'clock'
        },
        inactive: {
          name: 'Inativo',
          color: 'bg-white text-gray-400',
          icon: 'lock-closed'
        }
      };

      return handle[status];
    },
    handleProfile(profile) {
      const handle = {
        user: {
          name: 'colaborador',
          color: 'text-gray-900'
        },
        operator: {
          name: 'operador',
          color: 'text-yellow-600'
        },
        admin: {
          name: 'administrador',
          color: 'text-gray-600'
        }
      };
      return handle[profile];
    },
    editUser(data) {
      this.userStore.setUser(data);

      this.drawerStore.setDrawer({
        title: 'Editar colaborador',
        context: 'user',
        open: true
      });
    },
    deactivateUser(user) {
      if (user.owner === true) return;
      const id = user.id;

      this.confirmationStore.setConfirmation({
        title: `Desativar ${user.name}?`,
        description: `${user.name} deixará de ter acesso, mas todo o histórico de escalas fica guardado. Você pode reativar quando quiser.`,
        open: true,
        onConfirm: async () => {
          await this.axios.patch(`users/${id}/deactivate`).then(response => {
            this.userStore.setUsers(response);
            this.confirmationStore.close();
          });
        },
        close: () => { this.confirmationStore.close(); }
      });
    },
    reactivateUser(user) {
      const id = user.id;

      this.confirmationStore.setConfirmation({
        title: `Reativar ${user.name}?`,
        description: `${user.name} voltará a ter acesso normalmente. As equipes e histórico continuam intactos.`,
        open: true,
        onConfirm: async () => {
          await this.axios.patch(`users/${id}/reactivate_member`).then(response => {
            this.userStore.setUsers(response);
            this.confirmationStore.close();
          });
        },
        close: () => { this.confirmationStore.close(); }
      });
    },
    archiveUser(user) {
      const id = user.id;

      this.confirmationStore.setConfirmation({
        title: `Arquivar ${user.name}?`,
        description: `Os dados de ${user.name} serão mantidos por 6 meses e removidos automaticamente em seguida, conforme a LGPD. Você pode cancelar o arquivamento a qualquer momento antes da remoção.`,
        open: true,
        confirmText: 'Arquivar',
        onConfirm: async () => {
          await this.axios.patch(`users/${id}/archive`).then(response => {
            this.userStore.setUsers(response);
            this.confirmationStore.close();
          });
        },
        close: () => { this.confirmationStore.close(); }
      });
    },
    unarchiveUser(user) {
      const id = user.id;

      this.confirmationStore.setConfirmation({
        title: `Cancelar arquivamento de ${user.name}?`,
        description: `${user.name} voltará para a lista de inativos. Os dados não serão removidos automaticamente.`,
        open: true,
        onConfirm: async () => {
          await this.axios.patch(`users/${id}/unarchive`).then(response => {
            this.userStore.setUsers(response);
            this.confirmationStore.close();
          });
        },
        close: () => { this.confirmationStore.close(); }
      });
    },
    addUser() {
      this.drawerStore.setDrawer({
        title: 'Convidar colaborador',
        context: 'user',
        open: true
      });
    },
    handlePermissions(user) {
      const loggedUser = this.authStore.user;

      const sameUser = user.id === loggedUser.id;
      if (sameUser) return false;

      const targetProfile = user.profile;

      const isOperatorPrivilege = this.$can.canAccess('operator');
      const isAdminPrivilege = this.$can.canAccess('admin');

      const loggedIsOwner = loggedUser.owner === true;
      const targetIsOwner = user.owner === true;

      // Owner não pode ser deletado por ninguém
      if (targetIsOwner) return false;

      // Usuários comuns
      if (targetProfile === 'user') {
        return isOperatorPrivilege;
      }

      // Operadores
      if (targetProfile === 'operator') {
        return isAdminPrivilege;
      }

      // Admins
      if (targetProfile === 'admin') {
        return isAdminPrivilege && loggedIsOwner;
      }

      return false;
    },
    handleEditPermissions(user) {
      const loggedUser = this.authStore.user;

      const sameUser = user.id === loggedUser.id;
      if (sameUser) return true;

      const targetProfile = user.profile;

      const isAdminPrivilege = this.$can.canAccess('admin');

      const loggedIsOwner = loggedUser.owner === true;
      const targetIsOwner = user.owner === true;

      // Owner não pode ser editado
      if (targetIsOwner) return false;

      if (targetProfile === 'user') {
        return isAdminPrivilege;
      }

      if (targetProfile === 'operator') {
        return isAdminPrivilege;
      }

      if (targetProfile === 'admin') {
        return isAdminPrivilege && loggedIsOwner;
      }

      return false;
    },
    feedback(user) {
      this.feedbackStore.setUserId(user.id);

      this.drawerStore.setDrawer({
        title: `Avaliar: ${user.name}`,
        context: 'feedback',
        open: true,
        onSave: () => {
          this.getUsers();
        }
      });
    }
  }
};
</script>
