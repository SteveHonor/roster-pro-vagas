<template>
  <Drawer
    context="user"
    :on-save="submitForm"
    :on-close="handleClose"
    :on-open="fetchTeams"
    :on-exit="handleClose"
    :disabled="v$.userStore.$errors.length || errors.email"
    :action-button-name="
      userStore.user.id ? 'Salvar' : 'Convidar Colaborador'
    "
  >
    <span
      v-if="errors.user"
      class="mb-6 flex w-full rounded border border-red-200 bg-red-50 p-4 text-sm text-red-500"
    >
      {{ errors.user }}
    </span>

    <div class="mb-4">
      <Input
        v-model="userStore.user.name"
        label="Nome*"
        placeholder="Nome do colaborador"
        required
        aria-invalid="true"
        :aria-describedby="v$.userStore.user.name.$error ? 'name-error' : null"
      />
      <span
        v-if="v$.userStore.user.name.$error"
        id="name-error"
        class="ml-1 text-sm text-red-600"
        role="alert"
      >
        Nome do colaborador é obrigatório.
      </span>
    </div>

    <div class="mb-4 grid grid-cols-2 gap-3">
      <div>
        <Input
          v-if="userStore.user.id"
          label="E-mail"
          placeholder="E-mail do colaborador"
          aria-invalid="true"
          :value="userStore.user.email"
          disabled
        />
        <Input
          v-else
          v-model="userStore.user.email"
          label="E-mail*"
          placeholder="E-mail do colaborador"
          required
          aria-invalid="true"
          :aria-describedby="v$.userStore.user.email.$error || errors.email ? 'email-error' : null"
          @blur="() => emailChecker(userStore.user.email)"
        />
        <span v-if="v$.userStore.user.email.$error" class="ml-1 text-xs text-red-600">
          {{ v$.userStore.user.email.$errors[0].$message }}
        </span>
        <span v-if="errors.email && !v$.userStore.user.email.$error" class="ml-1 text-xs text-red-600">
          E-mail já cadastrado em outra instituição
        </span>
      </div>

      <div>
        <Input
          v-model="userStore.user.phone"
          v-mask="['(##) ####-####', '(##) #####-####']"
          label="Celular*"
          placeholder="(##) #####-####"
          :class="{
            'border-red-500': v$.userStore.user.phone.$error || errors.phone,
            'border-gray-200': !v$.userStore.user.phone.$error && !errors.phone
          }"
          required
          aria-invalid="true"
          :aria-describedby="v$.userStore.user.phone.$error || errors.phone ? 'phone-error' : null"
          @input="errors.phone = null"
        />
        <span v-if="v$.userStore.user.phone.$error" id="phone-error" class="ml-1 text-xs text-red-600" role="alert">
          Celular é obrigatório.
        </span>
        <span v-else-if="errors.phone" id="phone-error" class="ml-1 text-xs text-red-600" role="alert">
          {{ errors.phone }}
        </span>
      </div>
    </div>

    <div v-if="$can.canAccess('operator') && !isEditingSelf" class="mb-4">
      <span class="mb-2 block text-sm font-medium text-gray-700">Perfil*</span>
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="role in roles"
          :key="role.value"
          type="button"
          :class="[
            'flex flex-col gap-1.5 rounded-md border p-3 text-left transition-all',
            userStore.user.profile === role.value
              ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
              : isRoleLocked(role)
                ? 'border-gray-200 bg-gray-50 opacity-70 cursor-not-allowed'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
          ]"
          @click="selectRole(role)"
        >
          <!-- Linha 1: ícone + label + tooltip -->
          <div class="flex items-center gap-1.5">
            <BaseIcon
              :name="isRoleLocked(role) ? 'LockClosed' : role.icon"
              :class="[
                '!size-4 flex-shrink-0',
                userStore.user.profile === role.value
                  ? 'text-blue-600'
                  : isRoleLocked(role) ? 'text-amber-400' : 'text-gray-400'
              ]"
            />
            <span
              :class="[
                'text-sm font-semibold leading-none',
                userStore.user.profile === role.value ? 'text-blue-700' : 'text-gray-800'
              ]"
            >{{ role.label }}</span>
            <div class="group/tip relative ml-auto flex-shrink-0" @click.stop>
              <span class="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-gray-300 text-[9px] font-bold leading-none text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors">?</span>
              <div class="pointer-events-none absolute bottom-full right-0 mb-2 w-44 rounded-lg bg-gray-800 px-2.5 py-2 text-xs leading-snug text-white opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 shadow-lg z-50">
                {{ role.description }}
                <div class="absolute top-full right-2 border-4 border-transparent border-t-gray-800" />
              </div>
            </div>
          </div>

          <!-- Linha 2: restrito — upsell -->
          <span
            v-if="isRoleLocked(role)"
            class="flex w-fit items-center gap-1 rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-semibold text-orange-500"
          >
            <BaseIcon name="Sparkles" class="!size-2.5" />
            Limite atingido — upgrade para liberar
          </span>
        </button>
      </div>
      <span
        v-if="v$.userStore.user.profile.$error"
        id="profile-error"
        class="ml-1 mt-1 block text-sm text-red-600"
        role="alert"
      >
        Perfil é obrigatório.
      </span>
      <div
        v-if="managedTeamsWarning"
        class="mt-2 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700"
      >
        <BaseIcon name="Exclamation" class="!size-3.5 shrink-0 text-amber-500" />
        As equipes gerenciadas serão removidas ao salvar.
      </div>
    </div>
    <div v-else class="mb-4">
      <span class="mb-2 block text-sm font-medium text-gray-700">Perfil</span>
      <div class="grid grid-cols-3 gap-2">
        <div
          v-for="role in roles"
          :key="role.value"
          :class="[
            'flex items-center gap-1.5 rounded-md border p-3',
            userStore.user.profile === role.value
              ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
              : 'border-gray-200 bg-gray-50 opacity-40'
          ]"
        >
          <BaseIcon
            :name="role.icon"
            :class="[
              'h-4 w-4 flex-shrink-0',
              userStore.user.profile === role.value ? 'text-blue-600' : 'text-gray-400'
            ]"
          />
          <span
            :class="[
              'text-sm font-semibold leading-none',
              userStore.user.profile === role.value ? 'text-blue-700' : 'text-gray-800'
            ]"
          >{{ role.label }}</span>

          <!-- Tooltip -->
          <div class="group/tip relative ml-auto flex-shrink-0">
            <span class="flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-gray-300 text-[9px] font-bold leading-none text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors">?</span>
            <div class="pointer-events-none absolute bottom-full right-0 mb-2 w-44 rounded-lg bg-gray-800 px-2.5 py-2 text-xs leading-snug text-white opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 shadow-lg z-50">
              {{ role.description }}
              <div class="absolute top-full right-2 border-4 border-transparent border-t-gray-800" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Divisor entre Perfil e seções contextuais -->
    <div v-if="userStore.user.profile" class="mb-6 flex items-center gap-3">
      <div class="h-px flex-1 bg-gray-100" />
    </div>

    <!-- Permissões do administrador -->
    <div v-if="userStore.user.profile === 'admin' && !isEditingSelf && canManageAdmins" class="mb-6">
      <div class="mb-3 flex items-center gap-3">
        <div class="h-px flex-1 bg-gray-100" />
        <span class="text-[10px] font-semibold uppercase tracking-widest text-gray-300">Acesso</span>
        <div class="h-px flex-1 bg-gray-100" />
      </div>
      <AdminPermissionsForm v-model="adminPermissions" />
    </div>

    <!-- Equipes gerenciadas (apenas operadores) -->
    <div v-if="userStore.user.profile === 'operator' && $can.canAccess('admin')" class="mb-6">
      <div class="mb-3 flex items-start gap-2">
        <div class="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50">
          <BaseIcon name="Shield" class="h-3.5 w-3.5 text-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-800">Equipes gerenciadas</label>
          <p class="text-xs text-gray-500">Escopo de acesso — o operador só visualiza e age nas escalas destas equipes.</p>
        </div>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div v-if="managedTeams.length" class="divide-y divide-gray-100">
          <div
            v-for="(team, idx) in managedTeams"
            :key="team.id"
            class="flex items-center justify-between px-3.5 py-2.5"
          >
            <div class="flex items-center gap-2">
              <div class="h-2 w-2 rounded-full bg-indigo-400" />
              <span class="text-sm font-medium text-gray-800">{{ team.name }}</span>
            </div>
            <button type="button" class="rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-400 transition-colors" @click="removeManagedTeam(idx)">
              <BaseIcon name="trash" class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div v-else class="px-3.5 py-3 text-xs text-gray-400 italic">
          {{ teams.length === 0
            ? 'Você ainda não tem equipes criadas. Salve o líder agora e vincule as equipes depois.'
            : 'Nenhuma equipe vinculada a este líder ainda.' }}
        </div>

        <div class="flex gap-2 border-t border-gray-100 bg-gray-50 p-2.5">
          <div class="flex-1">
            <Select
              v-model="selectedManagedTeam"
              :revert-color="true"
              placeholder="Adicionar equipe"
              :options="availableManagedTeams.map(t => ({ value: t.id, label: t.name }))"
            />
          </div>
          <button
            type="button"
            class="flex items-center justify-center rounded-lg btn-brand px-3 py-2"
            @click="addManagedTeam"
          >
            <BaseIcon name="plus" class="h-4 w-4" />
          </button>
        </div>
      </div>
      <span v-if="errors.managedTeams" class="mt-1.5 block text-xs text-red-500">{{ errors.managedTeams }}</span>
    </div>

    <!-- Separador visual -->
    <div v-if="$can.canAccess('operator')" class="mb-6 flex items-center gap-3">
      <div class="h-px flex-1 bg-gray-100" />
      <span class="text-[10px] font-semibold uppercase tracking-widest text-gray-300">Alocação</span>
      <div class="h-px flex-1 bg-gray-100" />
    </div>

    <!-- Equipes e Posições -->
    <div v-if="$can.canAccess('operator')" class="mb-4">
      <div class="mb-3 flex items-start gap-2">
        <div class="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <BaseIcon name="Briefcase" class="h-3.5 w-3.5 text-slate-500" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-800">Equipes e Posições</label>
          <p class="text-xs text-gray-500">Em quais equipes e funções este colaborador atua.</p>
        </div>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div v-if="userStore.getResponsibilities.length" class="divide-y divide-gray-100">
          <div
            v-for="(resp, idx) in userStore.getResponsibilities"
            :key="idx"
            class="flex items-center justify-between px-3.5 py-2.5"
          >
            <div class="flex items-center gap-2">
              <div class="h-2 w-2 rounded-full bg-slate-300" />
              <span class="text-sm font-medium text-gray-800">{{ resp.team?.name }}</span>
              <span v-if="resp.position" class="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{{ resp.position.name }}</span>
            </div>
            <button
              type="button"
              class="rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-400 transition-colors"
              @click="removeResponsibility(idx, resp.id)"
            >
              <BaseIcon name="trash" class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <div v-else class="px-3.5 py-3 text-xs text-gray-400 italic">Nenhuma alocação adicionada.</div>

        <div class="border-t border-gray-100 bg-gray-50 p-2.5">
          <div class="flex flex-wrap gap-2 md:flex-nowrap">
            <div class="w-full md:flex-1">
              <Select
                v-model="selectedTeam"
                :revert-color="true"
                placeholder="Escolha a equipe"
                :options="teams.map(t => ({ value: t.id, label: t.name }))"
                @change="fetchPositionsForTeam"
              />
            </div>
            <div class="w-full md:flex-1">
              <Select
                v-model="selectedPosition"
                :revert-color="true"
                placeholder="Escolha a posição"
                :options="filteredPositions.map(p => ({ value: p.id, label: p.name }))"
              />
            </div>
            <button
              type="button"
              class="flex w-full items-center justify-center rounded-lg btn-brand p-2 md:w-11"
              @click="addResponsibility"
            >
              <BaseIcon name="plus" class="h-4 w-4" />
            </button>
          </div>
          <span v-if="errors.positions" class="mt-1.5 block text-xs text-red-500">{{ errors.positions }}</span>
        </div>
      </div>
    </div>

    <div
      class="mt-4 rounded border border-blue-100 bg-blue-50 p-3 text-xs text-blue-700"
    >
      Os dados do colaborador serão usados exclusivamente para gestão de escalas
      nesta plataforma. Um convite por e-mail será enviado para que o
      colaborador confirme o acesso.
    </div>
  </Drawer>
</template>

<script>
import Drawer from '@/components/drawer/Drawer';
import BaseIcon from '@/components/icons/BaseIcon';
import Input from '@/components/form/Input';
import Select from '@/components/form/Select';
import AdminPermissionsForm from '@/modules/users/components/AdminPermissionsForm';

import useVuelidate from '@vuelidate/core';
import { track, EVENTS } from '@/analytics';

import { required, helpers } from '@vuelidate/validators';
import { useUserStore } from '@/modules/users/store/user';
import { useCompanyStore } from '@/modules/users/store/company';
import { useTeamStore } from '@/modules/users/store/team';
import { useAuthStore } from '@/modules/auth/store';
import { useOnboardingStore } from '@/components/onboarding/store';
import { usePlanStore } from '@/components/plan/store';

export default {
  components: {
    Drawer,
    BaseIcon,
    AdminPermissionsForm,
    Input,
    Select
  },
  setup() {
    return { v$: useVuelidate() };
  },
  data() {
    return {
      selectedTeam: '',
      selectedPosition: '',
      selectedManagedTeam: '',
      managedTeams: [],
      managedTeamsWarning: false,
      teams: [],
      adminPermissions: {
        billing: false,
        members: false,
        schedules: false,
        approvals: false,
        analytics: false,
        integrations: false,
        branding: false,
        manage_admins: false
      },
      errors: {
        user: '',
        phone: null,
        teams: '',
        positions: '',
        managedTeams: '',
        email: null
      },
      roles: [
        {
          value: 'user',
          label: 'Usuário',
          icon: 'User',
          description: 'Acessa o app, vê sua própria escala e gerencia disponibilidade.'
        },
        {
          value: 'operator',
          label: 'Operador',
          icon: 'Tool',
          description: 'Cria e gerencia escalas, equipes e posições da empresa.'
        },
        {
          value: 'admin',
          label: 'Administrador',
          icon: 'Star',
          description: 'Acesso total: usuários, billing e configurações.'
        }
      ]
    };
  },
  validations() {
    return {
      userStore: {
        user: {
          name: { required },
          email: {
            required: helpers.withMessage('E-mail é obrigatório.', required),
            emailExists: helpers.withMessage(
              'Este e-mail já está cadastrado.',
              value => {
                if (!value) return true;
                if (!Array.isArray(this.userStore.users)) return true;
                if (this.userStore?.user?.id) return true;

                this.errors.email = false;

                return !this.userStore.users.some(user => user.email === value);
              }
            )
          },
          phone: { required },
          profile: { required }
        }
      }
    };
  },
  computed: {
    teamStore: () => useTeamStore(),
    userStore: () => useUserStore(),
    companyStore: () => useCompanyStore(),
    authStore: () => useAuthStore(),
    onboardingStore: () => useOnboardingStore(),
    planStore: () => usePlanStore(),
    isEditingSelf() {
      const isSelf = this.userStore.user?.id &&
        // eslint-disable-next-line eqeqeq
        this.userStore.user.id == this.authStore.me?.id;
      return isSelf || this.userStore.user?.owner === true;
    },
    canManageAdmins() {
      return this.$can.canManage('manage_admins');
    },
    availableManagedTeams() {
      const selectedIds = this.managedTeams.map(t => t.id);
      return this.teams.filter(t => !selectedIds.includes(t.id));
    },
    filteredPositions() {
      const team = this.teams.find(t => t.id === this.selectedTeam);
      const allPositions = team?.positions || [];
      const usedIds = this.userStore.getResponsibilities
        .filter(r => r.team?.id === this.selectedTeam)
        .map(r => r.position?.id);
      return allPositions.filter(p => !usedIds.includes(p.id));
    }
  },
  methods: {
    isRoleLocked(role) {
      if (role.value !== 'admin') return false;
      if (!this.$can.canAccess('admin')) return true;
      const isExistingAdmin = this.userStore.user.id && this.userStore.user.profile === 'admin';
      return !isExistingAdmin && !this.$can.canCreate('admins');
    },
    selectRole(role) {
      if (this.isRoleLocked(role)) {
        this.planStore.setOpen('upgrade');
        return;
      }
      if (this.userStore.user.profile === 'operator' && role.value !== 'operator') {
        this.managedTeams = [];
        this.managedTeamsWarning = true;
      } else {
        this.managedTeamsWarning = false;
      }
      this.userStore.user.profile = role.value;
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
    async emailChecker(email) {
      await this.axios
        .post('/email-checker', {
          email: email
        })
        .then(response => {
          if (response === 'found') {
            this.errors.email = true;
          } else {
            this.errors.email = false;
          }
        })
        .then(() => this.v$.userStore.user.email.$touch());
    },
    async fetchTeams() {
      try {
        const teams = await this.axios.get('/teams');
        this.teams = teams;

        const ids = (this.userStore.user.managedTeamIds ?? []).map(String);
        this.managedTeams = teams.filter(t => ids.includes(String(t.id)));

        if (this.userStore.user.profile === 'admin' && this.userStore.user.adminPermissions) {
          const raw = this.userStore.user.adminPermissions;
          this.adminPermissions = {
            ...this.adminPermissions,
            ...raw,
            manage_admins: raw.manageAdmins ?? raw.manage_admins ?? false
          };
          delete this.adminPermissions.manageAdmins;
        }
      } catch (error) {
        console.error('Erro ao carregar times', error);
      }
    },

    addManagedTeam() {
      if (!this.selectedManagedTeam) return;
      const team = this.teams.find(t => t.id === this.selectedManagedTeam);
      if (!team) return;
      this.managedTeams.push(team);
      this.selectedManagedTeam = '';
      this.errors.managedTeams = '';
    },

    removeManagedTeam(idx) {
      this.managedTeams.splice(idx, 1);
    },
    // Função para carregar as posições de um time específico
    fetchPositionsForTeam() {
      this.selectedPosition = '';
    },

    // Função para adicionar a posição ao time
    addResponsibility() {
      if (!this.selectedTeam || !this.selectedPosition) return;

      const responsibilities = this.userStore.getResponsibilities;

      const alreadyExists = responsibilities.some(
        ({ team, position }) =>
          team?.id === this.selectedTeam &&
          position?.id === this.selectedPosition
      );

      if (alreadyExists) {
        this.errors.positions =
          'Essa posição já foi adicionada para este time.';
        return;
      }

      this.errors.positions = '';

      const team = this.teams.find(({ id }) => id === this.selectedTeam);
      if (!team) return;

      const position = team.positions.find(
        ({ id }) => id === this.selectedPosition
      );
      if (!position) return;

      this.userStore.setResponsibility([
        ...responsibilities,
        {
          team: { id: team.id, name: team.name },
          position: { id: position.id, name: position.name }
        }
      ]);

      this.selectedPosition = '';
    },
    removeResponsibility(responsibilityIndex, id) {
      this.userStore.removeResponsibility(responsibilityIndex, id);
    },
    submitForm() {
      if (this.selectedTeam?.id && this.selectedPosition?.id) {
        this.addResponsibility();
      }

      return this.userStore.user.id ? this.update() : this.create();
    },
    handleClose() {
      this.errors.email = false;
      this.errors.phone = null;
      this.errors.positions = '';
      this.errors.managedTeams = '';
      this.errors.user = '';
      this.selectedTeam = '';
      this.selectedPosition = '';
      this.selectedManagedTeam = '';
      this.managedTeams = [];
      this.managedTeamsWarning = false;
      this.adminPermissions = {
        billing: false, members: false, schedules: false, approvals: false,
        analytics: false, integrations: false, branding: false, manage_admins: false
      };
      this.userStore.resetUser();
      this.v$.$reset();
    },

    async create() {
      const result = await this.v$.$validate();

      if (result) {
        await this.axios
          .post('users', {
            user: this.userStore.user,
            responsibilities: this.userStore.getResponsibilities,
            operator_team_ids: this.userStore.user.profile === 'operator'
              ? this.managedTeams.map(t => t.id)
              : [],
            admin_permissions: this.userStore.user.profile === 'admin'
              ? this.adminPermissions
              : undefined
          })
          .then(response => {
            track(EVENTS.USER_INVITED, { profile: this.userStore.user?.profile });
            this.onboardingStore.setMemberInvited();

            this.drawerStore.close();

            this.userStore.resetUser();

            this.userStore.setUsers(response);

            this.v$.$reset();

            this.handleClose();
          })
          .catch(error => {
            if (error?.response?.data?.reason === 'create?') {
              this.errors.user = 'Limite de colaboradores atingido. Fale com o administrador.';
              return;
            }
            const data = error?.response?.data;
            if (data?.phone?.[0]) {
              this.errors.phone = data.phone[0];
              return;
            }
            this.errors.user = data?.email?.[0]
              || data?.base?.[0]
              || data?.error
              || 'Erro ao salvar. Tente novamente.';
          });
      }
    },
    async update() {
      const result = await this.v$.$validate();

      if (result) {
        await this.axios
          .put(`users/${this.userStore.user.id}`, {
            user: this.userStore.user,
            responsibilities: this.userStore.getResponsibilities,
            removed: this.userStore.getRemoved,
            operator_team_ids: this.userStore.user.profile === 'operator'
              ? this.managedTeams.map(t => t.id)
              : [],
            admin_permissions: this.userStore.user.profile === 'admin'
              ? this.adminPermissions
              : undefined
          })
          .then(response => {
            this.drawerStore.onSave('user');
            this.drawerStore.close();

            this.userStore.resetUser();
            this.userStore.setUsers(response);

            this.v$.$reset();

            this.handleClose();
          })
          .catch(error => {
            if (error?.response?.data?.reason === 'update?') {
              this.errors.user =
                'Ops! Você não tem permissão para editar este colaborador.';
            }
          });
      }
    }
  }
};
</script>
