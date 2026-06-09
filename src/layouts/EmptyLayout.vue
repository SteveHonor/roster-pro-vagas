<template>
  <div
    class="font-roboto flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-100 to-white p-4"
  >
    <div class="w-full max-w-7xl">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'EmptyLayout'
};
</script>
