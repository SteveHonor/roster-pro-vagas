<template>
  <div class="flex items-center justify-center" :class="wrapperClass">
    <div class="text-center px-6">
      <div class="mb-3 flex justify-center">
        <BaseIcon name="inbox" :class="iconClass" />
      </div>
      <h2
        class="font-semibold"
        :class="[titleClass ? titleClass : 'text-base text-gray-400']"
      >
        {{ title }}
      </h2>
      <p v-if="description" class="mt-1 text-sm text-gray-400 leading-relaxed">
        {{ description }}
      </p>
      <div
        v-if="hasSlotContent"
        :class="{ 'my-10 flex w-full justify-center': hasSlotContent }"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';

export default {
  components: {
    BaseIcon
  },
  props: {
    title: {
      type: String,
      required: true
    },
    titleClass: {
      type: String
    },
    iconClass: {
      type: String,
      default: 'w-14 h-14 text-gray-200'
    },
    wrapperClass: {
      type: String,
      default: 'min-h-[40vh]'
    },
    description: {
      type: String
    }
  },
  computed: {
    hasSlotContent() {
      return !!this.$slots.default;
    }
  }
};
</script>
