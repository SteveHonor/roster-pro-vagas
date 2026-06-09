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
  '/dashboard': {
    free:      { title: 'Dashboard avançado disponível no plano Pro',           description: 'Acesse relatórios completos, histórico e análises de desempenho da sua equipe.' },
    essential: { title: 'Dashboard avançado disponível no plano Pro',           description: 'Acesse relatórios completos, histórico e análises de desempenho da sua equipe.' },
    pro:       { title: 'Dashboard completo com múltiplas unidades — Business', description: 'Centralize análises de todas as unidades e tenha visibilidade total do seu negócio.' }
  },
  '/users': {
    free:      { title: 'Adicione mais colaboradores com o Essential',          description: 'O plano gratuito limita o número de usuários. Expanda sua equipe sem restrições.' },
    essential: { title: 'Mais usuários e equipes no plano Pro',                 description: 'Escale sua operação com mais colaboradores, equipes e permissões avançadas.' },
    pro:       { title: 'Usuários ilimitados e múltiplas unidades — Business',  description: 'Gerencie equipes grandes com suporte prioritário e recursos enterprise.' }
  },
  '/calendar': {
    free:      { title: 'Histórico completo de escalas — a partir do Essential', description: 'Consulte todas as escalas passadas e identifique padrões da sua equipe.' },
    essential: { title: 'Escalas com aprovação e relatórios avançados no Pro',   description: 'Automatize fluxos de aprovação e acesse relatórios detalhados de presença.' },
    pro:       { title: 'Gestão de escalas para múltiplas unidades — Business',  description: 'Centralize o controle de escalas de todas as suas unidades em um único lugar.' }
  },
  '/requests': {
    free:      { title: 'Gestão completa de trocas e ausências — a partir do Essential', description: 'Nos planos pagos, controle solicitações com mais visibilidade e histórico.' },
    essential: { title: 'Fluxos avançados de aprovação no plano Pro',              description: 'Crie regras personalizadas para trocas, ausências e aprovações automáticas.' },
    pro:       { title: 'Gestão de solicitações multi-unidade — Business',         description: 'Consolide e gerencie solicitações de todas as unidades com visibilidade total.' }
  },
  '/evaluations': {
    free:      { title: 'Relatórios de desempenho no plano Pro', description: 'Acompanhe avaliações, tendências e engajamento de cada voluntário.' },
    essential: { title: 'Relatórios de desempenho no plano Pro', description: 'Acompanhe avaliações, tendências e engajamento de cada colaborador.' },
    pro:       { title: 'Análise comparativa entre unidades — Business', description: 'Compare desempenho entre equipes e unidades com relatórios consolidados.' }
  },
  '/settings': {
    free:      { title: 'Notificações via WhatsApp e IA — a partir do Essential', description: 'Avise sua equipe automaticamente com mensagens personalizadas por IA.' },
    essential: { title: 'Integrações avançadas e automações no plano Pro',         description: 'Conecte ferramentas externas e automatize processos da sua operação.' },
    pro:       { title: 'Configurações enterprise e SLA garantido — Business',     description: 'Acesso a SSO, integrações customizadas e suporte prioritário 24h.' }
  }
};

const DEFAULT_BANNERS = {
  free:      { title: 'Você está no plano gratuito',                   description: 'Desbloqueie histórico, WhatsApp, IA e muito mais. Veja o que o Roster Pro pode oferecer.' },
  essential: { title: 'Desbloqueie recursos avançados no plano Pro',   description: 'Relatórios completos, automações e integrações para sua operação crescer.' },
  pro:       { title: 'Leve sua operação ao próximo nível — Business', description: 'Múltiplas unidades, usuários ilimitados e suporte prioritário para negócios em expansão.' }
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
      const plan = (this.planStore.name || '').toLowerCase();
      const routeKey = Object.keys(ROUTE_BANNERS).find(k => path.startsWith(k));
      return (routeKey ? ROUTE_BANNERS[routeKey]?.[plan] : null) ?? DEFAULT_BANNERS[plan] ?? DEFAULT_BANNERS.free;
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
