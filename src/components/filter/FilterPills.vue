<template>
  <div class="flex flex-wrap gap-2">
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      :class="[
        'rounded-full px-3 py-1 text-xs font-medium transition',
        modelValue === opt.value
          ? 'bg-slate-800 text-white'
          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
      ]"
      @click="$emit('update:modelValue', opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'FilterPills',
  props: {
    options: {
      type: Array,
      required: true
    },
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue']
};
</script>
