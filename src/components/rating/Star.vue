<template>
  <div class="flex items-center gap-1">
    <!-- MODO NUMÉRICO -->
    <div
      v-if="mode === 'numeric'"
      class="flex items-center gap-1 rounded-full"
      :class="{ 'border bg-white px-2 py-0.5': background }"
    >
      <BaseIcon
        name="star"
        class="h-4 w-4"
        :style="ratingInt === 0 ? {} : { color: 'var(--brand-primary, #2563eb)' }"
        :class="[ratingInt === 0 ? 'text-gray-200' : '']"
      />
      <span
        class="pt-0.5 text-xs font-semibold"
        :style="ratingInt === 0 ? {} : { color: 'var(--brand-primary, #2563eb)' }"
        :class="[ratingInt === 0 ? 'text-gray-200' : '']"
      >
        {{ ratingInt }}
      </span>
    </div>

    <!-- MODO PADRÃO (ESTRELAS) -->
    <template v-else>
      <BaseIcon
        v-for="n in filledStars"
        :key="'filled-' + n"
        name="star"
        class="h-4 w-4"
        :style="{ color: 'var(--brand-primary, #2563eb)' }"
      />

      <BaseIcon
        v-for="n in emptyStars"
        :key="'empty-' + n"
        name="star"
        class="h-4 w-4 text-gray-200"
      />
    </template>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';

export default {
  name: 'RatingStars',
  components: {
    BaseIcon
  },
  props: {
    rating: {
      type: [Number, String],
      default: 0
    },
    max: {
      type: Number,
      default: 5
    },
    background: {
      type: Boolean,
      default: true
    },
    mode: {
      type: String,
      default: 'stars',
      validator: value => ['stars', 'numeric'].includes(value)
    }
  },
  computed: {
    ratingInt() {
      return Math.round(parseFloat(this.rating) || 0);
    },
    filledStars() {
      return Math.min(this.ratingInt, this.max);
    },
    emptyStars() {
      return this.max - this.filledStars;
    }
  }
};
</script>
