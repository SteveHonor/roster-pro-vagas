<template>
  <div class="px-4 py-5">
    <h1 class="mb-4 text-base font-bold text-slate-800">Comunicados</h1>

    <div v-if="loading" class="flex flex-col gap-3">
      <div v-for="i in 3" :key="i" class="h-20 animate-pulse rounded-xl bg-white shadow-sm" />
    </div>

    <div v-else-if="messages.length" class="flex flex-col gap-3">
      <div
        v-for="msg in messages"
        :key="msg.id"
        class="rounded-xl bg-white p-4 shadow-sm transition-opacity"
        :class="{ 'opacity-55': !isActive(msg) }"
      >
        <div class="mb-2.5 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div
              class="flex h-7 w-7 items-center justify-center rounded-lg"
              :class="isActive(msg) ? 'bg-indigo-50' : 'bg-slate-50'"
            >
              <BaseIcon name="Megaphone" class="!size-3.5" :class="isActive(msg) ? 'text-indigo-500' : 'text-slate-300'" />
            </div>
            <span
              class="text-[10px] font-bold uppercase tracking-widest"
              :class="isActive(msg) ? 'text-indigo-500' : 'text-slate-400'"
            >
              {{ isActive(msg) ? 'Ativo' : 'Expirado' }}
            </span>
          </div>
          <span class="text-[11px] text-slate-400">
            {{ isActive(msg) ? 'Expira' : 'Expirou' }} {{ moment(msg.visibleUntil).format('DD/MM/YY') }}
          </span>
        </div>

        <p class="text-sm font-medium leading-snug text-slate-800">{{ msg.content }}</p>

        <p class="mt-2.5 text-[11px] text-slate-400">
          — <strong class="font-semibold text-slate-500">{{ msg.senderName }}</strong>
          · {{ moment(msg.createdAt).format('DD/MM/YY') }}
        </p>
      </div>
    </div>

    <div v-else class="rounded-xl bg-white p-8 text-center shadow-sm">
      <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
        <BaseIcon name="Megaphone" class="!size-6 text-slate-300" />
      </div>
      <p class="text-sm font-semibold text-slate-500">Nenhum comunicado ainda</p>
      <p class="mt-1 text-xs text-slate-400">Avisos dos gestores aparecerão aqui</p>
    </div>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';

export default {
  components: { BaseIcon },

  data: () => ({ loading: true, messages: [] }),

  async mounted() {
    try {
      const res = await this.axios.get('broadcast_messages');
      this.messages = (res || []).sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    } catch { /* ignore */ } finally {
      this.loading = false;
    }
  },

  methods: {
    isActive(msg) {
      return this.moment(msg.visibleUntil).isAfter(this.moment());
    }
  }
};
</script>
