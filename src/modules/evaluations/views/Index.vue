<template>
  <Tab
    :tabs="[
      { name: 'Minhas Avaliações', key: 'evaluations', icon: 'heart' },
      { name: 'Avaliações Feitas', key: 'sent', icon: 'bookmaker' }
    ]"
  >
    <template #tabs="{ isActive }">
      <div v-if="isActive('evaluations')">
        <EvaluationUsers />
      </div>

      <div v-if="isActive('teams')">
        <EvaluationTeams />
      </div>

      <div v-if="isActive('sent')">
        <EvaluationSent />
      </div>
    </template>
  </Tab>
</template>

<script>
import Tab from '@/components/tab/Tab';
import EvaluationTeams from '@/modules/evaluations/views/EvaluationTeams';
import EvaluationUsers from '@/modules/evaluations/views/EvaluationUsers';
import EvaluationSent from '@/modules/evaluations/views/EvaluationSent';

export default {
  components: {
    Tab,
    EvaluationSent,
    EvaluationUsers,
    EvaluationTeams
  }
};
</script>
