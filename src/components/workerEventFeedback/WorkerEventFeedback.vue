<template>
  <Drawer
    context="worker-event-feedback"
    :on-save="submit"
    :on-close="reset"
    :on-exit="reset"
    :disabled="!validForm"
    confirm-label="Enviar Feedback"
  >
    <!-- Badge de contexto -->
    <div class="mb-5">
      <span class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
        <BaseIcon name="sparkles" class="h-3.5 w-3.5" />
        Feedback do evento
      </span>
    </div>

    <!-- Aviso de privacidade -->
    <div class="mb-6 flex gap-3 rounded-md border border-green-100 bg-green-50 px-4 py-3">
      <BaseIcon name="lock-closed" class="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
      <div class="space-y-0.5">
        <p class="text-xs font-semibold text-green-800">Confidencial — só a liderança tem acesso</p>
        <p class="text-xs text-green-700">Seu feedback é visto apenas por operadores e administradores. Colegas de equipe não têm acesso. Use esse espaço para ser honesto — é assim que melhoramos juntos.</p>
      </div>
    </div>

    <!-- Rating -->
    <div class="mb-6">
      <label class="mb-3 block text-sm font-medium text-gray-800">Como foi para você?</label>
      <StarRatingInput v-model="store.rating" />
    </div>

    <!-- Comentário -->
    <Textarea
      v-model="store.comment"
      label="Observações (opcional)"
      :rows="5"
      placeholder="O que foi bom? O que poderia melhorar? Alguma sugestão para a próxima?"
    />

    <!-- Rodapé informativo -->
    <p class="mt-3 text-xs text-gray-400">
      Feedbacks honestos ajudam a equipe de gestão a tomar melhores decisões. Obrigado por contribuir.
    </p>
  </Drawer>
</template>

<script>
import Drawer from '@/components/drawer/Drawer';
import BaseIcon from '@/components/icons/BaseIcon';
import Textarea from '@/components/form/Textarea';
import StarRatingInput from '@/components/rating/StarRatingInput';
import { useWorkerEventFeedbackStore } from '@/components/workerEventFeedback/store';

export default {
  components: { Drawer, BaseIcon, Textarea, StarRatingInput },

  computed: {
    store: () => useWorkerEventFeedbackStore(),
    validForm: self => self.store.rating > 0
  },

  methods: {
    async submit() {
      if (!this.validForm) return;
      try {
        await this.axios.post(`/event_day/${this.store.eventDayId}/feedbacks`, {
          event_day_feedback: {
            rating: this.store.rating,
            comment: this.store.comment
          }
        });
        this.drawerStore.close();
        this.$emit('submitted');
        this.reset();
      } catch (err) {
        console.error(err?.response?.data?.errors || err.message);
      }
    },

    reset() {
      this.store.reset();
    }
  }
};
</script>
