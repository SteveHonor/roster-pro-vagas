<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    class="btn-brand inline-flex flex-shrink-0 items-center gap-2 rounded-md px-4 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-50"
    v-bind="$attrs"
  >
    <BaseIcon v-if="loading" name="ArrowPath" class="!size-4 animate-spin" />
    <BaseIcon v-else-if="icon" :name="icon" class="!size-4" />
    <slot />
  </button>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';

export default {
  name: 'BaseButton',
  components: { BaseIcon },
  inheritAttrs: false,
  props: {
    type:     { type: String,  default: 'button' },
    icon:     { type: String,  default: null },
    loading:  { type: Boolean, default: false },
    disabled: { type: Boolean, default: false }
  }
};
</script>
