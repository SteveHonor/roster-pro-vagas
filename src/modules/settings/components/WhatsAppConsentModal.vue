<template>
  <div v-if="open" class="relative z-[100]" role="dialog" aria-modal="true">
    <div class="fixed inset-0 bg-gray-500/80 transition-opacity" aria-hidden="true" />

    <div class="fixed inset-0 z-10 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div class="w-full max-w-md rounded-t-2xl bg-white px-6 pb-8 pt-6 shadow-xl sm:rounded-xl">

        <!-- Header -->
        <div class="mb-5 flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <BaseIcon name="WhatsApp" class="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-900">{{ title }}</p>
              <p class="text-xs text-gray-400">{{ subtitle }}</p>
            </div>
          </div>
          <button type="button" class="rounded-md p-1 text-gray-400 hover:text-gray-600" @click="$emit('cancel')">
            <BaseIcon name="XMark" class="h-5 w-5" />
          </button>
        </div>

        <!-- Step: sem telefone -->
        <template v-if="step === 'no_phone'">
          <div class="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Para receber notificações pelo WhatsApp, adicione um número de telefone no seu perfil em
            <strong>Configurações → Meus dados</strong>.
          </div>
          <button
            type="button"
            class="w-full rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            @click="$emit('cancel')"
          >
            Fechar
          </button>
        </template>

        <!-- Step: consentimento -->
        <template v-else-if="step === 'consent'">
          <ul class="mb-5 space-y-2.5">
            <li v-for="item in benefits" :key="item" class="flex items-start gap-2.5 text-sm text-gray-600">
              <BaseIcon name="Check" class="mt-0.5 !h-4 !w-4 flex-shrink-0 text-emerald-500" />
              {{ item }}
            </li>
          </ul>

          <label class="mb-5 flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <input
              v-model="accepted"
              type="checkbox"
              class="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-emerald-500 focus:ring-emerald-400"
            />
            <span class="text-xs leading-relaxed text-gray-500">
              Concordo em receber notificações via WhatsApp no número cadastrado.
              Posso desativar a qualquer momento nas configurações ou respondendo
              <strong class="font-medium text-gray-700">PARAR</strong> no WhatsApp.
            </span>
          </label>

          <div class="flex flex-col gap-2 sm:flex-row-reverse">
            <button
              type="button"
              :disabled="!accepted || loading"
              class="flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
              :class="accepted ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-gray-300'"
              @click="sendOtp"
            >
              <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Enviar código de verificação
            </button>
            <button type="button" class="w-full rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50" @click="$emit('cancel')">
              Agora não
            </button>
          </div>
        </template>

        <!-- Step: OTP -->
        <template v-else-if="step === 'otp'">
          <p class="mb-5 text-sm text-gray-500">
            Enviamos um código de 4 dígitos via WhatsApp para o número cadastrado no seu perfil.
          </p>

          <div class="mb-3">
            <input
              v-model="code"
              type="text"
              inputmode="numeric"
              pattern="\d{4}"
              maxlength="4"
              placeholder="0000"
              class="w-full rounded-md border px-4 py-3 text-center text-2xl font-bold tracking-[1rem] text-gray-800 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              :class="errorMsg ? 'border-red-300' : 'border-gray-300'"
              @keyup.enter="verifyOtp"
            />
            <p v-if="errorMsg" class="mt-1.5 text-xs text-red-500">{{ errorMsg }}</p>
          </div>

          <div class="mb-5 flex items-center justify-between">
            <button
              type="button"
              class="text-xs text-gray-400 underline hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
              :disabled="resendsLeft <= 0 || loading"
              @click="sendOtp"
            >
              Reenviar código {{ resendsLeft > 0 ? `(${resendsLeft} restante${resendsLeft === 1 ? '' : 's'})` : '(limite atingido)' }}
            </button>
            <span v-if="loading" class="text-xs text-gray-400">Enviando...</span>
          </div>

          <div class="flex flex-col gap-2 sm:flex-row-reverse">
            <button
              type="button"
              :disabled="code.length !== 4 || loading"
              class="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
              @click="verifyOtp"
            >
              <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Verificar
            </button>
            <button type="button" class="w-full rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50" @click="$emit('cancel')">
              Cancelar
            </button>
          </div>
        </template>

      </div>
    </div>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon.vue';

export default {
  name: 'WhatsAppConsentModal',
  components: { BaseIcon },
  props: {
    open:         { type: Boolean, default: false },
    phonePresent: { type: Boolean, default: false }
  },
  emits: ['confirm', 'cancel'],
  data: () => ({
    step:       'consent',
    loading:    false,
    accepted:   false,
    code:       '',
    errorMsg:   '',
    resendsLeft: 3,
    benefits: [
      'Confirmação de escalas com 1 toque (Aceitar / Recusar)',
      'Lembretes antes do dia do evento',
      'Comunicados e avisos importantes da equipe',
      'Consulte sua agenda respondendo "agenda" no WhatsApp'
    ]
  }),
  computed: {
    title() {
      if (this.step === 'no_phone')  return 'Número necessário';
      if (this.step === 'otp')       return 'Código enviado';
      return 'Ativar notificações no WhatsApp';
    },
    subtitle() {
      if (this.step === 'no_phone')  return 'Configure seu perfil para continuar';
      if (this.step === 'otp')       return 'Digite o código para confirmar';
      return 'Receba avisos direto no seu celular';
    }
  },
  watch: {
    open(val) {
      if (val) {
        this.reset();
        this.step = this.phonePresent ? 'consent' : 'no_phone';
      }
    }
  },
  methods: {
    reset() {
      this.accepted    = false;
      this.code        = '';
      this.errorMsg    = '';
      this.resendsLeft = 3;
      this.loading     = false;
    },
    async sendOtp() {
      if (!this.accepted && this.step === 'consent') return;
      this.loading  = true;
      this.errorMsg = '';
      try {
        const res = await this.axios.post('/whatsapp/opt_in/send_otp');
        this.resendsLeft = res.resends_left ?? 0;
        this.code        = '';
        this.step        = 'otp';
      } catch (err) {
        this.errorMsg = err?.response?.data?.error || 'Erro ao enviar código. Tente novamente.';
      } finally {
        this.loading = false;
      }
    },
    async verifyOtp() {
      if (this.code.length !== 4) return;
      this.loading  = true;
      this.errorMsg = '';
      try {
        await this.axios.post('/whatsapp/opt_in/verify_otp', { code: this.code });
        this.$emit('confirm');
      } catch (err) {
        this.errorMsg = err?.response?.data?.error || 'Código inválido. Tente novamente.';
        this.code     = '';
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
