<template>
  <div
    v-if="visible"
    class="relative mb-6 rounded-xl border border-orange-200 bg-white px-4 py-3 pr-9 shadow-sm sm:pr-4"
  >
    <!-- X sempre no canto superior direito -->
    <button
      type="button"
      class="absolute right-2 top-2.5 rounded p-1 text-gray-300 hover:text-gray-500 transition"
      aria-label="Fechar"
      @click="dismiss"
    >
      <BaseIcon name="XMark" class="h-4 w-4" />
    </button>

    <!-- Desktop: linha única com CTA à direita -->
    <div class="hidden sm:flex sm:items-center sm:justify-between sm:gap-4 sm:pr-6">
      <div class="flex items-center gap-2">
        <BaseIcon name="sparkles" class="h-4 w-4 shrink-0 text-orange-400" />
        <div>
          <p class="text-sm font-semibold text-gray-800">{{ current.title }}</p>
          <p class="text-xs text-gray-500 mt-0.5">{{ current.description }}</p>
        </div>
      </div>
      <button
        type="button"
        class="shrink-0 rounded-md bg-orange-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition"
        @click="openUpgrade"
      >
        Ver planos
      </button>
    </div>

    <!-- Mobile: stack vertical -->
    <div class="sm:hidden">
      <div class="flex items-start gap-2">
        <BaseIcon name="sparkles" class="h-4 w-4 shrink-0 text-orange-400 mt-0.5" />
        <div>
          <p class="text-sm font-semibold text-gray-800">{{ current.title }}</p>
          <p class="text-xs text-gray-500 leading-relaxed mt-0.5">{{ current.description }}</p>
          <button
            type="button"
            class="mt-2.5 rounded-md bg-orange-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition"
            @click="openUpgrade"
          >
            Ver planos
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import { usePlanStore } from '@/components/plan/store';

const STORAGE_KEY = 'plan_banner_dismissed_at';
const DISMISS_HOURS = 8;

const ROUTE_BANNERS = {
  '/hiring': {
    free: { title: 'Pipeline ilimitado e IA de currículos — Vagas Pro', description: 'No Vagas Free você pode publicar vagas com limite. Faça upgrade e recrute sem restrições.' },
    pro:  { title: 'Vagas Pro ativo',                                   description: 'Pipeline ilimitado, IA de currículos e analytics de funil disponíveis.' }
  },
  '/dashboard': {
    free: { title: 'Analytics de funil disponível no Vagas Pro', description: 'Acompanhe taxa de conversão por etapa, tempo médio de contratação e desempenho das vagas.' },
    pro:  { title: 'Dashboard completo ativo',                   description: 'Acesse relatórios de funil, candidaturas e desempenho do seu processo seletivo.' }
  },
  '/users': {
    free: { title: 'Adicione mais recrutadores com o Vagas Pro', description: 'O Vagas Free limita o número de usuários. Expanda seu time de recrutamento.' },
    pro:  { title: 'Usuários ilimitados no Vagas Pro',           description: 'Gerencie todo o seu time de recrutamento sem restrições.' }
  },
  '/settings': {
    free: { title: 'Notificações via WhatsApp e API — Vagas Pro', description: 'Integre seus sistemas e receba alertas de candidaturas direto no WhatsApp.' },
    pro:  { title: 'Todas as integrações disponíveis',            description: 'API REST e notificações WhatsApp ativos no seu plano.' }
  }
};

const DEFAULT_BANNERS = {
  free: { title: 'Você está no Vagas Free', description: 'Desbloqueie pipeline ilimitado, IA de currículos, analytics e muito mais com o Vagas Pro.' },
  pro:  { title: 'Vagas Pro ativo',         description: 'Aproveite pipeline ilimitado, IA de currículos e analytics de funil.' }
};

export default {
  name: 'PlanBanner',
  components: { BaseIcon },
  data: () => ({ dismissed: false }),
  computed: {
    planStore: () => usePlanStore(),
    visible() { return this.planStore.shouldShowBanner && !this.dismissed; },
    current() {
      const path = this.$route?.path || '';
      const raw  = (this.planStore.name || '').toLowerCase();
      const plan = raw.includes('pro') ? 'pro' : 'free';
      const routeKey = Object.keys(ROUTE_BANNERS).find(k => path.startsWith(k));
      return (routeKey ? ROUTE_BANNERS[routeKey]?.[plan] : null) ?? DEFAULT_BANNERS[plan];
    }
  },
  created() {
    const dismissedAt = sessionStorage.getItem(STORAGE_KEY);
    if (dismissedAt) this.dismissed = (Date.now() - Number(dismissedAt)) / 3600000 < DISMISS_HOURS;
  },
  methods: {
    dismiss()      { this.dismissed = true; sessionStorage.setItem(STORAGE_KEY, String(Date.now())); },
    openUpgrade()  { this.planStore.setOpen('upgrade'); }
  }
};
</script>
