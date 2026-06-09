<template>
  <section class="space-y-4">
    <!-- Info banner -->
    <div v-if="!loading && evaluations.length" class="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2">
      <BaseIcon name="Exclamation" class="!size-4 mt-0.5 flex-shrink-0 text-amber-500" />
      <p class="text-xs text-amber-800">
        <strong>Atenção:</strong> ao clicar em "Exibir no Dashboard", a avaliação fica visível para <strong>todos os membros da organização</strong> na tela principal. Avaliações particulares ficam visíveis só para você.
      </p>
    </div>

    <!-- Skeleton / Lista -->
    <SkeletonRows v-if="loading" :rows="3" />
    <div v-else-if="evaluations.length" class="flex flex-col gap-2">
      <CardRow
        v-for="evaluation in evaluations"
        :key="evaluation.id"
        :accent="evaluation.public ? 'border-l-2 border-l-green-500' : evaluation.visibility === 'public' ? 'border-l-2 border-l-blue-400' : 'border-l-2 border-l-amber-400'"
      >
        <div class="flex flex-col gap-2">
          <div class="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p class="text-sm font-semibold text-slate-800">{{ evaluation.reviewer?.name }}</p>
              <p class="mt-0.5 text-[11px] text-slate-400">{{ moment(evaluation.createdAt).format('DD/MM/YYYY') }}</p>
            </div>
            <div class="flex items-center gap-2">
              <RatingStars :rating="evaluation.rating" :background="false" mode="stars" />
              <button
                v-if="evaluation.visibility === 'public'"
                type="button"
                :class="[
                  'inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-semibold transition',
                  evaluation.public
                    ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50'
                ]"
                @click="setPublic(evaluation.id)"
              >
                <BaseIcon :name="evaluation.public ? 'Check' : 'Plus'" class="!size-3" />
                {{ evaluation.public ? 'Visível para todos' : 'Exibir no Dashboard' }}
              </button>
              <span v-else class="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-semibold bg-amber-50 text-amber-600">
                Particular
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
      title="Nenhuma avaliação recebida ainda"
      description="Suas avaliações aparecerão aqui após os eventos em que você participar."
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
      this.evaluations = await this.axios.get('/evaluations');
    } finally {
      this.loading = false;
    }
  },
  methods: {
    async setPublic(id) {
      this.evaluations = await this.axios.patch(`/evaluations/${id}/set_public`);
    }
  }
};
</script>
