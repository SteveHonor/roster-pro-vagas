<template>
  <section>
    <!-- escolha de datas -->
    <div class="my-5 flex flex-wrap">
      <span class="mb-2 w-full text-sm font-light text-gray-800"
        >Defina as datas do ano (obrigatório)</span
      >
      <div
        class="flex w-full flex-col items-center justify-center gap-4 rounded bg-gray-100 p-6 shadow"
      >
        <div class="flex w-full max-w-sm justify-center gap-2">
          <VueDatePicker
            v-model="newDate"
            :enable-time-picker="false"
            auto-apply
            placeholder="Selecione a data"
            class="focus:ring-2 focus:ring-gray-200 rounded border border-gray-300 p-2 shadow-sm focus:border-gray-500"
          />
          <BaseButton
            icon="plus-circle"
            @click="addDate"
          >
            Adicionar data
          </BaseButton>
        </div>
        <div class="mt-2 space-y-1 text-center">
          <p class="text-sm text-gray-600">Selecione uma data de cada vez</p>
          <p class="text-sm text-gray-600">
            Adicione quantas datas forem necessárias
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import BaseButton from '@/components/base/Button';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

import { useEventStore } from '@/modules/calendar/store/event';

export default {
  components: {
    BaseButton,
    VueDatePicker
  },
  data() {
    return {
      newDate: ''
    };
  },
  computed: {
    eventStore: () => useEventStore()
  },
  methods: {
    addDate() {
      if (!this.newDate) return;
      this.eventStore.setDay(this.newDate);
      this.newDate = '';
    }
  }
};
</script>
