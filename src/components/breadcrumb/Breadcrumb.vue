<template>
  <nav class="flex w-full flex-wrap items-center justify-center">
    <ul class="flex w-full">
      <li
        v-for="(route, index) in breadcrumbStore.getBreadcrumbs"
        :key="index"
        class="flex items-center justify-center text-xs md:text-base"
      >
        <div
          :class="[index > 0 ? 'text-gray-500' : 'font-semibold']"
          :style="index === 0 ? { color: 'var(--brand-primary, #2563eb)' } : {}"
        >
          {{ route.name }}
        </div>
        <span
          v-if="index < breadcrumbStore.getBreadcrumbs.length - 1"
          class="mx-2"
        >
          <BaseIcon name="chevron-right" class="h-4 w-4"
        /></span>
      </li>
    </ul>
  </nav>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { useBreadcrumbStore } from './store';

export default {
  components: {
    BaseIcon
  },
  computed: {
    breadcrumbStore: () => useBreadcrumbStore()
  }
};
</script>
