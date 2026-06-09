<template>
  <Modal :open="planStore.upgrade['limit']?.open || false">
    <div
      v-if="
        planStore.upgrade.type === 'limit' ||
        planStore.upgrade.type === 'access'
      "
      class="mx-auto w-full max-w-6xl"
    >
      <div
        class="flex flex-col overflow-hidden bg-white md:flex-row md:rounded-xl md:shadow-md"
      >
        <!-- Coluna esquerda -->
        <div
          class="flex w-full flex-col items-center space-y-12 bg-gray-700 px-10 py-12 text-white md:w-2/5"
        >
          <!-- Logo -->
          <img
            src="@/assets/roster-all-white.png"
            alt="RosterPro"
            class="w-36 md:w-48"
          />

          <!-- Condição: tipo do upgrade -->
          <div class="text-center md:pt-20">
            <div
              v-if="planStore.upgrade.type === 'limit'"
              class="flex flex-col gap-6"
            >
              <div>
                <h2 class="text-2xl font-bold leading-snug">
                  Você atingiu o limite do seu plano
                </h2>
                <p class="mt-3 text-sm leading-relaxed text-gray-300">
                  O plano <strong class="text-white">{{ planStore.name }}</strong> não suporta mais essa ação. Faça upgrade e continue crescendo sem interrupções.
                </p>
              </div>
              <div class="rounded-md border border-white/20 bg-white/10 p-4 text-sm text-gray-200">
                {{ getUpgradeMessage }}
              </div>
            </div>

            <div
              v-else-if="planStore.upgrade.type === 'access'"
              class="flex flex-col gap-6"
            >
              <div>
                <h2 class="text-2xl font-bold leading-snug">
                  Recurso disponível nos planos superiores
                </h2>
                <p class="mt-3 text-sm leading-relaxed text-gray-300">
                  Este recurso não está disponível no plano <strong class="text-white">{{ planStore.name }}</strong>. Desbloqueie agora e aproveite todo o potencial do Roster Pro.
                </p>
              </div>
              <div class="rounded-md border border-white/20 bg-white/10 p-4 text-sm text-gray-200">
                {{ getUpgradeMessage }}
              </div>
            </div>
          </div>
        </div>

        <!-- Coluna direita -->
        <div class="w-full px-6 py-10 sm:px-10 md:w-3/5">
          <!-- Título -->
          <div class="mb-8">
            <h2 class="text-lg font-bold text-gray-900">
              O que você vai desbloquear
            </h2>
            <p class="mt-1 text-sm text-gray-500">
              Faça upgrade e leve sua operação para o próximo nível.
            </p>
          </div>

          <!-- Benefícios do upgrade -->
          <div class="mb-8 grid grid-cols-2 gap-3">
            <div
              v-for="benefit in upgradeBenefits"
              :key="benefit.title"
              class="flex items-start gap-3 rounded-md border border-gray-100 bg-gray-50 p-3"
            >
              <div class="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded bg-blue-100">
                <BaseIcon :name="benefit.icon" class="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-800">{{ benefit.title }}</p>
                <p class="mt-0.5 text-xs text-gray-500">{{ benefit.description }}</p>
              </div>
            </div>
          </div>

          <!-- Prova social -->
          <div class="mb-6 rounded-md border border-blue-100 bg-blue-50 px-4 py-3">
            <p class="text-xs text-blue-700">
              <span class="font-semibold">Empresas que usam o Vagas Pro</span> preenchem vagas 2× mais rápido com pipeline personalizado e IA de currículos.
            </p>
          </div>

          <hr />

          <!-- Botões -->
          <div class="mt-6 flex justify-end gap-3">
            <button
              class="rounded px-4 py-2 text-sm text-gray-500 transition hover:text-gray-700"
              @click="planStore.setClose('limit'); planStore.setClose('upgrade')"
            >
              Agora não
            </button>
            <button
              class="flex items-center gap-2 rounded bg-orange-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
              @click="planStore.setClose('limit'); planStore.setOpen('upgrade')"
            >
              <BaseIcon name="Rocket" class="h-4 w-4" />
              <span>Ver planos e preços</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script>
import Modal from '@/components/modal/Modal';
import BaseIcon from '@/components/icons/BaseIcon.vue';

import { usePlanStore } from '@/components/plan/store';

export default {
  components: {
    Modal,
    BaseIcon
  },
  computed: {
    planStore: () => usePlanStore(),
    getUpgradeMessage() {
      const name = this.planStore.name || '';
      if (name.includes('Free')) return 'Você está no plano gratuito. Faça upgrade e contrate sem limites.';
      return 'Conheça nossos planos e encontre o ideal para sua organização.';
    },
    upgradeBenefits() {
      return [
        { icon: 'Briefcase', title: 'Vagas ilimitadas',       description: 'Publique sem restrição de quantidade' },
        { icon: 'Users',     title: 'Candidatos ilimitados',  description: 'Sem teto por vaga' },
        { icon: 'Squares2X2', title: 'Pipeline personalizado', description: 'Crie etapas customizadas por processo' },
        { icon: 'Sparkles',  title: 'IA de currículos',       description: 'Parsing automático de perfil e skills' },
        { icon: 'ChartBar',  title: 'Analytics de funil',     description: 'Taxa de conversão por etapa do pipeline' },
        { icon: 'ChatBubbleLeft', title: 'Suporte prioritário', description: 'Chat + WhatsApp 24h' }
      ];
    }
  }
};
</script>
