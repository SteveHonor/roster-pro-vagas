<template>
  <div class="font-roboto min-h-screen">
    <slot />
    <LoadingScreen />
  </div>
</template>

<script>
import LoadingScreen from '@/components/loading/Screen';

export default {
  components: {
    LoadingScreen
  }
};
</script>
