<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-6 text-center">
    <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
      <BaseIcon name="LinkSlash" class="!size-10 text-slate-400" />
    </div>
    <h1 class="mb-2 text-xl font-bold text-slate-800">Sem conexão</h1>
    <p class="mb-6 text-sm text-slate-500">Verifique sua internet e tente novamente.</p>
    <button
      class="rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600"
      @click="retry"
    >
      Tentar novamente
    </button>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';

export default {
  components: { BaseIcon },
  methods: {
    retry() {
      window.location.reload();
    }
  }
};
</script>
