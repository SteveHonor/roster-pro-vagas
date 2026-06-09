<template>
  <div class="relative mb-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 pr-9 sm:pr-4">
    <!-- Desktop -->
    <div class="hidden sm:flex sm:items-center sm:justify-between sm:gap-4">
      <div class="flex items-center gap-2">
        <BaseIcon name="Exclamation" class="h-4 w-4 shrink-0 text-orange-500" />
        <p class="text-xs text-orange-800">
          <span class="font-medium">{{ label }} quase no limite</span>
          — {{ limit.used }}/{{ isUnlimited ? '∞' : limit.max }} utilizados. Faça upgrade para continuar crescendo.
        </p>
      </div>
      <button
        type="button"
        class="shrink-0 rounded-md bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition"
        @click="planStore.setOpen('upgrade')"
      >
        Ver planos
      </button>
    </div>

    <!-- Mobile -->
    <div class="sm:hidden">
      <div class="flex items-start gap-2">
        <BaseIcon name="Exclamation" class="h-4 w-4 shrink-0 text-orange-500 mt-0.5" />
        <div>
          <p class="text-sm font-semibold text-orange-900">{{ label }} quase no limite</p>
          <p class="text-xs text-orange-700 mt-0.5">{{ limit.used }}/{{ isUnlimited ? '∞' : limit.max }} utilizados. Faça upgrade para continuar crescendo.</p>
          <button
            type="button"
            class="mt-2 rounded-md bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition"
            @click="planStore.setOpen('upgrade')"
          >
            Ver planos
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import { usePlanStore } from '@/components/plan/store';

const LABELS = { users: 'Colaboradores', teams: 'Equipes', companies: 'Instituições', events: 'Eventos futuros' };

export default {
  name: 'PlanLimitBanner',
  components: { BaseIcon },
  props: { resource: { type: String, required: true } },
  computed: {
    planStore:   () => usePlanStore(),
    limit()      { return this.planStore.limits[this.resource] ?? { used: 0, max: null }; },
    isUnlimited(){ return this.limit.max === null; },
    label()      { return LABELS[this.resource] ?? this.resource; }
  }
};
</script>
