<template>
  <Modal :open="isOpen">
    <div class="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6">
      <div class="flex flex-col overflow-hidden rounded-xl bg-white text-left shadow-xl md:flex-row">

        <!-- ===== Coluna esquerda (hero) ===== -->
        <div class="relative flex w-full flex-col justify-between overflow-hidden bg-slate-900 px-10 py-10 text-white md:w-2/5">
          <div class="absolute inset-0 opacity-[0.04]" style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 24px 24px;" />

          <div class="relative z-10">
            <img src="@/assets/roster-all-white.png" alt="RosterPro" class="w-32 brightness-0 invert" />
          </div>

          <div class="relative z-10 flex flex-col gap-6">
            <div>
              <p class="text-2xl font-black leading-snug">
                Olá, {{ firstName }}! 👋
              </p>
              <p class="mt-2 text-sm leading-relaxed text-slate-400">
                {{ isOperator
                  ? `Você está a ${hasWhatsApp ? '3' : '3'} passos da sua primeira escala publicada.`
                  : 'Sua conta foi criada. Veja o que você pode fazer aqui.'
                }}
              </p>
            </div>

            <!-- Bullets para operadores -->
            <ul v-if="isOperator" class="space-y-3">
              <li v-if="hasWhatsApp" class="flex items-start gap-3">
                <div class="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-emerald-500/20">
                  <BaseIcon name="WhatsApp" class="!h-3.5 !w-3.5 text-emerald-400" />
                </div>
                <span class="text-sm text-slate-300">Notifique seu time direto no <strong class="text-white">WhatsApp</strong></span>
              </li>
              <li v-if="hasWhatsApp" class="flex items-start gap-3">
                <div class="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-blue-500/20">
                  <BaseIcon name="Sparkles" class="!h-3.5 !w-3.5 text-blue-400" />
                </div>
                <span class="text-sm text-slate-300">Mensagens personalizadas com <strong class="text-white">IA</strong></span>
              </li>
              <li class="flex items-start gap-3">
                <div class="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-purple-500/20">
                  <BaseIcon name="Calendar" class="!h-3.5 !w-3.5 text-purple-400" />
                </div>
                <span class="text-sm text-slate-300">Escalas, trocas e disponibilidades em <strong class="text-white">um só lugar</strong></span>
              </li>
              <li v-if="!hasWhatsApp" class="flex items-start gap-3">
                <div class="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-blue-500/20">
                  <BaseIcon name="Users" class="!h-3.5 !w-3.5 text-blue-400" />
                </div>
                <span class="text-sm text-slate-300">Convide sua equipe e gerencie <strong class="text-white">perfis e acessos</strong></span>
              </li>
              <li v-if="!hasWhatsApp" class="flex items-start gap-3">
                <div class="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-emerald-500/20">
                  <BaseIcon name="Check" class="!h-3.5 !w-3.5 text-emerald-400" />
                </div>
                <span class="text-sm text-slate-300">Escalas ilimitadas, <strong class="text-white">sem custo extra</strong></span>
              </li>
            </ul>

            <!-- Bullets para colaboradores -->
            <ul v-else class="space-y-3">
              <li class="flex items-start gap-3">
                <div class="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-purple-500/20">
                  <BaseIcon name="Calendar" class="!h-3.5 !w-3.5 text-purple-400" />
                </div>
                <span class="text-sm text-slate-300">Veja suas <strong class="text-white">escalas e confirmações</strong></span>
              </li>
              <li class="flex items-start gap-3">
                <div class="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-blue-500/20">
                  <BaseIcon name="ArrowPath" class="!h-3.5 !w-3.5 text-blue-400" />
                </div>
                <span class="text-sm text-slate-300">Solicite <strong class="text-white">trocas e ausências</strong> diretamente</span>
              </li>
              <li v-if="hasWhatsApp" class="flex items-start gap-3">
                <div class="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-emerald-500/20">
                  <BaseIcon name="WhatsApp" class="!h-3.5 !w-3.5 text-emerald-400" />
                </div>
                <span class="text-sm text-slate-300">Confirme escalas pelo <strong class="text-white">WhatsApp</strong></span>
              </li>
              <li v-else class="flex items-start gap-3">
                <div class="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-indigo-500/20">
                  <BaseIcon name="Bell" class="!h-3.5 !w-3.5 text-indigo-400" />
                </div>
                <span class="text-sm text-slate-300">Notificações em <strong class="text-white">tempo real</strong> no app</span>
              </li>
            </ul>

            <!-- Step indicator (só se tem step 2) -->
            <div v-if="showWhatsAppStep" class="flex items-center gap-2">
              <div
                v-for="i in 2" :key="i"
                class="h-1.5 rounded-full transition-all duration-300"
                :class="step === i ? 'w-6 bg-white' : 'w-2 bg-white/30'"
              />
            </div>
          </div>

          <p class="relative z-10 text-xs text-slate-600">rosterpro.com.br</p>
        </div>

        <!-- ===== Coluna direita ===== -->
        <div class="flex w-full flex-col justify-between px-10 py-10 md:w-3/5">

          <!-- STEP 1: Visão geral — OPERADOR/ADMIN -->
          <div v-if="step === 1 && isOperator" class="flex h-full flex-col justify-between">
            <div>
              <h2 class="text-2xl font-black text-slate-900">Vamos começar?</h2>
              <p class="mt-1 text-sm text-slate-500">Siga os 3 passos abaixo para publicar sua primeira escala.</p>

              <ol class="mt-8 space-y-7">
                <li class="flex items-start gap-4">
                  <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">1</div>
                  <div class="pt-1">
                    <p class="font-semibold text-slate-900">Monte suas equipes e adicione colaboradores</p>
                    <p class="mt-0.5 text-sm text-slate-500">Crie equipes por setor e convide sua equipe com os perfis certos — Usuário, Operador ou Admin.</p>
                  </div>
                </li>
                <li class="flex items-start gap-4">
                  <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">2</div>
                  <div class="pt-1">
                    <p class="font-semibold text-slate-900">Crie sua agenda e escale</p>
                    <p class="mt-0.5 text-sm text-slate-500">Configure agendas recorrentes ou pontuais e distribua os colaboradores nas posições certas.</p>
                  </div>
                </li>
                <li class="flex items-start gap-4">
                  <div
                    class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    :class="hasWhatsApp ? 'bg-emerald-500' : 'bg-blue-600'"
                  >3</div>
                  <div class="pt-1">
                    <p class="font-semibold text-slate-900">{{ hasWhatsApp ? 'Publique e notifique pelo WhatsApp' : 'Publique e compartilhe sua escala' }}</p>
                    <p class="mt-0.5 text-sm text-slate-500">
                      {{ hasWhatsApp
                        ? 'Com a escala pronta, o time recebe confirmação direto no WhatsApp — sem app extra, sem e-mail ignorado.'
                        : 'Com a escala pronta, publique e compartilhe com sua equipe. Trocas e disponibilidades, tudo no mesmo lugar.'
                      }}
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <div class="mt-10 flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <p class="text-xs text-slate-400">Precisando de ajuda?<br><a href="mailto:suporte@rosterpro.com.br" class="underline hover:text-slate-600">Fale com a gente</a></p>
              <button
                class="flex flex-shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                @click="handleStep1"
              >
                {{ showWhatsAppStep ? 'Continuar' : 'Criar minha primeira equipe' }}
                <BaseIcon name="ChevronRight" class="!h-4 !w-4" />
              </button>
            </div>
          </div>

          <!-- STEP 1: Visão geral — COLABORADOR -->
          <div v-else-if="step === 1 && !isOperator" class="flex h-full flex-col justify-between">
            <div>
              <h2 class="text-2xl font-black text-slate-900">Bem-vindo(a) ao Roster Pro!</h2>
              <p class="mt-1 text-sm text-slate-500">Sua conta foi criada pelo administrador. Veja como funciona.</p>

              <ol class="mt-8 space-y-7">
                <li class="flex items-start gap-4">
                  <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">1</div>
                  <div class="pt-1">
                    <p class="font-semibold text-slate-900">Confira sua agenda</p>
                    <p class="mt-0.5 text-sm text-slate-500">No <strong>Calendário</strong> você vê todas as escalas atribuídas a você pelo seu administrador.</p>
                  </div>
                </li>
                <li class="flex items-start gap-4">
                  <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">2</div>
                  <div class="pt-1">
                    <p class="font-semibold text-slate-900">Confirme sua presença</p>
                    <p class="mt-0.5 text-sm text-slate-500">Quando for escalado, você recebe uma notificação e pode aceitar ou recusar a escala.</p>
                  </div>
                </li>
                <li class="flex items-start gap-4">
                  <div
                    class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    :class="hasWhatsApp ? 'bg-emerald-500' : 'bg-blue-600'"
                  >3</div>
                  <div class="pt-1">
                    <p class="font-semibold text-slate-900">{{ hasWhatsApp ? 'Receba tudo pelo WhatsApp' : 'Solicite trocas e ausências' }}</p>
                    <p class="mt-0.5 text-sm text-slate-500">
                      {{ hasWhatsApp
                        ? 'Confirme escalas, receba lembretes e consulte sua agenda direto no WhatsApp — sem abrir o app.'
                        : 'Se precisar de um dia livre, solicite uma troca com outro colaborador ou registre sua indisponibilidade.'
                      }}
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <div class="mt-10 flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <p class="text-xs text-slate-400">Precisando de ajuda?<br><a href="mailto:suporte@rosterpro.com.br" class="underline hover:text-slate-600">Fale com a gente</a></p>
              <button
                class="flex flex-shrink-0 items-center gap-2 rounded-lg bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
                @click="handleStep1"
              >
                {{ showWhatsAppStep ? 'Continuar' : 'Acessar minha agenda' }}
                <BaseIcon name="ChevronRight" class="!h-4 !w-4" />
              </button>
            </div>
          </div>

          <!-- STEP 2: WhatsApp opt-in -->
          <div v-if="step === 2" class="flex h-full flex-col justify-between">
            <div>
              <!-- Header -->
              <div class="mb-6 flex items-center gap-3">
                <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50">
                  <BaseIcon name="WhatsApp" class="h-6 w-6 text-emerald-500" />
                </div>
                <div>
                  <h2 class="text-xl font-black text-slate-900">Ative as notificações pelo WhatsApp</h2>
                  <p class="text-sm text-slate-500">Incluso no seu plano. Configure agora em 1 clique.</p>
                </div>
              </div>

              <!-- Benefícios -->
              <ul class="mb-6 space-y-3">
                <li v-for="b in waBenefits" :key="b" class="flex items-start gap-3">
                  <div class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100">
                    <BaseIcon name="Check" class="!h-3 !w-3 text-emerald-600" />
                  </div>
                  <span class="text-sm text-slate-700">{{ b }}</span>
                </li>
              </ul>

              <!-- Preview de mensagem -->
              <div class="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <div class="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2.5">
                  <div class="h-2 w-2 rounded-full bg-emerald-500" />
                  <span class="text-xs font-medium text-slate-500">Prévia da notificação</span>
                </div>
                <div class="p-4">
                  <div class="inline-block max-w-xs rounded-xl rounded-tl-none bg-white px-4 py-3 shadow-sm">
                    <p class="text-sm text-slate-800">📅 <strong>Nova escala publicada!</strong></p>
                    <p class="mt-1 text-sm text-slate-600">Você foi escalado para <em>Domingo, 8h</em>.</p>
                    <p class="mt-2 text-xs text-slate-400">Responda <strong>1</strong> para aceitar ou <strong>2</strong> para recusar.</p>
                  </div>
                </div>
              </div>

              <!-- Consentimento LGPD -->
              <label class="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-emerald-300 hover:bg-emerald-50/40" :class="waAccepted ? 'border-emerald-300 bg-emerald-50/60' : ''">
                <input
                  v-model="waAccepted"
                  type="checkbox"
                  class="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-emerald-500 accent-emerald-500 focus:ring-emerald-400"
                />
                <span class="text-sm leading-relaxed text-slate-700">
                  <strong class="font-semibold">Quero ativar o WhatsApp</strong> e concordo em receber notificações no número cadastrado.
                  <span class="block mt-1 text-xs text-slate-400">Você pode desativar a qualquer momento nas configurações ou respondendo <strong class="text-slate-500">PARAR</strong>.</span>
                </span>
              </label>
            </div>

            <div class="mt-8 flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <button
                type="button"
                class="text-sm text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
                @click="skipWhatsApp"
              >
                Pular por agora
              </button>
              <button
                :disabled="!waAccepted || loading"
                class="flex flex-shrink-0 items-center gap-2 rounded-lg px-6 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                :class="waAccepted ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-300'"
                @click="activateWhatsApp"
              >
                <span v-if="loading" class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <BaseIcon v-else name="WhatsApp" class="!h-4 !w-4" />
                Ativar WhatsApp
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </Modal>
</template>

<script>
import Modal from '@/components/modal/Modal';
import BaseIcon from '@/components/icons/BaseIcon';
import { useAuthStore } from '@/modules/auth/store';
import { can } from '@/helper/can';

export default {
  components: { Modal, BaseIcon },

  data() {
    return {
      step: 1,
      loading: false,
      waAccepted: false,
      waBenefits: [
        'Confirmação de escalas com 1 toque — Aceitar ou Recusar',
        'Lembrete automático antes do dia da escala',
        'Comunicados e avisos da equipe em tempo real',
        'Consulte sua agenda respondendo "agenda" no WhatsApp'
      ]
    };
  },

  computed: {
    authStore: () => useAuthStore(),

    isOpen() {
      return Boolean(this.authStore.user?.firstAccess);
    },

    isOperator() {
      return can().canAccess('operator');
    },

    firstName() {
      return this.authStore.user?.name?.split(' ')[0] || 'bem-vindo';
    },

    hasWhatsApp() {
      return can().canView('whatsapp');
    },

    whatsappOptedIn() {
      return this.authStore.whatsappOptedIn;
    },

    showWhatsAppStep() {
      return this.hasWhatsApp && !this.whatsappOptedIn;
    }
  },

  watch: {
    isOpen(val) {
      if (val) {
        this.step = 1;
        this.waAccepted = false;
      }
    }
  },

  methods: {
    handleStep1() {
      if (this.showWhatsAppStep) {
        this.step = 2;
      } else {
        this.finish();
      }
    },

    async activateWhatsApp() {
      if (!this.waAccepted) return;
      this.loading = true;
      try {
        await this.axios.post('/whatsapp/opt_in');
        this.authStore.setWhatsappOptedIn(true);
      } catch {
        // opt-in falhou, mas não bloqueamos o onboarding
      } finally {
        this.loading = false;
        await this.finish();
      }
    },

    async skipWhatsApp() {
      await this.finish();
    },

    async finish() {
      this.loading = true;
      try {
        await this.axios.put(`/users/${this.authStore.user.id}`, { firstAccess: false });
        this.authStore.user.firstAccess = false;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
