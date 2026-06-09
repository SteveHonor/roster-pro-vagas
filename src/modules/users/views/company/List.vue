<template>
  <div class="flex w-full flex-col gap-2">
    <div
      class="mb-6 flex w-full flex-wrap md:flex-nowrap"
      :class="{ 'gap-4': $can.canAccess('admin') }"
    >
      <div class="size-auto w-full grow">
        <FormInput
          v-model="search"
          placeholder="Digite para pesquisar"
          class="w-full"
          icon="search"
        />
      </div>
      <div class="w-full md:w-auto">
        <BaseButton
          v-if="$can.canAccess('admin')"
          icon="plus"
          @click="addCompany()"
        >
          Adicionar
        </BaseButton>
      </div>
    </div>

    <SkeletonRows v-if="loading" :rows="3" has-trailing class="w-full" />

    <CardRow
      v-for="(company, index) in filteredCompany"
      :key="index"
    >
      <div class="flex items-center gap-2">
        <p class="text-sm font-bold" :class="company.plan_locked ? 'text-slate-400' : 'text-slate-800'">{{ company.name }}</p>
        <span
          v-if="company.plan_locked"
          class="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
        >
          <BaseIcon name="lock-closed" class="h-3 w-3" />
          Suspenso
        </span>
      </div>
      <p class="text-xs text-slate-500">{{ company.document }}</p>

      <template #trailing>
        <div v-if="$can.canAccess('admin')" class="flex items-center gap-1">
          <button
            class="cursor-pointer rounded-full p-2 hover:bg-slate-200"
            @click="editCompany(company)"
          >
            <BaseIcon name="pencil" class="h-4 w-4 text-slate-500" />
          </button>
          <button
            v-if="index > 0"
            class="cursor-pointer rounded-full p-2 hover:bg-slate-200"
            @click="removeCompany(company.id)"
          >
            <BaseIcon name="trash" class="h-4 w-4 text-red-400" />
          </button>
        </div>
      </template>
    </CardRow>
  </div>
</template>

<script>
import BaseButton from '@/components/base/Button';
import BaseIcon from '@/components/icons/BaseIcon';
import CardRow from '@/components/card/CardRow';
import FormInput from '@/components/form/Input';
import SkeletonRows from '@/components/skeleton/SkeletonRows';

import { useConfirmationStore } from '@/components/confirmation/store';
import { useCompanyStore } from '@/modules/users/store/company';
import { useAuthStore } from '@/modules/auth/store';

export default {
  components: {
    BaseButton,
    BaseIcon,
    CardRow,
    FormInput,
    SkeletonRows
  },
  data() {
    const companyStore = useCompanyStore();
    return {
      search: '',
      loading: companyStore.getCompanies.length === 0
    };
  },
  computed: {
    authStore: () => useAuthStore(),
    confirmationStore: () => useConfirmationStore(),
    companyStore: () => useCompanyStore(),
    filteredCompany() {
      const searchTerm = this.search.toLowerCase();

      return this.companyStore.getCompanies.filter(user =>
        user.name.toLowerCase().includes(searchTerm)
      );
    }
  },
  mounted() {
    this.getCompanies();
  },
  methods: {
    async getCompanies() {
      try {
        const response = await this.axios.get('companies');
        this.companyStore.setCompanies(response);
      } finally {
        this.loading = false;
      }
    },
    editCompany(data) {
      this.companyStore.setCompany(data);

      this.drawerStore.setDrawer({
        title: 'Editar Instituição',
        context: 'company',
        open: true
      });
    },
    removeCompany(id) {
      this.confirmationStore.setConfirmation({
        title: 'Remover Instituição?',
        description:
          'Tem certeza de que deseja remover essa instituição? Será removida permanentemente. Esta ação não pode ser desfeita.',
        open: true,
        onConfirm: async () => {
          await this.axios.delete(`companies/${id}`).then(response => {
            this.companyStore.setCompanies(response);

            this.confirmationStore.close();
          });
        }
      });
    },
    addCompany() {
      if (this.$can.canCreate('companies')) {
        this.drawerStore.setDrawer({
          title: 'Adicionar Instituição',
          context: 'company',
          open: true
        });
      } else {
        this.planStore.setOpen('limit');
      }
    }
  }
};
</script>
