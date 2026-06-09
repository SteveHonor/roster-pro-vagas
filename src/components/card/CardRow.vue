<template>
  <div
    class="flex items-stretch border border-slate-200 bg-slate-50 transition-all hover:border-slate-300 hover:bg-slate-100 hover:shadow-sm"
    :class="[accent, accent ? 'rounded-e-md' : 'rounded-md']"
  >
    <div
      v-if="$slots.prefix"
      class="flex w-12 flex-shrink-0 flex-col items-center justify-center border-r border-slate-100 py-3"
    >
      <slot name="prefix" />
    </div>

    <div class="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center">
      <div class="min-w-0 flex-1 px-3 py-2.5">
        <slot />
      </div>

      <div
        v-if="$slots.trailing"
        class="border-t border-slate-100 px-3 py-2 sm:border-l sm:border-t-0 sm:py-2.5"
      >
        <slot name="trailing" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CardRow',
  props: {
    accent: {
      type: String,
      default: ''
    }
  }
};
</script>
