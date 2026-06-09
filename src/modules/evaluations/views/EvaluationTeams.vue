<template>
  <section>
    <div v-if="filtered.length" class="flex flex-wrap gap-3">
      <!-- filtro -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div class="flex w-full justify-end">
          <FormSelect
            v-model="selectedBlockId"
            :options="userFilterOptions"
            class="w-full sm:w-72"
            placeholder="Filtrar ausências"
          />
        </div>
      </div>

      <div
        v-for="(evaluation, index) in filtered"
        :key="index"
        class="flex w-full items-center justify-between rounded border bg-gray-100 p-3"
        :class="[
          evaluation.origin == 'event' ? 'border-gray-400 text-gray-600' : ''
        ]"
      >
        <div>
          {{ evaluation.message }}
          <div class="text-xs font-light text-gray-600">
            recebido:
            {{ moment(evaluation.notifiedAt).format('DD/MM/YY H:m') }}
          </div>
        </div>

        <div class="flex gap-4">
          <button
            class="flex items-center gap-2 truncate rounded border bg-white px-3 py-2 text-xs hover:bg-gray-700 hover:text-white"
            :class="{ 'border-gray-400': evaluation.origin == 'event' }"
            @click="
              () => {
                $router.replace(evaluation.path);
              }
            "
          >
            {{ evaluation.action }}
          </button>
        </div>
      </div>
    </div>
    <div v-else>
      <Empty
        title="Tudo certo por aqui!"
        description="Você ainda não fez nem recebeu nenhuma avaliação para as equipes."
      />
    </div>
  </section>
</template>

<script>
import FormSelect from '@/components/form/Select';
import Empty from '@/components/empty/Empty';

export default {
  components: {
    FormSelect,
    Empty
  },
  data() {
    return {
      evaluations: [],
      selected: null
    };
  },
  computed: {
    filtered() {
      if (!this.selected) return this.evaluations;

      return this.evaluations.filter(evaluation => {
        if (evaluation.id === this.selected) return true;
      });
    }
  },
  mounted() {
    this.getEvaluations();
  },
  methods: {
    async getEvaluations() {
      await this.axios.patch('/evaluations').then(response => {
        this.evaluations = response;
      });
    }
  }
};
</script>
