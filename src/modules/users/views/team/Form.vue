<template>
  <Drawer
    context="team"
    :on-save="$can.canAccess('operator') ? submitForm : false"
    :on-open="fetchOperators"
    :on-exit="reset"
    :on-close="reset"
  >
    <div class="mb-6">
      <label class="text-sm font-light text-gray-800">Nome</label>
      <input
        v-model="teamStore.getTeam.name"
        type="text"
        class="w-full rounded border-gray-200 bg-gray-50"
        :class="{
          'border-red-500': v$.teamStore.team.name.$error,
          'border-gray-200': !v$.teamStore.team.name.$error
        }"
        required
        placeholder="Nome da equipe"
        :aria-describedby="v$.teamStore.team.name.$error ? 'name-error' : null"
      />
      <span
        v-if="v$.teamStore.team.name.$error"
        id="name-error"
        class="ml-2 text-sm text-red-600"
        role="alert"
      >
        Nome da equipe é obrigatório.
      </span>
    </div>

    <!-- Operadores gerentes (só admin) -->
    <div v-if="$can.canAccess('admin')" class="mb-6">
      <div class="mb-3 flex items-start gap-2">
        <div class="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-50">
          <BaseIcon name="Shield" class="!size-3.5 text-indigo-500" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-800">Operadores</label>
          <p class="text-xs text-gray-500">Quem pode gerenciar as escalas desta equipe.</p>
        </div>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div v-if="teamOperators.length" class="divide-y divide-gray-100">
          <div
            v-for="(op, idx) in teamOperators"
            :key="op.id"
            class="flex items-center justify-between px-3.5 py-2.5"
          >
            <div class="flex items-center gap-2">
              <div class="h-2 w-2 rounded-full bg-indigo-400" />
              <span class="text-sm font-medium text-gray-800">{{ op.name }}</span>
            </div>
            <button type="button" class="rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-400 transition-colors" @click="removeOperator(idx)">
              <BaseIcon name="trash" class="!size-3.5" />
            </button>
          </div>
        </div>
        <div v-else class="px-3.5 py-3 text-xs text-gray-400 italic">
          {{ allOperators.length === 0
            ? 'Você ainda não tem líderes cadastrados. Salve a equipe agora e adicione líderes depois.'
            : 'Nenhum líder atribuído a esta equipe ainda.' }}
        </div>

        <div class="flex gap-2 border-t border-gray-100 bg-gray-50 p-2.5">
          <div class="flex-1">
            <Select
              v-model="selectedOperatorId"
              :revert-color="true"
              placeholder="Adicionar operador"
              :options="availableOperators.map(o => ({ value: o.id, label: o.name }))"
            />
          </div>
          <button type="button" class="flex items-center justify-center rounded-lg btn-brand px-3 py-2" @click="addOperator">
            <BaseIcon name="plus" class="!size-4" />
          </button>
        </div>
      </div>
    </div>

    <div class="mb-4">
      <div class="mb-3 flex items-start gap-2">
        <div class="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <BaseIcon name="QueueList" class="!size-3.5 text-slate-500" />
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-800">Posições</label>
          <p class="text-xs text-gray-500">Funções disponíveis para esta equipe.</p>
        </div>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div v-if="teamStore.getTeam.positions.length" class="divide-y divide-gray-100">
          <div
            v-for="(position, index) in teamStore.getTeam.positions"
            :key="index"
            class="flex items-center justify-between px-3.5 py-2.5"
          >
            <div class="flex items-center gap-2">
              <div class="h-2 w-2 rounded-full bg-slate-300" />
              <span class="text-sm font-medium text-gray-800">{{ position.name }}</span>
            </div>
            <button
              v-if="$can.canAccess('operator')"
              type="button"
              class="rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-400 transition-colors"
              @click="removePosition(index, position.id)"
            >
              <BaseIcon name="trash" class="!size-3.5" />
            </button>
          </div>
        </div>
        <div v-else class="px-3.5 py-3 text-xs text-gray-400 italic">Nenhuma posição adicionada.</div>

        <div v-if="$can.canAccess('operator')" class="flex gap-2 border-t border-gray-100 bg-gray-50 p-2.5">
          <input
            v-model="newPosition"
            type="text"
            class="h-9 w-full flex-1 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:border-gray-400 focus:outline-none"
            placeholder="Nome da posição"
            @keyup.enter="addPosition"
          />
          <button
            type="button"
            class="flex items-center justify-center rounded-lg btn-brand px-3 py-2"
            @click="addPosition"
          >
            <BaseIcon name="plus" class="!size-4" />
          </button>
        </div>
      </div>
      <span v-if="errors.positions" class="mt-1.5 block text-xs text-red-500">{{ errors.positions }}</span>
    </div>
  </Drawer>
</template>

<script>
import Drawer from '@/components/drawer/Drawer.vue';
import useVuelidate from '@vuelidate/core';
import { track, EVENTS } from '@/analytics';

import { required } from '@vuelidate/validators';
import { useTeamStore } from '@/modules/users/store/team';
import { useCompanyStore } from '@/modules/users/store/company';
import { useAuthStore } from '@/modules/auth/store';
import { useUserStore } from '@/modules/users/store/user';
import { useOnboardingStore } from '@/components/onboarding/store';

import BaseIcon from '@/components/icons/BaseIcon';
import Select from '@/components/form/Select';

export default {
  components: {
    Drawer,
    BaseIcon,
    Select
  },

  setup() {
    return { v$: useVuelidate() };
  },
  data() {
    return {
      newPosition: '',
      allOperators: [],
      teamOperators: [],
      selectedOperatorId: '',
      companies: [],
      errors: {
        company: '',
        name: '',
        positions: ''
      }
    };
  },
  validations() {
    return {
      teamStore: {
        team: {
          name: { required }
        }
      }
    };
  },
  computed: {
    teamStore: () => useTeamStore(),
    companyStore: () => useCompanyStore(),
    authStore: () => useAuthStore(),
    userStore: () => useUserStore(),
    onboardingStore: () => useOnboardingStore(),
    availableOperators() {
      const selectedIds = this.teamOperators.map(o => o.id);
      return this.allOperators.filter(o => !selectedIds.includes(o.id));
    }
  },
  methods: {
    addPosition() {
      if (this.newPosition.trim() === '') {
        this.errors.positions = 'O nome posição é obrigatório';
        return;
      }

      if (
        this.teamStore.getTeam.positions.some(
          s => s.name.toLowerCase() === this.newPosition.trim().toLowerCase()
        )
      ) {
        this.errors.positions = 'O posição já existente';
        return;
      }

      this.errors.positions = '';
      this.teamStore.setPosition({ name: this.newPosition.trim() });
      this.newPosition = '';
    },
    removePosition(index, id) {
      this.teamStore.removePosition(index, id);
    },
    async fetchOperators() {
      try {
        let raw = await this.axios.get('users');
        if (!Array.isArray(raw)) raw = raw.data ?? raw.users ?? [];
        this.userStore.setUsers(raw);
        this.allOperators = raw.filter(u => u.profile === 'operator' || u.profile === 'admin');

        const team = this.teamStore.getTeam;
        if (team.id) {
          // fonte primária: campo operatorIds retornado pelo backend junto ao team
          const primaryIds = team.operatorIds ?? team.operator_ids ?? [];
          if (primaryIds.length) {
            this.teamOperators = this.allOperators.filter(o =>
              primaryIds.map(String).includes(String(o.id))
            );
          } else {
            // fallback: verificar managedTeamIds de cada operador
            this.teamOperators = this.allOperators.filter(o =>
              (o.managedTeamIds ?? []).map(String).includes(String(team.id))
            );
          }
        }
      } catch { /* ignore */ }
    },
    addOperator() {
      if (!this.selectedOperatorId) return;
      const op = this.allOperators.find(o => o.id === this.selectedOperatorId);
      if (!op) return;
      this.teamOperators.push(op);
      this.selectedOperatorId = '';
    },
    removeOperator(idx) {
      this.teamOperators.splice(idx, 1);
    },
    submitForm() {
      return this.teamStore.getTeam.id ? this.update() : this.create();
    },
    reset() {
      this.errors = { company: '', name: '', positions: '' };
      this.newPosition = '';
      this.allOperators = [];
      this.teamOperators = [];
      this.selectedOperatorId = '';
      this.teamStore.resetTeam();
    },
    async create() {
      const result = await this.v$.$validate();
      if (result) {
        if (this.newPosition) this.addPosition();
        await this.axios
          .post('teams', {
            ...this.teamStore.getTeam,
            operator_ids: this.teamOperators.map(o => o.id)
          })
          .then(response => {
            track(EVENTS.TEAM_CREATED);
            this.onboardingStore.setTeamCreated();

            this.drawerStore.close();
            this.teamStore.resetTeam();
            this.teamStore.setTeams(response);
            this.v$.$reset();
            this.reset();
          })
          .catch(e => { console.log(e.message); });
      }
    },
    async update() {
      const result = await this.v$.$validate();
      if (result) {
        if (this.newPosition) this.addPosition();
        await this.axios
          .put(`teams/${this.teamStore.getTeam.id}`, {
            ...this.teamStore.getTeam,
            operator_ids: this.teamOperators.map(o => o.id)
          })
          .then(response => {
            this.drawerStore.close();
            this.teamStore.resetTeam();
            this.teamStore.setTeams(response);
            this.v$.$reset();
            this.reset();
          })
          .catch(e => { console.log(e.message); });
      }
    }
  }
};
</script>
