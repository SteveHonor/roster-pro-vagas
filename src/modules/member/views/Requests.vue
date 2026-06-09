<template>
  <div class="px-4 py-4">

    <!-- Tab Pills -->
    <div class="mb-4 flex gap-1 rounded-xl bg-slate-100 p-1">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-medium transition"
        :class="activeTab === tab.key ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500'"
        @click="activeTab = tab.key"
      >
        <BaseIcon :name="tab.icon" class="!size-4 flex-shrink-0" />
        {{ tab.name }}
      </button>
    </div>

    <Absences v-if="activeTab === 'absences'" />
    <Changes v-if="activeTab === 'changes'" />

  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import Absences from '@/modules/requests/views/Absences';
import Changes from '@/modules/requests/views/Changes';

export default {
  components: { BaseIcon, Absences, Changes },
  data() {
    return {
      activeTab: 'absences',
      tabs: [
        { name: 'Ausências', key: 'absences', icon: 'finger-print' },
        { name: 'Trocas',    key: 'changes',  icon: 'arrow-path'   }
      ]
    };
  }
};
</script>
