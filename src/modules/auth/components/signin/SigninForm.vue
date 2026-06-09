<template>
  <div class="flex min-h-screen">

    <!-- ───── Painel esquerdo — Brand ───── -->
    <div class="relative hidden md:flex md:w-[55%] flex-col justify-between overflow-hidden bg-slate-900 p-12">
      <div class="absolute inset-0 bg-login bg-cover bg-center opacity-20" />
      <div class="absolute inset-0 bg-gradient-to-br from-blue-700/30 via-transparent to-transparent" />
      <div class="absolute inset-0 opacity-[0.04]" style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 28px 28px;" />

      <div class="relative z-10 flex flex-col justify-between h-full">
        <img src="@/assets/roster.png" alt="Roster Pro" class="w-36 brightness-0 invert" />

        <div>
          <h1 class="text-4xl font-black leading-tight text-white">
            Gestão de escalas<br />inteligente para<br />
            <span class="text-blue-400">times que crescem.</span>
          </h1>
          <p class="mt-5 max-w-sm text-base leading-relaxed text-slate-400">
            Escalas, equipes e serviços num só lugar. Sem planilhas,
            sem confusão — só eficiência.
          </p>

          <div class="mt-10 space-y-4">
            <div v-for="feat in features" :key="feat.label" class="flex items-center gap-3">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                <BaseIcon :name="feat.icon" class="text-blue-400" />
              </div>
              <span class="text-sm text-slate-300">{{ feat.label }}</span>
            </div>
          </div>
        </div>

        <p class="text-xs text-slate-600">Confiado por centenas de equipes em todo o Brasil.</p>
      </div>
    </div>

    <!-- ───── Painel direito — Formulário ───── -->
    <div class="flex flex-1 flex-col justify-center bg-white px-8 py-12 sm:px-12">

      <!-- Logo mobile -->
      <div class="mb-10 md:hidden">
        <img src="@/assets/roster.png" alt="Roster Pro" class="w-36" />
      </div>

      <div class="mx-auto w-full max-w-sm">

        <div class="mb-8">
          <h2 class="text-2xl font-bold text-slate-900">Bem-vindo de volta</h2>
          <p class="mt-1 text-sm text-slate-500">Entre na sua conta do Roster Pro.</p>
        </div>

        <!-- Banner: e-mail confirmado -->
        <div
          v-if="confirmed"
          class="mb-6 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3"
        >
          <BaseIcon name="CheckCircle" class="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
          <div>
            <p class="text-sm font-semibold text-green-800">E-mail confirmado com sucesso!</p>
            <p class="text-xs text-green-700">Agora é só entrar na sua conta.</p>
          </div>
        </div>

        <!-- Google -->
        <GoogleLoginButton />

        <!-- Divisor -->
        <div class="my-6 flex items-center gap-3">
          <div class="h-px flex-1 bg-slate-200" />
          <span class="text-xs font-medium text-slate-400">ou</span>
          <div class="h-px flex-1 bg-slate-200" />
        </div>

        <!-- Magic Link -->
        <MagicLinkForm v-if="step === 'magic_link'" @cancel="step = 'email'" />

        <!-- Passo 1: e-mail -->
        <form v-else-if="step === 'email'" @submit.prevent="checkAuthMethod">
          <div v-if="error" class="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-center text-sm text-red-600">
            {{ error }}
          </div>

          <FormInput
            v-model="email"
            type="email"
            label="E-mail"
            placeholder="seu@email.com"
            icon="Envelope"
          />

          <button
            type="submit"
            :disabled="!email || checking"
            class="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none disabled:opacity-60"
          >
            <BaseIcon v-if="checking" name="ArrowPath" class="!size-4 animate-spin" />
            <span v-else>Continuar</span>
          </button>

          <div class="mt-4 flex justify-center">
            <button type="button" class="text-sm text-blue-600 hover:text-blue-800" @click="step = 'magic_link'">
              Entrar sem senha (link mágico)
            </button>
          </div>
        </form>

        <!-- Passo 2a: senha (admin/operator) -->
        <form v-else-if="step === 'password'" @submit.prevent="signinPassword">
          <button
            type="button"
            class="mb-5 flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition"
            @click="step = 'email'"
          >
            <BaseIcon name="ChevronLeft" class="!size-4" />
            {{ email }}
          </button>

          <div v-if="error" class="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-center text-sm text-red-600">
            {{ error }}
          </div>

          <FormInput v-model="password" type="password" label="Senha" placeholder="••••••••" icon="LockClosed" />

          <button
            type="submit"
            class="mt-5 flex w-full items-center justify-center rounded-lg bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none"
          >
            ENTRAR
          </button>

          <div class="mt-4 flex justify-center">
            <router-link to="/recuperar-senha" class="text-sm text-slate-400 hover:text-slate-600">
              Esqueci minha senha
            </router-link>
          </div>
        </form>

        <!-- Passo 2b: PIN (colaboradores) -->
        <div v-else-if="step === 'pin'">
          <button
            type="button"
            class="mb-5 flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition"
            @click="step = 'email'"
          >
            <BaseIcon name="ChevronLeft" class="!size-4" />
            {{ email }}
          </button>

          <div class="mb-6">
            <h3 class="text-lg font-semibold text-slate-900">Digite seu PIN</h3>
            <p class="mt-0.5 text-sm text-slate-500">4 dígitos para acessar sua conta.</p>
          </div>

          <div v-if="error" class="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-center text-sm text-red-600">
            {{ error }}
          </div>

          <PinInput ref="pinRef" v-model="pin" :error="!!error" @complete="signinPin" />

          <button
            type="button"
            :disabled="pin.length < 4 || pinLoading"
            class="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none disabled:opacity-50"
            @click="signinPin"
          >
            <BaseIcon v-if="pinLoading" name="ArrowPath" class="!size-4 animate-spin" />
            <span v-else>ENTRAR</span>
          </button>
        </div>

        <!-- Verificação de dispositivo -->
        <div v-else-if="step === 'device_verification'" class="text-center">
          <div class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
            <BaseIcon name="Shield" class="!size-6 text-blue-500" />
          </div>
          <h3 class="mb-2 text-base font-semibold text-slate-800">Verifique seu dispositivo</h3>
          <p class="text-sm text-slate-500">
            Enviamos um link para <strong class="text-slate-700">{{ email }}</strong>.
            Clique no link para confirmar este dispositivo e entrar.
          </p>
          <button type="button" class="mt-6 text-sm text-slate-400 hover:text-slate-600" @click="step = 'email'">
            Usar outro e-mail
          </button>
        </div>

        <p class="mt-10 border-t border-slate-100 pt-6 text-center text-sm text-slate-400">
          Não tem conta?
          <router-link to="/signup" class="font-semibold text-blue-600 hover:text-blue-800">
            Cadastre-se grátis
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import GoogleLoginButton from '@/modules/auth/components/signin/GoogleLoginButton';
import MagicLinkForm from '@/modules/auth/components/signin/MagicLinkForm';
import PinInput from '@/components/form/PinInput';
import FormInput from '@/components/form/Input';
import BaseIcon from '@/components/icons/BaseIcon';

import { useAuthStore } from '@/modules/auth/store';
import { useCompanyStore } from '@/modules/users/store/company';
import { useUserStore } from '@/modules/users/store/user';
import { usePlanStore } from '@/components/plan/store';

export default {
  name: 'Login',
  components: { GoogleLoginButton, MagicLinkForm, PinInput, FormInput, BaseIcon },
  data() {
    return {
      step:       'email', // email | password | pin | magic_link | device_verification
      email:      '',
      password:   '',
      pin:        '',
      error:      '',
      checking:   false,
      pinLoading: false,
      confirmed:  this.$route?.query?.confirmed === 'true',
      features: [
        { icon: 'Calendar', label: 'Escalas diárias, semanais e personalizadas' },
        { icon: 'Users',    label: 'Gestão completa de equipes e colaboradores' },
        { icon: 'Sparkles', label: 'IA para insights e sugestões de escala' }
      ]
    };
  },
  computed: {
    authStore:    () => useAuthStore(),
    planStore:    () => usePlanStore(),
    companyStore: () => useCompanyStore(),
    userStore:    () => useUserStore()
  },
  created() { this.checkSignedIn(); },
  updated() { this.checkSignedIn(); },
  methods: {
    async checkAuthMethod() {
      if (!this.email) return;
      this.error    = '';
      this.checking = true;

      try {
        const { method } = await this.axios.post('users/auth_method', { email: this.email });
        this.step = method === 'pin' ? 'pin' : 'password';
        if (this.step === 'pin') this.$nextTick(() => this.$refs.pinRef?.focus());
      } catch {
        this.step = 'password';
      } finally {
        this.checking = false;
      }
    },

    signinPassword() {
      this.error = '';
      this.axios
        .post('login', { user: { email: this.email, password: this.password } }, { withCredentials: true })
        .then(response => this.signinSuccessful(response, 'password'))
        .catch(error => {
          this.error = error?.response?.data?.error || 'Credenciais inválidas.';
        });
    },

    async signinPin() {
      if (this.pin.length < 4 || this.pinLoading) return;
      this.error      = '';
      this.pinLoading = true;

      try {
        const response = await this.axios.post('pin/auth', { email: this.email, pin: this.pin });

        if (response?.status === 'device_verification_required') {
          this.step = 'device_verification';
          return;
        }

        this.signinSuccessful(response, 'pin');
      } catch (error) {
        this.error = error?.response?.data?.error || 'PIN incorreto.';
        this.$refs.pinRef?.reset();
      } finally {
        this.pinLoading = false;
      }
    },

    signinSuccessful(response, method) {
      if (response?.deviceToken) {
        this.authStore.setDeviceToken(response.deviceToken);
      }

      this.authStore.login(response);
      this.authStore.setLoginMethod(method);
      this.planStore.setPlan(response.plan);
      this.error = '';

      if (response?.companies?.length > 1) {
        this.authStore.setStepLogin(2);
      } else {
        this.companyStore.setChosenCompany(response?.companies?.[0]);
        this.userStore.setUserCompany(response?.companies?.[0]?.id);

        // Usuário tem APENAS o módulo vagas ativo → redireciona direto para /vagas
        const activeModules = response.activeModules || [];
        if (activeModules.length === 1 && activeModules[0] === 'vagas') {
          this.$router.replace('/vagas');
          return;
        }

        // Comportamento padrão: operator → dashboard, colaborador → portal
        this.$router.replace(this.$can.canAccess('operator') ? '/' : '/member');
      }
    },

    checkSignedIn() {
      if (this.authStore.isSignedIn && this.authStore.currentStepLogin === 1) {
        // Usuário com apenas vagas ativo que chega direto na rota de login
        if (this.authStore.activeModules?.length === 1 && this.authStore.activeModules[0] === 'vagas') {
          this.$router.replace('/vagas');
          return;
        }
        this.$router.replace(this.$can.canAccess('operator') ? '/' : '/member');
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.bg-login {
  background-image: url('@/assets/bg-login.jpg');
}
</style>
