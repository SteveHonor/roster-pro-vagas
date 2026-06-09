<template>
  <Drawer
    context="feedback"
    :on-save="submit"
    :on-close="reset"
    :on-exit="reset"
    :disabled="!validForm"
    confirm-label="Enviar Avaliação"
  >
    <!-- Badge de contexto -->
    <div class="mb-6">
      <span
        v-if="feedbackStore.scheduleItemId"
        class="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600"
      >
        <BaseIcon name="calendar" class="h-3.5 w-3.5" />
        Avaliação desta escala
      </span>
      <span
        v-else
        class="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
      >
        <BaseIcon name="user" class="h-3.5 w-3.5" />
        Avaliação geral do colaborador
      </span>
    </div>

    <!-- Rating -->
    <div class="mb-6">
      <label class="mb-3 block text-sm font-medium text-gray-800">Nota</label>
      <StarRatingInput v-model="feedbackStore.rating" />
    </div>

    <!-- Comentário -->
    <div class="mb-6">
      <Textarea
        v-model="feedbackStore.comment"
        label="Comentário"
        rows="6"
        placeholder="Pontualidade, comportamento, desempenho no evento..."
      />
    </div>

    <!-- Visibilidade -->
    <label class="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        :checked="feedbackStore.visibility === 'public'"
        class="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 accent-blue-600"
        @change="toggleVisibility"
      />
      <span class="text-sm text-gray-700">
        Permitir que o colaborador exiba este feedback no Dashboard
        <span class="block text-xs text-gray-400">O feedback sempre fica visível para o colaborador avaliado. Ativando isso, ele poderá escolher exibi-lo para toda a equipe.</span>
      </span>
    </label>
  </Drawer>
</template>

<script>
import { useFeedbackStore } from '@/components/feedback/store';
import Drawer from '@/components/drawer/Drawer';
import Textarea from '@/components/form/Textarea';
import BaseIcon from '@/components/icons/BaseIcon';
import StarRatingInput from '@/components/rating/StarRatingInput';

export default {
  components: { Drawer, Textarea, BaseIcon, StarRatingInput },

  computed: {
    feedbackStore: () => useFeedbackStore(),
    validForm: self => self.feedbackStore?.rating > 0
  },

  methods: {
    setRating(value) {
      this.feedbackStore.rating = value;
    },

    toggleVisibility(e) {
      this.feedbackStore.visibility = e.target.checked ? 'public' : 'private';
    },

    async submit() {
      if (!this.validForm) return;
      try {
        await this.axios.post('/feedbacks', {
          feedback: {
            rating: this.feedbackStore.rating,
            comment: this.feedbackStore.comment,
            visibility: this.feedbackStore.visibility,
            userId: this.feedbackStore.userId,
            scheduleItemId: this.feedbackStore.scheduleItemId
          }
        });
        this.drawerStore.close();
        this.reset();
      } catch (err) {
        console.error(err?.response?.data?.errors || err.message);
      }
    },

    reset() {
      this.feedbackStore.reset();
    }
  }
};
</script>
