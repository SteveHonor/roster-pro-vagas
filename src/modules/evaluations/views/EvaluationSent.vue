<template>
  <section class="space-y-4">
    <!-- Info banner -->
    <div v-if="!loading && evaluations.length" class="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
      <BaseIcon name="Exclamation" class="!size-4 mt-0.5 flex-shrink-0 text-amber-500" />
      <p class="text-xs text-amber-800">
        <strong>Atenção:</strong> avaliações marcadas como <strong>públicas</strong> podem ser exibidas pelo colaborador avaliado para <strong>todos os membros da organização</strong>. As particulares ficam visíveis só para você e para quem foi avaliado.
      </p>
    </div>

    <!-- Skeleton / Lista -->
    <SkeletonRows v-if="loading" :rows="3" />
    <div v-else-if="evaluations.length" class="flex flex-col gap-2">
      <CardRow
        v-for="evaluation in evaluations"
        :key="evaluation.id"
        :accent="evaluation.visibility === 'public' ? 'border-l-2 border-l-blue-400' : 'border-l-2 border-l-amber-400'"
      >
        <div class="flex flex-col gap-2">
          <div class="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p class="text-sm font-semibold text-slate-800">{{ evaluation.reviewedUser?.name }}</p>
              <p class="mt-0.5 text-[11px] text-slate-400">{{ moment(evaluation.createdAt).format('DD/MM/YYYY') }}</p>
            </div>
            <div class="flex items-center gap-2">
              <RatingStars :rating="evaluation.rating" :background="false" mode="stars" />
              <span :class="['inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold', evaluation.visibility === 'public' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600']">
                {{ evaluation.visibility === 'public' ? 'Pública' : 'Particular' }}
              </span>
            </div>
          </div>
          <p v-if="evaluation.comment" class="line-clamp-3 text-sm text-slate-600">{{ evaluation.comment }}</p>
          <p v-else class="text-xs italic text-slate-400">Nenhum comentário.</p>
        </div>
      </CardRow>
    </div>

    <Empty
      v-else-if="!loading"
      title="Nenhuma avaliação feita ainda"
      description="Avalie colaboradores após os eventos para construir o histórico do time."
    />
  </section>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import CardRow from '@/components/card/CardRow';
import RatingStars from '@/components/rating/Star';
import Empty from '@/components/empty/Empty';
import SkeletonRows from '@/components/skeleton/SkeletonRows';

export default {
  components: { BaseIcon, CardRow, RatingStars, Empty, SkeletonRows },
  data() {
    return { loading: true, evaluations: [] };
  },
  async mounted() {
    try {
      this.evaluations = await this.axios.get('/evaluations/sent');
    } finally {
      this.loading = false;
    }
  }
};
</script>
