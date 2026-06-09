<template>
  <div class="flex flex-col gap-2 animate-pulse">
    <div
      v-for="i in rows"
      :key="i"
      class="flex items-center gap-3 rounded border border-slate-100 bg-slate-50 px-4 py-3"
    >
      <!-- Avatar circular (ex: perfil) -->
      <div v-if="hasAvatar" class="h-10 w-10 flex-shrink-0 rounded-full bg-slate-200" />

      <!-- Ícone quadrado (ex: prefix com ícone+subtítulo) -->
      <div v-if="hasPrefix" class="flex w-7 flex-shrink-0 flex-col items-center gap-1">
        <div class="h-5 w-6 rounded bg-slate-200" />
        <div class="h-2 w-5 rounded bg-slate-200" />
      </div>

      <!-- Conteúdo principal -->
      <div class="flex-1 space-y-2">
        <div class="h-3.5 rounded bg-slate-200" :style="{ width: widths[(i - 1) % widths.length] }" />
        <div class="h-2.5 w-1/3 rounded bg-slate-200" />
      </div>

      <!-- Toggles em colunas (ex: notificações App/Email/WA) -->
      <div v-if="toggleCols > 0" class="flex flex-shrink-0 gap-4">
        <div v-for="c in toggleCols" :key="c" class="h-5 w-9 rounded-full bg-slate-200" />
      </div>

      <!-- Botão/trailing genérico -->
      <div v-if="hasTrailing" class="flex flex-shrink-0 gap-1.5">
        <div class="h-7 w-24 rounded bg-slate-200" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SkeletonRows',
  props: {
    rows:       { type: Number,  default: 4     },
    hasPrefix:  { type: Boolean, default: false },
    hasTrailing:{ type: Boolean, default: false },
    hasAvatar:  { type: Boolean, default: false },
    toggleCols: { type: Number,  default: 0     }
  },
  data() {
    return { widths: ['55%', '70%', '45%', '62%'] };
  }
};
</script>
