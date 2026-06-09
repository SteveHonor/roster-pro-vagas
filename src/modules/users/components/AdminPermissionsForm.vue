<template>
  <div>
    <div class="mb-3 flex items-start gap-2">
      <div class="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50">
        <BaseIcon name="Shield" class="h-3.5 w-3.5 text-amber-500" />
      </div>
      <div>
        <label class="block text-sm font-semibold text-gray-800">Permissões do administrador</label>
        <p class="text-xs text-gray-500">Defina o que este administrador pode gerenciar. Ele nunca terá poder sobre o owner.</p>
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
      <label
        v-for="perm in visiblePermissions"
        :key="perm.key"
        :class="[
          'flex items-center justify-between px-3.5 py-3 cursor-pointer transition-colors',
          modelValue[perm.key] ? 'bg-blue-50/50' : 'hover:bg-gray-50'
        ]"
      >
        <div class="flex items-center gap-2.5">
          <div :class="['flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg', modelValue[perm.key] ? 'bg-blue-100' : 'bg-gray-100']">
            <BaseIcon :name="perm.icon" :class="['h-3.5 w-3.5', modelValue[perm.key] ? 'text-blue-600' : 'text-gray-400']" />
          </div>
          <div>
            <span :class="['text-sm font-medium', modelValue[perm.key] ? 'text-blue-800' : 'text-gray-700']">{{ perm.label }}</span>
            <p class="text-xs text-gray-400">{{ perm.description }}</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span v-if="!canGrantThisPermission(perm.key)" class="text-[10px] font-medium text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">Você não tem</span>
          <button
            type="button"
            :disabled="!canGrantThisPermission(perm.key)"
            :class="[
              'relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
              modelValue[perm.key] ? 'bg-blue-500' : 'bg-gray-200',
              !canGrantThisPermission(perm.key) ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
            ]"
            @click="toggle(perm.key)"
          >
            <span
              :class="[
                'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200',
                modelValue[perm.key] ? 'translate-x-4' : 'translate-x-0'
              ]"
            />
          </button>
        </div>
      </label>
    </div>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import { useAuthStore } from '@/modules/auth/store';

const ALL_PERMISSIONS = [
  {
    key: 'billing',
    label: 'Faturamento',
    description: 'Ver faturas, gerenciar assinatura e pagamentos.',
    icon: 'BankNotes'
  },
  {
    key: 'members',
    label: 'Membros',
    description: 'Convidar, editar e remover colaboradores.',
    icon: 'Users'
  },
  {
    key: 'schedules',
    label: 'Escalas',
    description: 'Criar, editar e publicar escalas e eventos.',
    icon: 'Calendar'
  },
  {
    key: 'approvals',
    label: 'Aprovações',
    description: 'Aprovar e rejeitar solicitações de colaboradores.',
    icon: 'CheckCircle'
  },
  {
    key: 'analytics',
    label: 'Analytics',
    description: 'Acessar dashboards, relatórios e insights.',
    icon: 'ChartBar'
  },
  {
    key: 'integrations',
    label: 'Integrações',
    description: 'Gerenciar API keys, webhooks e integrações externas.',
    icon: 'Cog'
  },
  {
    key: 'branding',
    label: 'Identidade visual',
    description: 'Editar logo e cores da conta.',
    icon: 'Sparkles'
  },
  {
    key: 'manage_admins',
    label: 'Gerenciar admins',
    description: 'Promover usuários a admin e configurar suas permissões.',
    icon: 'Shield'
  }
];

export default {
  name: 'AdminPermissionsForm',

  components: { BaseIcon },

  props: {
    modelValue: {
      type: Object,
      required: true
    }
  },

  emits: ['update:modelValue'],

  computed: {
    authStore: () => useAuthStore(),

    visiblePermissions() {
      return ALL_PERMISSIONS;
    }
  },

  methods: {
    canGrantThisPermission(key) {
      if (this.authStore.isOwner) return true;
      const myPerms = this.authStore.me?.adminPermissions;
      if (!myPerms) return false;
      // axios converte snake_case → camelCase nas respostas;
      // verifica ambas as formas para cobrir manage_admins / manageAdmins
      const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      return myPerms[key] === true || myPerms[camelKey] === true;
    },

    toggle(key) {
      if (!this.canGrantThisPermission(key)) return;
      this.$emit('update:modelValue', {
        ...this.modelValue,
        [key]: !this.modelValue[key]
      });
    }
  }
};
</script>
