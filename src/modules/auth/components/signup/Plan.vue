<template>
  <div class="min-h-screen bg-slate-100">

    <!-- Header nav -->
    <div class="border-b border-slate-200 bg-white px-8 py-4">
      <div class="mx-auto flex max-w-7xl items-center justify-between">
        <img src="@/assets/roster.png" alt="Roster Pro" class="w-32" />
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          @click="previewStep"
        >
          <BaseIcon name="ChevronLeft" class="!size-4" />
          Voltar
        </button>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-6 py-16 lg:px-8">

      <!-- Heading -->
      <div class="mb-12 text-center">
        <span class="text-sm font-semibold uppercase tracking-wider text-blue-600">Planos</span>
        <h2 class="mt-3 text-4xl font-black text-slate-900">Comece grátis. Escale quando precisar.</h2>
        <p class="mt-4 text-lg text-slate-500">Sem surpresas, sem fidelidade. Cancele quando quiser.</p>
      </div>

      <!-- Toggle Mensal/Anual -->
      <div v-if="!loading && !loadError" class="mb-12 flex items-center justify-center gap-4">
        <span :class="['text-sm font-medium', !isYearly ? 'text-slate-900' : 'text-slate-400']">Mensal</span>
        <button
          :class="['relative h-6 w-11 rounded-full transition-colors focus:outline-none', isYearly ? 'bg-slate-900' : 'bg-slate-200']"
          @click="isYearly = !isYearly"
        >
          <span :class="['absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform', isYearly ? 'translate-x-5' : 'translate-x-0']" />
        </button>
        <div class="flex flex-col items-start">
          <span :class="['text-sm font-medium leading-none', isYearly ? 'text-slate-900' : 'text-slate-400']">Anual</span>
          <span :class="['mt-1 text-xs font-bold leading-none transition-colors', isYearly ? 'text-emerald-600' : 'text-emerald-500']">
            2 meses grátis
          </span>
        </div>
      </div>

      <!-- Erro de registro -->
      <div
        v-if="signupError"
        class="mb-8 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
      >
        <BaseIcon name="ExclamationCircle" class="!size-5 shrink-0 mt-0.5 text-red-500" />
        <span>{{ signupError }}</span>
      </div>

      <!-- Carregando -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-4">
        <svg class="h-8 w-8 animate-spin text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        <p class="text-sm text-slate-400">Carregando planos...</p>
      </div>

      <!-- Erro ao carregar -->
      <div v-else-if="loadError" class="flex flex-col items-center justify-center py-24 gap-4">
        <p class="text-sm text-slate-500">Não foi possível carregar os planos. Verifique sua conexão.</p>
        <button
          type="button"
          class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          @click="getPlans"
        >
          Tentar novamente
        </button>
      </div>

      <!-- Cards de plano -->
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-start">
        <div
          v-for="plan in filteredPlans"
          :key="plan.id"
          :class="[
            'relative flex flex-col rounded-2xl border p-8 transition',
            plan.recommended
              ? 'border-slate-900 bg-slate-900 text-white shadow-2xl shadow-slate-900/20 lg:-mt-4'
              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
          ]"
        >
          <!-- Badge recomendado -->
          <div
            v-if="plan.recommended"
            class="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-blue-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white"
          >
            Mais escolhido
          </div>

          <!-- Nome do plano -->
          <div class="text-xs font-bold uppercase tracking-widest text-slate-400">
            {{ plan.name }}
          </div>

          <!-- Preço -->
          <div class="mt-4">
            <div class="flex items-baseline gap-1">
              <span :class="['text-4xl font-black', plan.recommended ? 'text-white' : 'text-slate-900']">
                {{ plan.priceFormatted }}
              </span>
              <span v-if="plan.stripePriceId !== 'free' && plan.stripePriceId !== 'business'" class="text-sm text-slate-400">
                /mês
              </span>
              <span v-else-if="plan.stripePriceId === 'free'" class="text-sm text-slate-400">
                para sempre
              </span>
            </div>
            <p v-if="isYearly && plan.stripePriceId !== 'free' && plan.stripePriceId !== 'business'" class="mt-0.5 text-xs text-slate-400">
              cobrança anual
            </p>
          </div>

          <!-- Highlights -->
          <ul :class="['mt-6 flex-1 space-y-2.5 text-sm', plan.recommended ? 'text-slate-300' : 'text-slate-600']">
            <li v-for="(highlight, idx) in plan.highlights" :key="idx" class="flex items-start gap-2.5">
              <BaseIcon name="Check" :class="['!size-4 mt-0.5 shrink-0', plan.recommended ? 'text-blue-300' : 'text-blue-600']" />
              {{ highlight }}
            </li>
          </ul>

          <!-- CTA -->
          <button
            :class="[
              'mt-8 w-full rounded-xl py-2.5 text-sm font-bold transition',
              plan.recommended
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            ]"
            @click="handleFunction(plan)"
          >
            {{ plan.buttonName }}
          </button>
        </div>
      </div>

      <!-- Tabela comparativa -->
      <div v-if="!loading && !loadError" class="mt-24">
        <h3 class="mb-8 text-center text-2xl font-bold text-slate-900">Comparativo completo</h3>
        <div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50">
                <th class="py-4 pl-6 pr-4 text-left font-semibold text-slate-700">Recurso</th>
                <th
                  v-for="name in planNames"
                  :key="name"
                  :class="['px-4 py-4 text-center font-semibold', name === 'Pro' ? 'text-slate-900' : 'text-slate-500']"
                >
                  {{ name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <template v-for="group in comparison" :key="group.category">
                <tr class="bg-slate-50">
                  <td colspan="5" class="py-2 pl-6 text-xs font-bold uppercase tracking-wider text-slate-400">
                    {{ group.category }}
                  </td>
                </tr>
                <tr
                  v-for="row in group.rows"
                  :key="row.label"
                  class="border-t border-slate-100 hover:bg-slate-50"
                >
                  <td class="py-3 pl-6 pr-4 text-slate-700">{{ row.label }}</td>
                  <td v-for="(val, i) in row.values" :key="i" class="px-4 py-3 text-center">
                    <!-- Booleano true -->
                    <BaseIcon v-if="val === true" name="Check" class="!size-5 mx-auto text-blue-600" />
                    <!-- Booleano false -->
                    <span v-else-if="val === false" class="text-lg text-slate-300">—</span>
                    <!-- Texto -->
                    <span v-else class="text-sm text-slate-600">{{ val }}</span>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import { useAuthStore } from '@/modules/auth/store';
import { useCompanyStore } from '@/modules/users/store/company';
import { useUserStore } from '@/modules/users/store/user';
import { loadStripe } from '@stripe/stripe-js';

export default {
  name: 'Plans',
  components: { BaseIcon },
  data() {
    return {
      isYearly: false,
      apiPlans: [],
      loading: true,
      loadError: false,
      signupError: '',
      stripe: null,
      planNames: ['Free', 'Pro'],
      comparison: [
        {
          category: 'Limites',
          rows: [
            { label: 'Vagas simultâneas',    values: ['Até 3', 'Ilimitadas'] },
            { label: 'Candidatos por vaga',  values: ['Até 50', 'Ilimitados'] }
          ]
        },
        {
          category: 'Funcionalidades',
          rows: [
            { label: 'Pipeline básico',          values: [true,  true] },
            { label: 'Pipeline personalizado',    values: [false, true] },
            { label: 'IA — Parsing de currículo', values: [false, true] },
            { label: 'Analytics de funil',        values: [false, true] },
            { label: 'Publicação LinkedIn',       values: [false, true] }
          ]
        },
        {
          category: 'Suporte',
          rows: [
            { label: 'Canal', values: ['E-mail', 'Chat + WhatsApp 24h'] }
          ]
        }
      ]
    };
  },
  computed: {
    authStore() { return useAuthStore(); },
    companyStore() { return useCompanyStore(); },
    userStore() { return useUserStore(); },
    filteredPlans() {
      return this.apiPlans.filter(
        p => p.billingPeriod === (this.isYearly ? 'year' : 'month') || p.billingPeriod === null
      );
    }
  },
  mounted() {
    // Stripe e planos são independentes — não bloquear um no outro
    loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
      .then(stripe => { this.stripe = stripe; })
      .catch(() => {});

    if (this.$route.query?.plan_id && this.$route.query?.action) {
      this.handleFunction({ id: this.$route.query.plan_id, action: this.$route.query?.action });
    } else {
      this.getPlans();
    }
  },
  methods: {
    async getPlans() {
      this.loading = true;
      this.loadError = false;
      try {
        const response = await this.axios.get('plans?module=vagas');
        if (response?.length) {
          this.apiPlans = response;
        } else {
          this.loadError = true;
        }
      } catch {
        this.loadError = true;
      } finally {
        this.loading = false;
      }
    },
    async handleFunction(plan) {
      this.authStore.register.planId = plan.id;

      if (plan.action === 'successful' || plan.stripePriceId === 'free') {
        this.signup();
      } else if (plan.stripePriceId === 'business') {
        window.open('mailto:contato@rosterpro.com.br?subject=Plano Business', '_blank');
      } else {
        await this.createCheckout();
      }
    },
    async createCheckout() {
      this.signupError = '';
      try {
        const payload = this.authStore.isOauth ? this.payloadOauth() : this.payloadRegister();
        const response = await this.axios.post('register', payload);
        const { error } = await this.stripe.redirectToCheckout({ sessionId: response.id });
        if (error) this.signupError = error.message;
      } catch (error) {
        this.signupError = error?.response?.data?.error || 'Erro ao processar o pagamento. Tente novamente.';
      }
    },
    async previewStep() {
      this.authStore.stepRegister -= 1;
    },
    async signup() {
      this.signupError = '';
      const payload = this.authStore.isOauth ? this.payloadOauth() : this.payloadRegister();
      try {
        const response = await this.axios.post('register', payload);
        // Auto-login se recebemos token (plano Free, OAuth ou email)
        if (response?.token) {
          this.authStore.login(response);
          this.authStore.setLoginMethod(this.authStore.isOauth ? 'google' : 'password');
          this.companyStore.setChosenCompany(response?.companies[0]);
          this.userStore.setUserCompany(response?.companies[0]?.id);
          this.$router.replace('/');
        } else {
          // Sem token = cadastro em andamento (confirmação de e-mail) → passo 4
          this.authStore.stepRegister += 1;
        }
      } catch (error) {
        this.signupError = error?.response?.data?.error || 'Erro ao criar conta. Tente novamente.';
      }
    },
    payloadOauth() {
      return {
        user: {
          name:  this.authStore.provider?.payload?.name,
          email: this.authStore.provider?.payload?.email?.toLowerCase(),
          phone: this.authStore.register.phone,
          terms: this.authStore.register.terms,
          marketing_consent: !!this.authStore.register.marketing_consent
        },
        company: {
          name:     this.authStore.register.companyName,
          document: this.authStore.register.companyDocument,
          kind:     this.authStore.register.companyType
        },
        plan: { id: this.authStore.register.planId },
        product: { module: this.authStore.activeProduct || 'escalas' },
        provider: {
          name: this.authStore.provider?.name,
          id:   this.authStore.provider?.name === 'google'
            ? this.authStore.provider?.payload?.sub
            : this.authStore.provider?.payload?.id
        }
      };
    },
    payloadRegister() {
      return {
        user: {
          name: this.authStore.register?.name,
          email: this.authStore.register?.email.toLowerCase(),
          phone: this.authStore.register.phone,
          password: this.authStore.register.password,
          passwordConfirmation: this.authStore.register.passwordConfirmation,
          terms: this.authStore.register.terms,
          marketing_consent: !!this.authStore.register.marketing_consent
        },
        company: {
          name: this.authStore.register.companyName,
          document: this.authStore.register.companyDocument,
          kind: this.authStore.register.companyType
        },
        plan: { id: this.authStore.register.planId },
        product: { module: this.authStore.activeProduct || 'escalas' }
      };
    }
  }
};
</script>
