<template>
  <Modal :open="planStore.upgrade['upgrade']?.open || false">
    <div class="mx-auto w-full max-w-4xl">
      <div class="flex flex-col overflow-hidden rounded-xl bg-gray-50 shadow-xl">

        <!-- Header -->
        <div class="border-b border-slate-100 px-8 pb-6 pt-8 text-center">
          <span class="text-xs font-bold uppercase tracking-wider text-blue-600">Planos</span>
          <h2 class="mt-1 text-2xl font-black text-slate-900">Escolha seu plano</h2>
          <p class="mt-1 text-sm text-slate-500">Sem surpresas. Cancele quando quiser.</p>
        </div>

        <!-- Toggle mensal / anual -->
        <div v-if="hasYearlyAndMonthly" class="flex items-center justify-center gap-4 border-b border-slate-100 px-8 py-4">
          <span :class="['text-sm font-medium', !isYearly ? 'text-slate-900' : 'text-slate-400']">Mensal</span>
          <button
            :class="['relative h-6 w-11 rounded-full transition-colors focus:outline-none', isYearly ? 'bg-slate-900' : 'bg-slate-200']"
            @click="isYearly = !isYearly"
          >
            <span :class="['absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform', isYearly ? 'translate-x-5' : 'translate-x-0']" />
          </button>
          <div class="flex flex-col items-start">
            <span :class="['text-sm font-medium leading-none', isYearly ? 'text-slate-900' : 'text-slate-400']">Anual</span>
            <span :class="['mt-1 text-xs font-bold leading-none', isYearly ? 'text-emerald-600' : 'text-emerald-500']">2 meses grátis</span>
          </div>
        </div>

        <!-- Planos -->
        <div class="px-6 py-6">

          <!-- Skeleton -->
          <div v-if="planStore.plansLoading" class="grid gap-4 md:grid-cols-3">
            <div
              v-for="i in 3"
              :key="i"
              :class="['relative flex flex-col rounded-xl border p-5', i === 2 ? 'border-slate-800 bg-slate-800' : 'border-slate-200 bg-white']"
            >
              <div :class="['h-2.5 w-14 rounded-full animate-pulse', i === 2 ? 'bg-slate-700' : 'bg-slate-200']" />
              <div class="mt-3 flex items-baseline gap-1">
                <div :class="['h-7 w-20 rounded-lg animate-pulse', i === 2 ? 'bg-slate-700' : 'bg-slate-200']" />
                <div :class="['h-2.5 w-7 rounded animate-pulse', i === 2 ? 'bg-slate-700' : 'bg-slate-100']" />
              </div>
              <div :class="['mt-1 h-2 w-28 rounded animate-pulse', i === 2 ? 'bg-slate-700' : 'bg-slate-100']" />
              <div class="mt-4 flex-1 space-y-2.5">
                <div v-for="(w, j) in [80, 60, 72, 52, 64]" :key="j" class="flex items-center gap-2">
                  <div :class="['h-3.5 w-3.5 flex-shrink-0 rounded animate-pulse', i === 2 ? 'bg-slate-700' : 'bg-slate-100']" />
                  <div :class="['h-2.5 rounded animate-pulse', i === 2 ? 'bg-slate-700' : 'bg-slate-100']" :style="`width: ${w}%`" />
                </div>
              </div>
              <div :class="['mt-5 h-8 w-full rounded-lg animate-pulse', i === 2 ? 'bg-slate-700' : 'bg-slate-200']" />
            </div>
          </div>

          <!-- Cards -->
          <div
            v-else
            class="grid gap-4"
            :class="{
              'md:grid-cols-4': visiblePlans.length >= 4,
              'md:grid-cols-3': visiblePlans.length === 3,
              'md:grid-cols-2': visiblePlans.length === 2,
              'md:grid-cols-1 max-w-xs mx-auto': visiblePlans.length === 1
            }"
          >
            <div
              v-for="plan in visiblePlans"
              :key="plan.id"
              :class="[
                'relative flex flex-col rounded-xl border p-5 transition',
                isCurrentPlan(plan)
                  ? 'border-blue-200 bg-blue-50 ring-1 ring-blue-200'
                  : plan.recommended
                    ? 'border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-900/20 md:-mt-2'
                    : 'border-slate-200 bg-white hover:border-slate-300'
              ]"
            >
              <!-- Badge -->
              <div
                v-if="isCurrentPlan(plan)"
                class="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white"
              >
                Plano atual
              </div>
              <div
                v-else-if="plan.recommended"
                class="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
              >
                Mais escolhido
              </div>

              <!-- Name -->
              <div :class="['text-xs font-bold uppercase tracking-widest', isCurrentPlan(plan) ? 'text-blue-600' : 'text-slate-400']">
                {{ plan.name }}
              </div>

              <!-- Price -->
              <div class="mt-3">
                <template v-if="plan.stripePriceId === 'business'">
                  <span :class="['text-lg font-bold', isCurrentPlan(plan) ? 'text-slate-900' : plan.recommended ? 'text-white' : 'text-slate-900']">Sob consulta</span>
                  <p class="mt-0.5 text-xs text-slate-400">Preço sob medida para sua operação</p>
                </template>
                <template v-else>
                  <div class="flex items-baseline gap-1">
                    <span :class="['text-2xl font-black', isCurrentPlan(plan) ? 'text-slate-900' : plan.recommended ? 'text-white' : 'text-slate-900']">
                      {{ displayPrice(plan) }}
                    </span>
                    <span v-if="plan.priceCents > 0" class="text-xs text-slate-400">/mês</span>
                    <span v-if="plan.priceCents === 0" class="text-xs text-slate-400">para sempre</span>
                  </div>
                  <p v-if="plan.billingPeriod === 'year'" :class="['mt-0.5 text-xs', plan.recommended ? 'text-slate-500' : 'text-slate-400']">
                    cobrança anual · {{ plan.priceFormatted }}/ano
                  </p>
                </template>
              </div>

              <!-- "Tudo do X mais:" -->
              <p v-if="prevPlan(plan.name)" :class="['mt-4 text-xs font-semibold uppercase tracking-wider', isCurrentPlan(plan) ? 'text-slate-500' : plan.recommended ? 'text-slate-400' : 'text-slate-400']">
                Tudo do {{ prevPlan(plan.name) }} mais:
              </p>

              <!-- Highlights -->
              <ul :class="['mt-2 flex-1 space-y-2 text-xs', isCurrentPlan(plan) ? 'text-slate-700' : plan.recommended ? 'text-slate-300' : 'text-slate-600']">
                <li v-for="(h, i) in featureHighlights(plan.highlights)" :key="i" class="flex items-start gap-2">
                  <template v-if="isWA(h)">
                    <BaseIcon name="WhatsApp" class="mt-0.5 !h-3.5 !w-3.5 flex-shrink-0 text-emerald-400" />
                    <span class="font-semibold text-emerald-400">{{ h }}</span>
                  </template>
                  <template v-else>
                    <BaseIcon
                      name="Check"
                      :class="['mt-0.5 !h-3.5 !w-3.5 flex-shrink-0', isCurrentPlan(plan) ? 'text-blue-500' : plan.recommended ? 'text-blue-400' : 'text-blue-600']"
                    />
                    <span>{{ h }}</span>
                  </template>
                </li>
              </ul>

              <!-- Contato Business -->
              <div v-if="contactHighlights(plan.highlights).length" class="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 space-y-1">
                <a
                  v-for="(h, i) in contactHighlights(plan.highlights)"
                  :key="i"
                  :href="h.includes('@') ? `mailto:${h}` : `https://wa.me/55${h.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Tenho interesse no plano Business do Roster Pro.')}`"
                  target="_blank"
                  class="flex items-center gap-1.5 text-xs text-slate-600 hover:text-emerald-700 transition-colors"
                >
                  <BaseIcon v-if="h.includes('@')" name="Envelope" class="!h-3 !w-3 flex-shrink-0" />
                  <BaseIcon v-else name="WhatsApp" class="!h-3 !w-3 flex-shrink-0 text-emerald-500" />
                  {{ h }}
                </a>
              </div>

              <!-- Ação -->
              <a
                v-if="canUpgrade(plan) && plan.stripePriceId === 'business'"
                :href="`https://wa.me/5511925572056?text=${encodeURIComponent('Olá! Tenho interesse no plano Business do Roster Pro.')}`"
                target="_blank"
                class="mt-5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                <BaseIcon name="WhatsApp" class="!h-3.5 !w-3.5" />
                {{ plan.buttonName }}
              </a>
              <button
                v-else-if="canUpgrade(plan)"
                :class="[
                  'mt-5 w-full rounded-lg py-2 text-xs font-bold transition',
                  isDowngrade(plan)
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : plan.recommended
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                ]"
                @click="createCheckout(plan)"
              >
                {{ isDowngrade(plan) ? 'Fazer downgrade' : plan.buttonName }}
              </button>
              <div
                v-else
                class="mt-5 w-full rounded-lg border border-blue-200 bg-blue-50 py-2 text-center text-xs font-semibold text-blue-600"
              >
                Plano Atual
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-center border-t border-slate-100 px-8 py-4">
          <button
            class="text-sm font-medium text-slate-400 transition hover:text-slate-700"
            @click="planStore.setClose('upgrade')"
          >
            Continuar no plano atual
          </button>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script>
import { ref, computed, watch } from 'vue';
import Modal from '@/components/modal/Modal';
import { track, EVENTS } from '@/analytics';
import BaseIcon from '@/components/icons/BaseIcon';
import { usePlanStore } from '@/components/plan/store';
import { useAuthStore } from '@/modules/auth/store';
import { loadStripe } from '@stripe/stripe-js';

const PLAN_ORDER = { Free: 0, Essential: 1, Pro: 2, Business: 3 };

const RESOURCE_LABELS = {
  users:     'colaboradores',
  teams:     'equipes',
  companies: 'instituições',
};

export default {
  components: { Modal, BaseIcon },

  setup() {
    const planStore = usePlanStore();
    const authStore = useAuthStore();
    const isYearly = ref(false);
    const stripe = ref(null);

    loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
      .then(s => { stripe.value = s; })
      .catch(() => {});

    const isOpen = computed(() => planStore.upgrade?.upgrade?.open === true);

    watch(isOpen, (open) => {
      if (open) planStore.fetchPlans();
    });

    const hasYearlyAndMonthly = computed(() =>
      planStore.plans.some(p => p.billingPeriod === 'month') &&
      planStore.plans.some(p => p.billingPeriod === 'year')
    );

    const visiblePlans = computed(() => {
      if (!planStore.plans.length) return [];
      const period = isYearly.value ? 'year' : 'month';
      return planStore.plans.filter(p =>
        p.billingPeriod === period ||
        (p.billingPeriod === null && p.stripePriceId !== 'free')
      );
    });

    return { planStore, authStore, isYearly, stripe, isOpen, hasYearlyAndMonthly, visiblePlans };
  },

  methods: {
    isCurrentPlan(plan) {
      return plan.name === this.planStore.name &&
        plan.billingPeriod === this.planStore.billingPeriod;
    },

    canUpgrade(plan) {
      return !this.isCurrentPlan(plan);
    },

    isDowngrade(plan) {
      const currentOrder = PLAN_ORDER[this.planStore.name] ?? -1;
      const targetOrder  = PLAN_ORDER[plan.name] ?? -1;
      return targetOrder < currentOrder;
    },

    displayPrice(plan) {
      if (plan.billingPeriod === 'year' && plan.priceCents > 0) {
        const monthly = plan.priceCents / 12 / 100;
        return monthly.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      }
      return plan.priceFormatted || (plan.priceCents === 0 ? 'Grátis' : '—');
    },

    isWA(highlight) {
      return highlight.toLowerCase().includes('whatsapp');
    },

    prevPlan(name) {
      return { Essential: 'Free', Pro: 'Essential', Business: 'Pro' }[name] || null;
    },

    featureHighlights(highlights) {
      return (highlights || []).filter(h => !h.includes('@') && !h.match(/^\(/));
    },

    contactHighlights(highlights) {
      return (highlights || []).filter(h => h.includes('@') || h.match(/^\(/));
    },

    async createCheckout(plan) {
      try {
        this.planStore.setClose('upgrade');

        if (this.isDowngrade(plan)) {
          await this.handleDowngrade(plan);
        } else {
          this.showUpgradeConfirmation(plan.stripePriceId, plan.name);
        }
      } catch (error) {
        console.error('Erro ao processar mudança de plano:', error);
      }
    },

    async handleDowngrade(plan) {
      let impact = null;
      try {
        const response = await this.axios.get(`/plans/${plan.stripePriceId}/downgrade_impact`);
        impact = response.impact;
      } catch {
        // Se não conseguir o impacto, exibe confirmação genérica
      }

      const affected = impact
        ? Object.entries(impact)
            .filter(([, v]) => v.to_lock > 0)
            .map(([r, v]) => `• ${v.to_lock} ${RESOURCE_LABELS[r] || r} serão desativados`)
        : [];

      const description = affected.length
        ? `Os seguintes recursos excedem os limites do plano ${plan.name}:\n\n${affected.join('\n')}\n\nSeus dados ficam preservados. Basta fazer upgrade para reativar.`
        : `Ao confirmar, seu plano será alterado para ${plan.name} imediatamente.`;

      this.confirmationStore.setConfirmation({
        title:       `Fazer downgrade para ${plan.name}?`,
        description,
        open:        true,
        confirmText: 'Confirmar downgrade',
        onConfirm:   async () => {
          await this.executeCheckout(plan.stripePriceId);
        },
        onCancel: () => {
          this.confirmationStore.close();
        }
      });
    },

    showUpgradeConfirmation(priceId, planName) {
      this.confirmationStore.setConfirmation({
        title:       `Confirmar upgrade para ${planName}?`,
        description: 'Ao confirmar, seu plano será atualizado imediatamente e os novos recursos ficarão disponíveis.',
        open:        true,
        confirmText: 'Confirmar upgrade',
        onConfirm:   async () => {
          await this.executeCheckout(priceId);
        },
        onCancel: () => {
          this.confirmationStore.close();
        }
      });
    },

    async executeCheckout(priceId) {
      const response = await this.axios.put(`/plans/${priceId}/upgrade`);
      if (response.type === 'checkout') {
        this.stripe.redirectToCheckout({ sessionId: response.id });
      } else if (response.type === 'subscription') {
        track(EVENTS.PLAN_UPGRADED, { price_id: priceId });
        this.confirmationStore.close();
        this.$router.replace('/');
      }
    }
  }
};
</script>
