<template>
  <div class="flex min-h-screen">

    <!-- ───── Painel esquerdo — Brand ───── -->
    <div class="relative hidden md:flex md:w-[45%] flex-col justify-between overflow-hidden bg-slate-900 p-12">
      <div class="absolute inset-0 bg-login bg-cover bg-center opacity-20" />
      <div class="absolute inset-0 bg-gradient-to-br from-blue-700/30 via-transparent to-transparent" />
      <div class="absolute inset-0 opacity-[0.04]" style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 28px 28px;" />

      <div class="relative z-10 flex flex-col justify-between h-full">
        <img src="@/assets/roster.png" alt="Roster Pro" class="w-36 brightness-0 invert" />

        <div>
          <h1 class="text-4xl font-black leading-tight text-white">
            Você foi<br />
            <span class="text-blue-400">convidado!</span>
          </h1>
          <p class="mt-5 max-w-xs text-base leading-relaxed text-slate-400">
            Escolha como prefere acessar o Roster Pro. Você pode usar um PIN de 4 dígitos, link mágico ou sua conta Google.
          </p>
        </div>

        <p class="text-xs text-slate-600">rosterpro.com.br © {{ new Date().getFullYear() }}</p>
      </div>
    </div>

    <!-- ───── Painel direito ───── -->
    <div class="flex flex-1 flex-col justify-center bg-white px-8 py-12 sm:px-12">

      <!-- Logo mobile -->
      <div class="mb-10 md:hidden">
        <img src="@/assets/roster.png" alt="Roster Pro" class="w-36" />
      </div>

      <!-- Carregando -->
      <div v-if="state === 'loading'" class="mx-auto w-full max-w-sm text-center">
        <div class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <BaseIcon name="ArrowPath" class="!size-6 animate-spin text-slate-700" />
        </div>
        <p class="text-sm text-slate-500">Verificando seu convite...</p>
      </div>

      <!-- Convite inválido/expirado -->
      <div v-else-if="state === 'invalid'" class="mx-auto w-full max-w-sm text-center">
        <div class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <BaseIcon name="Exclamation" class="!size-6 text-red-500" />
        </div>
        <h3 class="mb-2 text-base font-semibold text-slate-800">Convite inválido ou expirado</h3>
        <p class="mb-6 text-sm text-slate-500">{{ invalidMessage }}</p>
        <router-link
          to="/signin"
          class="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          Ir para o login
        </router-link>
      </div>

      <!-- Opções de acesso -->
      <div v-else-if="state === 'options'" class="mx-auto w-full max-w-sm">
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-slate-900">Olá, {{ invite.name }}!</h2>
          <p class="mt-1 text-sm text-slate-500">
            Você foi convidado para acessar
            <strong class="text-slate-700">{{ invite.company }}</strong>.
            Como prefere criar seu acesso?
          </p>
        </div>

        <div class="space-y-3">
          <!-- Criar PIN -->
          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300"
            @click="state = 'pin'"
          >
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50">
              <BaseIcon name="HashTag" class="!size-4 text-blue-600" />
            </span>
            <div class="text-left">
              <div class="font-semibold text-slate-800">Criar um PIN</div>
              <div class="text-xs text-slate-400 font-normal">4 dígitos — rápido e fácil de lembrar</div>
            </div>
            <BaseIcon name="ChevronRight" class="!size-4 text-slate-300 ml-auto" />
          </button>

          <!-- Link mágico -->
          <button
            type="button"
            :disabled="magicLoading"
            class="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 disabled:opacity-60"
            @click="activateMagicLink"
          >
            <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100">
              <BaseIcon v-if="magicLoading" name="ArrowPath" class="!size-4 text-slate-500 animate-spin" />
              <BaseIcon v-else name="Envelope" class="!size-4 text-slate-500" />
            </span>
            <div class="text-left">
              <div class="font-semibold text-slate-800">Usar link mágico</div>
              <div class="text-xs text-slate-400 font-normal">Receba um link por e-mail para entrar</div>
            </div>
            <BaseIcon name="ChevronRight" class="!size-4 text-slate-300 ml-auto" />
          </button>

          <!-- Divisor -->
          <div class="flex items-center gap-3 py-1">
            <div class="h-px flex-1 bg-slate-100" />
            <span class="text-xs text-slate-400">ou</span>
            <div class="h-px flex-1 bg-slate-100" />
          </div>

          <!-- Google -->
          <GoogleLogin class="w-full" :callback="handleGoogleLogin">
            <button
              type="button"
              class="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              :class="googleError ? 'border-red-300 bg-red-50' : ''"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 533.5 544.3" class="shrink-0">
                <path fill="#4285f4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272.1v95.3h146.9c-6.4 34.7-25.7 64.1-54.8 83.5v69.1h88.7c52-47.9 80.6-118.5 80.6-197.5z"/>
                <path fill="#34a853" d="M272.1 544.3c73.9 0 135.9-24.5 181.2-66.6l-88.7-69.1c-24.6 16.5-56.2 26.2-92.5 26.2-71.1 0-131.4-48-153-112.8h-90v70.9c45.4 89.7 138.7 151.4 243 151.4z"/>
                <path fill="#fbbc04" d="M119.1 321.9c-10.3-30.6-10.3-63.7 0-94.3v-70.9h-90c-38.1 74.9-38.1 161.2 0 236.1l90-70.9z"/>
                <path fill="#ea4335" d="M272.1 107.4c39.9 0 75.8 13.8 104.2 40.8l78.1-78.1C407.9 24.2 345.9 0 272.1 0 167.8 0 74.5 61.7 29.1 151.4l90 70.9c21.6-64.8 81.9-112.8 153-112.8z"/>
              </svg>
              <span>Entrar com Google</span>
            </button>
          </GoogleLogin>
          <p v-if="googleError" class="text-center text-xs text-red-500">{{ googleError }}</p>
        </div>
      </div>

      <!-- Formulário de PIN — Step 1: criar -->
      <div v-else-if="state === 'pin'" class="mx-auto w-full max-w-sm">
        <button
          type="button"
          class="mb-8 flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition"
          @click="state = 'options'"
        >
          <BaseIcon name="ChevronLeft" class="!size-4" />
          Voltar
        </button>

        <!-- Indicador de step -->
        <div class="mb-8 flex items-center justify-center gap-2">
          <span class="h-2 w-6 rounded-full bg-slate-900" />
          <span class="h-2 w-2 rounded-full bg-slate-200" />
        </div>

        <div class="mb-8 text-center">
          <h2 class="text-2xl font-bold text-slate-900">Crie seu PIN</h2>
          <p class="mt-2 text-sm text-slate-500">Escolha 4 dígitos para acessar sua conta.</p>
        </div>

        <div v-if="pinError" class="mb-5 rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-600">
          {{ pinError }}
        </div>

        <PinInput ref="pinInputRef" v-model="pin" @update:model-value="val => { if (val) pinError = '' }" @complete="goToPinConfirm" />

        <p v-if="!pinError" class="mt-6 text-center text-xs text-slate-400">Digite 4 dígitos para continuar</p>
      </div>

      <!-- Formulário de PIN — Step 2: confirmar -->
      <div v-else-if="state === 'pin_confirm'" class="mx-auto w-full max-w-sm">
        <button
          type="button"
          class="mb-8 flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition"
          @click="backToPinCreate"
        >
          <BaseIcon name="ChevronLeft" class="!size-4" />
          Voltar
        </button>

        <!-- Indicador de step -->
        <div class="mb-8 flex items-center justify-center gap-2">
          <span class="h-2 w-2 rounded-full bg-slate-300" />
          <span class="h-2 w-6 rounded-full bg-slate-900" />
        </div>

        <div class="mb-8 text-center">
          <h2 class="text-2xl font-bold text-slate-900">Confirme seu PIN</h2>
          <p class="mt-2 text-sm text-slate-500">Digite os mesmos 4 dígitos novamente.</p>
        </div>

        <div v-if="pinError" class="mb-5 rounded-lg bg-red-50 px-4 py-3 text-center text-sm text-red-600">
          {{ pinError }}
        </div>

        <PinInput ref="pinConfirmRef" v-model="pinConfirmation" :error="!!pinError" @complete="submitPin" />

        <div v-if="pinLoading" class="mt-6 flex justify-center">
          <BaseIcon name="ArrowPath" class="!size-5 animate-spin text-slate-400" />
        </div>
      </div>

      <!-- Link mágico enviado -->
      <div v-else-if="state === 'magic_sent'" class="mx-auto w-full max-w-sm text-center">
        <div class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
          <BaseIcon name="Envelope" class="!size-6 text-blue-500" />
        </div>
        <h3 class="mb-2 text-base font-semibold text-slate-800">Link enviado!</h3>
        <p class="text-sm text-slate-500">
          Verifique sua caixa de entrada em <strong class="text-slate-700">{{ invite.email }}</strong>.
          O link expira em <strong>15 minutos</strong>.
        </p>
      </div>

    </div>
  </div>
</template>

<script>
import PinInput from '@/components/form/PinInput';
import BaseIcon from '@/components/icons/BaseIcon';

import { useAuthStore } from '@/modules/auth/store';
import { useCompanyStore } from '@/modules/users/store/company';
import { useUserStore } from '@/modules/users/store/user';
import { usePlanStore } from '@/components/plan/store';

export default {
  name: 'AcceptInvite',
  components: { PinInput, BaseIcon },
  data() {
    return {
      state:           'loading', // loading | invalid | options | pin | pin_confirm | magic_sent
      invalidMessage:  '',
      invite:          { name: '', email: '', company: '' },
      token:           '',
      hash:            '',
      // pin
      pin:             '',
      pinConfirmation: '',
      pinError:        '',
      pinLoading:      false,
      // magic link
      magicLoading:    false,
      // google
      googleError:     ''
    };
  },
  computed: {
    authStore:    () => useAuthStore(),
    companyStore: () => useCompanyStore(),
    userStore:    () => useUserStore(),
    planStore:    () => usePlanStore()
  },
  mounted() {
    const params = new URLSearchParams(window.location.search);
    this.hash  = decodeURIComponent(params.get('hash') || '');
    this.token = decodeURIComponent(params.get('token') || '');
    this.validateInvite();
  },
  methods: {
    validateInvite() {
      this.axios
        .get('/invitations/validate', { params: { hash: this.hash, token: this.token } })
        .then(response => {
          this.invite = response;
          this.state  = 'options';
        })
        .catch(error => {
          this.invalidMessage = error?.response?.data?.error || 'Este convite é inválido ou já foi utilizado.';
          this.state = 'invalid';
        });
    },

    async activateMagicLink() {
      this.magicLoading = true;
      try {
        await this.axios.post('/invitations/activate_magic_link', {
          hash:  this.hash,
          token: this.token
        });
        this.state = 'magic_sent';
      } catch (error) {
        this.invalidMessage = error?.response?.data?.error || 'Erro ao enviar o link. Tente novamente.';
        this.state = 'invalid';
      } finally {
        this.magicLoading = false;
      }
    },

    goToPinConfirm() {
      this.pinConfirmation = '';
      this.pinError        = '';
      this.state           = 'pin_confirm';
      this.$nextTick(() => this.$refs.pinConfirmRef?.focus());
    },

    backToPinCreate() {
      this.pin             = '';
      this.pinConfirmation = '';
      this.state           = 'pin';
      this.$nextTick(() => this.$refs.pinInputRef?.reset());
    },

    async submitPin() {
      if (this.pinLoading) return;

      if (this.pin !== this.pinConfirmation) {
        this.pinError = 'Os PINs não conferem. Tente novamente.';
        this.backToPinCreate();
        return;
      }

      this.pinLoading = true;
      try {
        const response = await this.axios.post('/invitations/setup_pin', {
          hash:  this.hash,
          token: this.token,
          pin:   this.pin
        });
        this.loginSuccessful(response);
      } catch (error) {
        this.pinError = error?.response?.data?.error || 'Erro ao definir PIN. Tente novamente.';
        await new Promise(r => setTimeout(r, 900));
        this.backToPinCreate();
      } finally {
        this.pinLoading = false;
      }
    },

    async handleGoogleLogin(response) {
      this.googleError = '';

      const callback = response.credential
        ? { path: '/auth/google/credential/callback', payload: { idToken: response.credential } }
        : { path: '/auth/google/code/callback',       payload: { code: response.code } };

      try {
        const res = await this.axios.post(callback.path, callback.payload);
        if (res.token) {
          this.loginSuccessful(res);
        } else {
          this.googleError = 'Use o mesmo e-mail do convite para entrar com Google.';
        }
      } catch (error) {
        this.googleError = error?.response?.data?.error || 'Erro ao entrar com Google.';
      }
    },

    loginSuccessful(response) {
      if (response?.deviceToken) {
        this.authStore.setDeviceToken(response.deviceToken);
      }

      this.authStore.login(response);
      this.userStore.setUser(response?.user);
      this.planStore.setPlan(response?.plan);

      if (response?.companies?.length > 1) {
        this.authStore.setStepLogin(2);
        this.$router.replace('/signin');
      } else {
        this.companyStore.setChosenCompany(response?.companies?.[0]);
        this.userStore.setUserCompany(response?.companies?.[0]?.id);
        this.$router.replace('/');
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.bg-login {
  background-image: url('@/assets/bg-login.jpg');
  background-size: cover;
}
</style>
