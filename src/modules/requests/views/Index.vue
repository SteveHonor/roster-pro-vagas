<template>
  <Tab
    :tabs="[
      { name: 'Ausências', key: 'absences', icon: 'finger-print' },
      { name: 'Trocas', key: 'changes', icon: 'arrow-path' }
    ]"
  >
    <template #tabs="{ isActive }">
      <div v-if="isActive('absences')"><Absences /></div>
      <div v-if="isActive('changes')"><Changes /></div>
    </template>
  </Tab>
</template>

<script>
import Tab from '@/components/tab/Tab';
import Absences from '@/modules/requests/views/Absences';
import Changes from '@/modules/requests/views/Changes';

export default {
  components: { Tab, Changes, Absences }
};
</script>
