<template>
  <div class="min-h-[60vh] rounded bg-white p-4 shadow transition">
    <slot />
    <p v-if="isEmpty" class="empty-message">
      Não há dados para serem exibidos.
    </p>
  </div>
</template>

<script>
export default {
  computed: {
    isEmpty() {
      return (
        !this.$slots.default ||
        this.$slots.default().every(node => node.children === undefined)
      );
    }
  }
};
</script>
