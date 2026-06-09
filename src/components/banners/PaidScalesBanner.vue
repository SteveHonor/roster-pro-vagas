<template>
  <div v-if="visible" class="relative mb-6 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 pr-9 sm:pr-4">
    <button type="button" class="absolute right-2 top-2.5 rounded p-1 text-violet-300 hover:text-violet-500 transition" aria-label="Fechar" @click="dismiss">
      <BaseIcon name="XMark" class="!size-4" />
    </button>

    <!-- Desktop -->
    <div class="hidden sm:flex sm:items-center sm:justify-between sm:gap-4 sm:pr-6">
      <div class="flex items-center gap-2">
        <BaseIcon name="BankNotes" class="!size-4 shrink-0 text-violet-500" />
        <div>
          <p class="text-sm font-semibold text-violet-900">Novo: Escalas Remuneradas</p>
          <p class="text-xs text-violet-700 mt-0.5">Controle de pagamentos por colaborador, com pagamento em lote e notificação automática.</p>
        </div>
      </div>
      <router-link to="/calendar/new" class="shrink-0 text-xs font-semibold text-violet-600 hover:text-violet-800 underline inline-flex items-center gap-1">
        Criar agenda paga <BaseIcon name="ChevronRight" class="!size-3" />
      </router-link>
    </div>

    <!-- Mobile -->
    <div class="sm:hidden">
      <div class="flex items-start gap-2">
        <BaseIcon name="BankNotes" class="!size-4 shrink-0 text-violet-500 mt-0.5" />
        <div>
          <p class="text-sm font-semibold text-violet-900">Novo: Escalas Remuneradas</p>
          <p class="text-xs text-violet-700 leading-relaxed mt-0.5">Controle de pagamentos por colaborador, com pagamento em lote e notificação automática.</p>
          <router-link to="/calendar/new" class="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800 underline">
            Criar agenda paga <BaseIcon name="ChevronRight" class="!size-3" />
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import { usePlanStore } from '@/components/plan/store';

const STORAGE_KEY = 'paid_scales_banner_dismissed';

export default {
  name: 'PaidScalesBanner',
  components: { BaseIcon },
  computed: {
    planStore: () => usePlanStore(),
    visible() { return this.planStore.hasFeature('paidScales') && !localStorage.getItem(STORAGE_KEY); }
  },
  methods: {
    dismiss() { localStorage.setItem(STORAGE_KEY, '1'); this.$forceUpdate(); }
  }
};
</script>
