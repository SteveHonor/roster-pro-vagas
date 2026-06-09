<template>
  <div v-if="current" class="relative mb-6 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 pr-9 sm:pr-4">
    <button type="button" class="absolute right-2 top-2.5 rounded p-1 text-violet-300 hover:text-violet-500 transition" aria-label="Fechar" @click="dismiss">
      <BaseIcon name="XMark" class="!size-4" />
    </button>

    <!-- Desktop -->
    <div class="hidden sm:flex sm:items-center sm:justify-between sm:gap-4 sm:pr-6">
      <div class="flex items-center gap-2">
        <BaseIcon :name="current.icon" class="!size-4 shrink-0 text-violet-500" />
        <div>
          <p class="text-sm font-semibold text-violet-900">Novo: {{ current.title }}</p>
          <p class="text-xs text-violet-700 mt-0.5">{{ current.description }}</p>
        </div>
      </div>
      <router-link :to="current.route" class="shrink-0 text-xs font-semibold text-violet-600 hover:text-violet-800 underline inline-flex items-center gap-1">
        {{ current.cta }} <BaseIcon name="ChevronRight" class="!size-3" />
      </router-link>
    </div>

    <!-- Mobile -->
    <div class="sm:hidden">
      <div class="flex items-start gap-2">
        <BaseIcon :name="current.icon" class="!size-4 shrink-0 text-violet-500 mt-0.5" />
        <div>
          <p class="text-sm font-semibold text-violet-900">Novo: {{ current.title }}</p>
          <p class="text-xs text-violet-700 leading-relaxed mt-0.5">{{ current.description }}</p>
          <router-link :to="current.route" class="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800 underline">
            {{ current.cta }} <BaseIcon name="ChevronRight" class="!size-3" />
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import { usePlanStore } from '@/components/plan/store';

const ANNOUNCEMENTS = [
  { key: 'paid_scales_banner',          feature: 'paidScales',          icon: 'BankNotes', title: 'Escalas Remuneradas',              description: 'Controle de pagamentos por colaborador, com pagamento em lote e notificação automática.', cta: 'Criar agenda paga',  route: '/calendar/new' },
  { key: 'whatsapp_banner',             feature: 'whatsapp',             icon: 'WhatsApp',  title: 'Notificações via WhatsApp',        description: 'Seus colaboradores recebem confirmações de escala diretamente no WhatsApp.',              cta: 'Configurar agora',  route: '/settings' },
  { key: 'schedule_suggestions_banner', feature: 'scheduleSuggestions', icon: 'Sparkles',  title: 'Sugestões inteligentes de escala', description: 'O sistema sugere automaticamente os melhores colaboradores para cada escala.',               cta: 'Ver no calendário', route: '/calendar' },
  { key: 'smart_insights_banner',       feature: 'smartInsights',       icon: 'ChartBar',  title: 'Insights Inteligentes',            description: 'Análise automática de padrões de escala, faltas e desempenho da equipe.',                   cta: 'Ver dashboard',     route: '/' },
  { key: 'api_access_banner',           feature: 'apiAccess',           icon: 'Rocket',    title: 'Acesso à API',                     description: 'Integre o Roster Pro com seus sistemas via API REST com autenticação por token.',             cta: 'Ver chaves de API', route: '/settings' }
];

export default {
  name: 'NewFeaturesBanner',
  components: { BaseIcon },
  computed: {
    planStore: () => usePlanStore(),
    current() { return ANNOUNCEMENTS.find(a => this.planStore.hasFeature(a.feature) && !localStorage.getItem(a.key)) || null; }
  },
  methods: {
    dismiss() { if (this.current) { localStorage.setItem(this.current.key, '1'); this.$forceUpdate(); } }
  }
};
</script>
