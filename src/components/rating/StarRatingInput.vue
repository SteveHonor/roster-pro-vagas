<template>
  <div class="space-y-3">
    <div
      class="flex gap-1"
      @mouseleave="hovered = 0"
    >
      <button
        v-for="star in 5"
        :key="star"
        type="button"
        class="rounded p-1 transition-transform hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
        :style="activeRating >= star ? { '--tw-ring-color': 'var(--brand-primary)' } : {}"
        :aria-label="`${star} estrelas — ${labels[star - 1]}`"
        @click="$emit('update:modelValue', star)"
        @mouseenter="hovered = star"
      >
        <BaseIcon
          name="star"
          class="transition-colors"
          :class="[sizeClass, star <= activeRating ? '' : 'text-gray-200']"
          :style="star <= activeRating ? { color: 'var(--brand-primary)' } : {}"
        />
      </button>
    </div>

    <!-- Instrução / rótulo dinâmico -->
    <div class="flex h-5 items-center gap-1.5">
      <template v-if="activeRating > 0">
        <span class="text-sm font-semibold" :style="{ color: 'var(--brand-primary)' }">
          {{ activeRating }}/5
        </span>
        <span class="text-sm text-gray-500">—</span>
        <span class="text-sm font-medium text-gray-700">{{ labels[activeRating - 1] }}</span>
      </template>
      <template v-else>
        <BaseIcon name="CursorArrowRays" class="h-3.5 w-3.5 text-gray-400" />
        <span class="text-xs text-gray-400">Clique em uma estrela para avaliar</span>
      </template>
    </div>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';

export default {
  name: 'StarRatingInput',
  components: { BaseIcon },

  props: {
    modelValue: {
      type: Number,
      default: 0
    },
    size: {
      type: String,
      default: 'md',
      validator: v => ['sm', 'md', 'lg'].includes(v)
    },
    labels: {
      type: Array,
      default: () => ['Ruim', 'Regular', 'Bom', 'Ótimo', 'Excelente']
    }
  },

  emits: ['update:modelValue'],

  data() {
    return { hovered: 0 };
  },

  computed: {
    activeRating() {
      return this.hovered || this.modelValue;
    },
    sizeClass() {
      return { sm: 'h-7 w-7', md: 'h-9 w-9', lg: 'h-11 w-11' }[this.size];
    }
  }
};
</script>
