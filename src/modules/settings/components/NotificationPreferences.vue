<template>
  <div>
  <WhatsAppConsentModal
    :open="consentModal.open"
    :phone-present="phonePresent"
    @confirm="onConsentConfirm"
    @cancel="onConsentCancel"
  />

  <div class="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_15rem]">

    <!-- Main column: banner + table -->
    <div>
      <!-- WhatsApp opt-in banner (Essential+ não ativado) -->
      <div
        v-if="canUseWhatsApp && !whatsappOptedIn"
        class="mb-4 flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
      >
        <div class="flex items-center gap-3">
          <BaseIcon name="WhatsApp" class="h-5 w-5 flex-shrink-0 text-emerald-500" />
          <p class="text-sm font-medium text-emerald-800">
            Receba notificações direto no WhatsApp — sem app extra.
          </p>
        </div>
        <button
          type="button"
          class="flex-shrink-0 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-600"
          @click="consentModal = { open: true }"
        >
          Ativar agora
        </button>
      </div>

      <!-- Preferences table -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white">

        <!-- Column header -->
        <div class="grid grid-cols-[1fr_3rem_3rem_4.5rem] items-center border-b border-gray-200 bg-gray-50 px-5 py-2.5">
          <span class="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Notificação</span>
          <span class="text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400">App</span>
          <span class="text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400">E-mail</span>
          <div class="flex items-center justify-center gap-1">
            <BaseIcon name="WhatsApp" class="!h-3 !w-3 flex-shrink-0 text-emerald-500" />
            <span class="text-[10px] font-semibold uppercase tracking-wide text-emerald-600">WA</span>
          </div>
        </div>

        <!-- Skeleton -->
        <SkeletonRows v-if="loading" :rows="6" has-prefix :toggle-cols="3" class="rounded-none border-0 gap-0" />

        <!-- Rows -->
        <div v-else class="divide-y divide-gray-100">
          <div
            v-for="pref in visiblePreferences"
            :key="pref.notificationType"
            class="grid grid-cols-[1fr_3rem_3rem_4.5rem] items-center px-5 py-3.5 transition-colors hover:bg-gray-50/60"
          >
            <!-- Notification info -->
            <div class="flex min-w-0 items-center gap-3 pr-3">
              <div
                class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                :class="config[pref.notificationType]?.bg"
              >
                <BaseIcon
                  :name="config[pref.notificationType]?.icon || 'Bell'"
                  class="!h-4 !w-4"
                  :class="config[pref.notificationType]?.color"
                />
              </div>
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-gray-800">
                  {{ labels[pref.notificationType] }}
                </p>
                <p class="truncate text-xs text-gray-400">
                  {{ descriptions[pref.notificationType] }}
                </p>
              </div>
            </div>

            <!-- App toggle -->
            <div class="flex justify-center">
              <button
                type="button"
                class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
                :class="pref.inApp ? 'bg-indigo-500' : 'bg-gray-200'"
                @click="update(pref, 'inApp', !pref.inApp)"
              >
                <span
                  class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200"
                  :class="pref.inApp ? 'translate-x-4' : 'translate-x-0'"
                />
              </button>
            </div>

            <!-- Email toggle -->
            <div class="flex justify-center">
              <button
                type="button"
                class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-1"
                :class="pref.email ? 'bg-indigo-500' : 'bg-gray-200'"
                @click="update(pref, 'email', !pref.email)"
              >
                <span
                  class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200"
                  :class="pref.email ? 'translate-x-4' : 'translate-x-0'"
                />
              </button>
            </div>

            <!-- WhatsApp toggle -->
            <div class="flex justify-center">
              <!-- Broadcast: WhatsApp não disponível para comunicados -->
              <span
                v-if="pref.notificationType === 'broadcast'"
                class="flex h-5 w-9 cursor-default items-center justify-center text-sm text-gray-300 select-none"
              >—</span>
              <button
                v-else-if="canUseWhatsApp"
                type="button"
                class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1"
                :class="pref.whatsapp ? 'bg-emerald-500' : 'bg-gray-200'"
                @click="update(pref, 'whatsapp', !pref.whatsapp)"
              >
                <span
                  class="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200"
                  :class="pref.whatsapp ? 'translate-x-4' : 'translate-x-0'"
                />
              </button>
              <button
                v-else
                type="button"
                title="Disponível no plano Essential ou superior"
                class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-100 transition-colors"
                @click="planStore.setOpen('upgrade')"
              >
                <span class="pointer-events-none inline-block h-4 w-4 translate-x-0 transform rounded-full bg-white shadow ring-0" />
                <span class="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 shadow-sm">
                  <BaseIcon name="LockClosed" class="!h-2.5 !w-2.5 text-white" />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sidebar -->
    <div class="hidden space-y-4 lg:block">

      <!-- WhatsApp card — 3 estados -->
      <!-- Free: upsell -->
      <div v-if="!canUseWhatsApp" class="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div class="bg-emerald-500 px-4 py-3">
          <div class="flex items-center gap-2">
            <BaseIcon name="WhatsApp" class="h-5 w-5 text-white" />
            <p class="text-sm font-bold text-white">Notifique pelo WhatsApp</p>
          </div>
        </div>
        <div class="px-4 py-4">
          <p class="mb-3 text-xs leading-relaxed text-gray-500">
            WhatsApp tem <strong class="text-gray-700">95% de taxa de abertura</strong> vs 22% do e-mail.
            Seu time confirma escalas com 1 toque, sem baixar nenhum app.
          </p>
          <ul class="mb-4 space-y-1.5">
            <li v-for="b in waBenefits" :key="b" class="flex items-start gap-2 text-xs text-gray-600">
              <BaseIcon name="Check" class="mt-0.5 !h-3.5 !w-3.5 flex-shrink-0 text-emerald-500" />
              {{ b }}
            </li>
          </ul>
          <button
            type="button"
            class="w-full rounded-lg bg-emerald-500 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-600"
            @click="planStore.setOpen('upgrade')"
          >
            Desbloquear no Essential
          </button>
        </div>
      </div>

      <!-- Essential+ não ativado: CTA de ativar -->
      <div v-else-if="!whatsappOptedIn" class="overflow-hidden rounded-xl border border-emerald-200 bg-white">
        <div class="bg-emerald-500 px-4 py-3">
          <div class="flex items-center gap-2">
            <BaseIcon name="WhatsApp" class="h-5 w-5 text-white" />
            <p class="text-sm font-bold text-white">Ative o WhatsApp</p>
          </div>
        </div>
        <div class="px-4 py-4">
          <p class="mb-3 text-xs leading-relaxed text-gray-500">
            Você tem WhatsApp disponível no seu plano. Ative para receber notificações direto no celular.
          </p>
          <ul class="mb-4 space-y-1.5">
            <li v-for="b in waBenefits" :key="b" class="flex items-start gap-2 text-xs text-gray-600">
              <BaseIcon name="Check" class="mt-0.5 !h-3.5 !w-3.5 flex-shrink-0 text-emerald-500" />
              {{ b }}
            </li>
          </ul>
          <button
            type="button"
            class="w-full rounded-lg bg-emerald-500 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-600"
            @click="consentModal = { open: true }"
          >
            Ativar agora
          </button>
        </div>
      </div>

      <!-- Ativo: status -->
      <div v-else class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4">
        <div class="mb-1 flex items-center gap-2">
          <BaseIcon name="WhatsApp" class="h-5 w-5 text-emerald-600" />
          <p class="text-sm font-bold text-emerald-800">WhatsApp ativo</p>
        </div>
        <p class="text-xs text-emerald-700">
          Você receberá notificações direto no celular conforme as preferências ao lado.
        </p>
      </div>

      <!-- Como funcionam os canais -->
      <div class="rounded-xl border border-gray-200 bg-white px-4 py-4">
        <p class="mb-3 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Como funcionam</p>
        <div class="space-y-3.5">
          <div class="flex items-start gap-2.5">
            <div class="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-indigo-50">
              <BaseIcon name="Bell" class="!h-3.5 !w-3.5 text-indigo-500" />
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-800">App</p>
              <p class="text-xs text-gray-400">Notificações no sino do dashboard em tempo real.</p>
            </div>
          </div>
          <div class="flex items-start gap-2.5">
            <div class="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-blue-50">
              <BaseIcon name="Envelope" class="!h-3.5 !w-3.5 text-blue-500" />
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-800">E-mail</p>
              <p class="text-xs text-gray-400">Chega direto na sua caixa de entrada.</p>
            </div>
          </div>
          <div class="flex items-start gap-2.5">
            <div class="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-emerald-50">
              <BaseIcon name="WhatsApp" class="!h-3.5 !w-3.5 text-emerald-500" />
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-800">WhatsApp</p>
              <p class="text-xs text-gray-400">Direto no celular. Confirme escalas em 1 toque.</p>
              <span
                v-if="!canUseWhatsApp"
                class="mt-1 inline-flex cursor-pointer items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 hover:bg-amber-100"
                @click="planStore.setOpen('upgrade')"
              >
                <BaseIcon name="LockClosed" class="!h-2.5 !w-2.5" />
                Essential+
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import WhatsAppConsentModal from './WhatsAppConsentModal.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import SkeletonRows from '@/components/skeleton/SkeletonRows';
import { useAuthStore } from '@/modules/auth/store';

export default {
  name: 'NotificationPreferences',
  components: { WhatsAppConsentModal, BaseIcon, SkeletonRows },
  data: () => ({
    loading: true,
    preferences: [],
    consentModal: { open: false },
    adminOnlyTypes: ['payment_failed', 'subscription_expiring', 'account_limit_warning'],
    labels: {
      schedule_created:       'Escalas criadas',
      schedule_changed:       'Alterações em escalas',
      schedule_cancelled:     'Escalas canceladas',
      schedule_reminder:      'Lembrete de escala',
      swap_request:           'Solicitações de troca',
      absence_approved:       'Ausências aprovadas/recusadas',
      broadcast:              'Comunicados',
      evaluation_received:    'Avaliações recebidas',
      payment_received:       'Confirmação de pagamento',
      payment_failed:         'Falha no pagamento',
      subscription_expiring:  'Plano vencendo',
      account_limit_warning:  'Limite da conta'
    },
    descriptions: {
      schedule_created:       'Quando uma nova escala é publicada',
      schedule_changed:       'Quando sua escala é modificada',
      schedule_cancelled:     'Quando uma escala sua é cancelada',
      schedule_reminder:      'Lembrete antecipado antes do dia da escala',
      swap_request:           'Quando alguém solicita ou aceita uma troca',
      absence_approved:       'Resultado das suas solicitações de ausência',
      broadcast:              'Mensagens enviadas pelo administrador',
      evaluation_received:    'Quando você recebe uma nova avaliação',
      payment_received:       'Quando seu pagamento é confirmado pelo administrador',
      payment_failed:         'Quando há problema no pagamento do plano',
      subscription_expiring:  'Aviso antecipado antes do vencimento do plano',
      account_limit_warning:  'Quando a conta se aproxima do limite do plano'
    },
    waBenefits: [
      'Confirmação de escalas em 1 toque (Aceitar / Recusar)',
      'Lembretes antes do dia do evento',
      'Consulte sua agenda respondendo "agenda"'
    ],
    config: {
      schedule_created:      { icon: 'Calendar',          bg: 'bg-blue-50',   color: 'text-blue-500' },
      schedule_changed:      { icon: 'Pencil',            bg: 'bg-amber-50',  color: 'text-amber-500' },
      schedule_cancelled:    { icon: 'XMark',             bg: 'bg-red-50',    color: 'text-red-500' },
      schedule_reminder:     { icon: 'Bell',              bg: 'bg-indigo-50', color: 'text-indigo-500' },
      swap_request:          { icon: 'ArrowPath',         bg: 'bg-purple-50', color: 'text-purple-500' },
      absence_approved:      { icon: 'Check',             bg: 'bg-green-50',  color: 'text-green-500' },
      broadcast:             { icon: 'Megaphone',         bg: 'bg-rose-50',   color: 'text-rose-500' },
      evaluation_received:   { icon: 'Star',              bg: 'bg-yellow-50', color: 'text-yellow-500' },
      payment_received:      { icon: 'BankNotes',         bg: 'bg-green-50',  color: 'text-green-600' },
      payment_failed:        { icon: 'Exclamation',       bg: 'bg-red-50',    color: 'text-red-500' },
      subscription_expiring: { icon: 'Clock',             bg: 'bg-orange-50', color: 'text-orange-500' },
      account_limit_warning: { icon: 'ChartBar',          bg: 'bg-amber-50',  color: 'text-amber-500' }
    }
  }),
  computed: {
    canUseWhatsApp() {
      return this.$can.canView('whatsapp');
    },
    whatsappOptedIn() {
      return useAuthStore().whatsappOptedIn;
    },
    phonePresent() {
      return useAuthStore().phonePresent;
    },
    isAdmin() {
      return useAuthStore().isAdmin;
    },
    visiblePreferences() {
      if (this.isAdmin) return this.preferences;
      return this.preferences.filter(p => !this.adminOnlyTypes.includes(p.notificationType));
    }
  },
  mounted() {
    this.fetchPreferences();
    if (this.$route?.query?.wa === '1') {
      this.consentModal = { open: true };
    }
  },
  methods: {
    async fetchPreferences() {
      try {
        const response = await this.axios.get('/notification_preferences');
        this.preferences = response;
      } finally {
        this.loading = false;
      }
    },
    async update(pref, channel, value) {
      if (channel === 'whatsapp' && value && !this.whatsappOptedIn) {
        this.consentModal = { open: true };
        return;
      }
      await this.savePreference(pref, channel, value);
    },

    async savePreference(pref, channel, value) {
      pref[channel] = value;
      try {
        await this.axios.patch(`/notification_preferences/${pref.notificationType}`, {
          notification_preference: { [channel]: value }
        });
        if (channel === 'whatsapp' && value) {
          useAuthStore().setWhatsappOptedIn(true);
        }
      } catch {
        pref[channel] = !value;
      }
    },

    async onConsentConfirm() {
      // OTP foi verificado pelo modal — só atualizar estado local
      useAuthStore().setWhatsappOptedIn(true);
      await this.fetchPreferences();
      this.consentModal = { open: false };
    },

    onConsentCancel() {
      this.consentModal = { open: false };
    }
  }
};
</script>
