<template>
  <div v-if="visible" :class="compact ? '' : 'rounded bg-gray-50 p-4 shadow-sm'">
    <!-- Header -->
    <div class="mb-3 flex items-center justify-between">
      <h3
        class="text-xs font-semibold uppercase tracking-wide text-gray-400"
        :class="{ 'text-[10px]': compact }"
      >
        Limites do Plano
      </h3>
      <button
        type="button"
        class="rounded px-2 py-0.5 text-[10px] font-medium text-orange-500 transition hover:bg-orange-50"
        @click="openUpgrade"
      >
        Ver planos
      </button>
    </div>

    <!-- Limites -->
    <div class="flex flex-col gap-2.5">
      <div v-for="item in limitItems" :key="item.key">
        <div class="mb-1 flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <BaseIcon :name="item.icon" class="h-5 w-5 text-gray-400" />
            <span class="text-xs text-gray-600">{{ item.label }}</span>
          </div>
          <span class="text-[11px] font-medium" :class="usageTextClass(item)">
            {{ item.max === null ? item.used + '/∞' : item.used + '/' + item.max }}
          </span>
        </div>
        <div class="h-1 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            class="h-1 rounded-full transition-all duration-300"
            :class="usageBarClass(item)"
            :style="{ width: usagePercent(item) + '%' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import { usePlanStore } from '@/components/plan/store';

const LIMIT_META = {
  users:     { label: 'Colaboradores',    icon: 'Users'      },
  teams:     { label: 'Equipes',          icon: 'UserGroup'  },
  companies: { label: 'Instituições',     icon: 'Company'    },
  events:    { label: 'Eventos futuros',  icon: 'Calendar'   },
  admins:    { label: 'Administradores',  icon: 'Star'       }
};

export default {
  name: 'PlanLimitsWidget',
  components: { BaseIcon },
  props: {
    compact: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    planStore: () => usePlanStore(),
    visible() {
      return this.$can?.canAccess('admin') && Object.keys(this.planStore.limits).length > 0;
    },
    limitItems() {
      return Object.entries(this.planStore.limits)
        .filter(([key]) => LIMIT_META[key])
        .map(([key, data]) => ({
          key,
          label: LIMIT_META[key].label,
          icon:  LIMIT_META[key].icon,
          used:  data.used ?? 0,
          max:   data.max  ?? null
        }));
    }
  },
  methods: {
    usagePercent(item) {
      if (item.max === null) return 0;
      if (!item.max) return 100;
      return Math.min(100, Math.round((item.used / item.max) * 100));
    },
    usageBarClass(item) {
      const pct = this.usagePercent(item);
      if (pct >= 100) return 'bg-red-500';
      if (pct >= 80)  return 'bg-amber-400';
      return 'bg-blue-500';
    },
    usageTextClass(item) {
      const pct = this.usagePercent(item);
      if (pct >= 100) return 'text-red-600';
      if (pct >= 80)  return 'text-amber-600';
      return 'text-gray-500';
    },
    openUpgrade() {
      this.planStore.setOpen('upgrade');
    }
  }
};
</script>
