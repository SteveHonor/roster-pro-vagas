<template>
  <section class="mx-auto">
    <div class="scrollbar-hide mb-3 overflow-x-auto">
      <div class="flex w-fit gap-1 rounded-md bg-gray-200/80 p-1" role="tablist">
        <button
          v-if="toBack"
          class="flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-gray-500 transition-all hover:text-gray-900"
          role="tab"
          @click="toBack() || $router.back()"
        >
          <BaseIcon name="ChevronLeft" class="h-5 w-5" />
          <span>Voltar</span>
        </button>
        <button
          v-for="(tab, index) in tabs"
          :id="`${tab.key}-tab`"
          :key="index"
          class="flex items-center gap-1.5 rounded-md px-3 py-3 text-xs font-medium transition-all min-w-28 justify-center"
          :class="tabClass(tab.key)"
          :aria-selected="isActive(tab.key)"
          :title="tab.description || undefined"
          :aria-controls="tab.key"
          role="tab"
          @click="tab.locked ? tab.onLockedClick?.() : selectTab(tab)"
        >
          <BaseIcon
            v-if="tab.icon"
            :name="tab.icon"
            class="h-5 w-5 flex-shrink-0"
          />
          <span class="truncate">{{ tab.name }}</span>
          <span
            v-if="tab.locked"
            class="flex items-center gap-0.5 rounded-full bg-orange-100 px-1.5 py-px text-[10px] font-semibold text-orange-500"
          ><BaseIcon name="LockClosed" class="!size-2.5" /> Fazer upgrade</span>
          <BaseIcon
            v-if="tab.premium && !tab.locked"
            name="LockClosed"
            class="!size-3 flex-shrink-0 text-orange-400"
            title="Disponível em plano superior"
          />
          <span
            v-if="tab.badge"
            class="rounded px-1.5 py-px text-[10px]"
            :class="isActive(tab.key) ? 'bg-gray-200 text-gray-600' : 'bg-gray-200 text-gray-500'"
          >{{ tab.badge }}</span>
          <span
            v-else-if="tab.status"
            class="rounded px-1.5 py-px text-[10px]"
            :class="tabStatusBadge(tab.status)"
          >{{ tabStatusLabel(tab.status) }}</span>
        </button>
      </div>
    </div>

    <slot name="header" />

    <div
      :class="['rounded bg-white p-4 shadow-md transition', { 'min-h-[60vh]': minHight }]"
      role="tabpanel"
      :aria-labelledby="`${tabStore.getTab.key}-tab`"
    >
      <slot
        name="tabs"
        :is-active="isActive"
        :active-tab="tabStore.getTab.key"
        :set-tab="setTab"
      />
    </div>
  </section>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';

import { useTabStore } from '@/components/tab/store';

export default {
  components: {
    BaseIcon
  },
  props: {
    tabs: {
      type: Array,
      required: true
    },
    breadcrumb: {
      type: String
    },
    onTab: {
      type: Function
    },
    toBack: {
      type: Function
    },
    minHight: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    tabStore: () => useTabStore()
  },
  watch: {
    '$route.query.tab'(newTab) {
      const foundTab = this.tabs.find(tab => tab.key === newTab);
      if (foundTab) {
        this.selectTab(foundTab);
      } else {
        this.selectTab(this.tabs[0]);
      }
    }
  },
  mounted() {
    try {
      this.tabStore.setTab(this?.tabs?.length ? this.tabs[0] : null);

      if (this.$route.query?.tab) {
        this.selectTab(
          this.tabs.find(tab => tab.key === this.$route.query?.tab)
        );
      } else {
        this.selectTab(this.tabs[0]);
      }
    } catch (error) {
      console.log(error);
    }
  },
  methods: {
    selectTab(tab) {
      if (this.onTab) this.onTab(tab);

      this.breadcrumbStore.setBreadcrumb([
        {
          name: this.$route.meta.breadcrumb,
          path: tab.key
        },
        {
          name: tab.name,
          path: tab.key
        }
      ]);

      this.tabStore.setTab(tab);
    },
    isActive(key) {
      return this.tabStore.getTab.key === key;
    },
    setTab(tab) {
      return this.tabStore.setTab(tab);
    },
    tabStatusLabel(status) {
      return { done: 'Completa', pending: 'Pendente', empty: 'Vazia', attention: 'Revisar' }[status] || '';
    },
    tabStatusBadge(status) {
      return {
        done: 'bg-green-100 text-green-700',
        pending: 'bg-amber-100 text-amber-700',
        empty: 'bg-slate-100 text-slate-500',
        attention: 'bg-orange-100 text-orange-600'
      }[status] || '';
    },
    tabClass(key) {
      return this.isActive(key)
        ? 'bg-white shadow-sm text-gray-900'
        : 'text-gray-500 hover:text-gray-900';
    }
  }
};
</script>

<style scoped>
/* Esconde a scrollbar no Chrome, Safari e Edge */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Esconde a scrollbar no Firefox */
.scrollbar-hide {
  -ms-overflow-style: none; /* IE e Edge */
  scrollbar-width: none; /* Firefox */
}
</style>
