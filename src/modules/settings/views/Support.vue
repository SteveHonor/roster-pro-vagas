<template>
  <div class="mx-auto max-w-2xl px-4 py-6 sm:px-0 sm:py-8">

    <!-- Header -->
    <header class="mb-8">
      <h1 class="text-2xl font-extrabold text-gray-800">Suporte ao Cliente</h1>
      <p class="mt-1.5 text-sm text-gray-500">
        Precisa de ajuda? Entre em contato pelo canal disponível no seu plano.
      </p>
    </header>

    <!-- Canais de suporte -->
    <div class="mb-8 grid gap-4 sm:grid-cols-2">

      <!-- E-mail (todos os planos) -->
      <a
        href="mailto:suporte@rosterpro.com.br"
        class="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow-md"
      >
        <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
          <BaseIcon name="Envelope" class="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <p class="font-semibold text-gray-800">E-mail</p>
          <p class="text-xs text-gray-500">suporte@rosterpro.com.br</p>
          <p class="mt-1 text-xs font-medium text-gray-400">Resposta {{ emailSla }}</p>
        </div>
      </a>

      <!-- WhatsApp: desbloqueado (Pro/Business) -->
      <a
        v-if="hasWhatsApp"
        href="https://wa.me/5511977164412"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-start gap-4 rounded-xl border border-green-200 bg-green-50 p-5 shadow-sm transition hover:border-green-300 hover:shadow-md"
      >
        <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 14h.01M16 10h.01M21 12c0 4.418-3.582 8-8 8a7.96 7.96 0 01-4.906-1.633L3 21l1.633-5.094A7.96 7.96 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
          </svg>
        </div>
        <div>
          <p class="font-semibold text-gray-800">WhatsApp</p>
          <p class="text-xs text-gray-500">(11) 9 7716-4412</p>
          <p class="mt-1 text-xs font-medium text-green-600">Resposta {{ whatsAppSla }} (Seg–Sáb, 9h–18h)</p>
        </div>
      </a>

      <!-- WhatsApp: upgrade hook (Free/Essential) -->
      <button
        v-else
        type="button"
        class="flex items-start gap-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-5 text-left transition hover:border-orange-300 hover:bg-orange-50"
        @click="planStore.setOpen('upgrade')"
      >
        <div class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-gray-200">
          <BaseIcon name="LockClosed" class="h-5 w-5 text-gray-400" />
        </div>
        <div>
          <div class="flex items-center gap-1.5">
            <p class="font-semibold text-gray-500">WhatsApp</p>
            <span class="rounded-full bg-orange-100 px-1.5 py-px text-[10px] font-semibold text-orange-500">Pro</span>
          </div>
          <p class="mt-0.5 text-xs text-gray-400">Atendimento via WhatsApp com resposta rápida.</p>
          <p class="mt-1 flex items-center gap-0.5 text-xs font-semibold text-orange-500">Fazer upgrade <BaseIcon name="ChevronRight" class="!h-3 !w-3" /></p>
        </div>
      </button>
    </div>

    <!-- Badge prioritário (Business) -->
    <div v-if="hasDedicated" class="mb-8 flex items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4">
      <BaseIcon name="Sparkles" class="h-5 w-5 flex-shrink-0 text-blue-600" />
      <div>
        <p class="text-sm font-semibold text-blue-800">Atendimento prioritário</p>
        <p class="text-xs text-blue-500">Seu plano garante resposta em até 4h via WhatsApp (Seg–Sáb, 9h–18h).</p>
      </div>
    </div>

    <!-- FAQ -->
    <section>
      <h2 class="mb-4 text-lg font-bold text-gray-700">Perguntas frequentes</h2>
      <div class="space-y-3">
        <div
          v-for="(item, index) in faqs"
          :key="index"
          class="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
        >
          <button
            class="flex w-full items-center justify-between text-left"
            @click="toggleFaq(index)"
          >
            <span class="text-sm font-medium text-gray-700">{{ item.question }}</span>
            <BaseIcon
              name="ChevronDown"
              class="h-4 w-4 flex-shrink-0 text-gray-400 transition-transform"
              :class="{ 'rotate-180': openFaq === index }"
            />
          </button>
          <div v-if="openFaq === index" class="mt-2 text-xs leading-relaxed text-gray-500">
            {{ item.answer }}
          </div>
        </div>
      </div>
    </section>

    <!-- Rodapé SLA -->
    <p class="mt-8 text-center text-xs text-gray-400">
      {{ slaFooter }}
    </p>

  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { usePlanStore } from '@/components/plan/store';

export default {
  name: 'Support',
  components: { BaseIcon },
  data() {
    return {
      openFaq: null,
      faqs: [
        {
          question: 'O sistema possui plano gratuito?',
          answer: 'Sim. O plano Free é 100% gratuito, sem necessidade de cartão de crédito, com suporte por e-mail com resposta em até 5 dias.'
        },
        {
          question: 'Meus dados estão protegidos pela LGPD?',
          answer: 'Sim. Seguimos a LGPD e garantimos transparência, segurança e privacidade no tratamento dos seus dados. Cada organização tem seus dados completamente isolados.'
        },
        {
          question: 'Como entro em contato com o suporte?',
          answer: 'O canal depende do seu plano. Free: e-mail com resposta em até 5 dias úteis. Essential: e-mail com resposta em até 2 dias úteis. Pro: WhatsApp com resposta em até 8h (Seg–Sáb, 9h–18h). Business: WhatsApp com resposta em até 4h (Seg–Sáb, 9h–18h).'
        }
      ]
    };
  },
  computed: {
    planStore: () => usePlanStore(),
    planName() {
      return (this.planStore.name || '').toLowerCase();
    },
    hasWhatsApp() {
      return ['pro', 'business'].includes(this.planName);
    },
    hasDedicated() {
      return this.planName === 'business';
    },
    emailSla() {
      if (this.planName === 'essential') return 'em até 2 dias úteis';
      if (this.hasWhatsApp) return 'quando necessário';
      return 'em até 5 dias úteis';
    },
    whatsAppSla() {
      return this.planName === 'business' ? 'até 4h' : 'até 8h';
    },
    slaFooter() {
      if (this.hasWhatsApp) return `WhatsApp — resposta em ${this.whatsAppSla} (Seg–Sáb, 9h–18h).`;
      if (this.planName === 'essential') return 'E-mail — resposta em até 2 dias úteis (Seg–Sex).';
      return 'E-mail — resposta em até 5 dias úteis (Seg–Sex).';
    }
  },
  methods: {
    toggleFaq(index) {
      this.openFaq = this.openFaq === index ? null : index;
    }
  }
};
</script>
