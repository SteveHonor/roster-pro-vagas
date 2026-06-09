<template>
  <div class="w-full">
    <!-- Confirmação antes de criar conta nova -->
    <div
      v-if="pendingProvider"
      class="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm"
    >
      <p class="font-medium text-slate-800">Nenhuma conta encontrada para:</p>
      <p class="mt-0.5 truncate font-semibold text-blue-700">{{ pendingProvider.email }}</p>
      <p class="mt-2 text-slate-500">Deseja criar uma conta com este e-mail?</p>
      <div class="mt-3 flex gap-2">
        <button
          type="button"
          class="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
          @click="confirmSignup"
        >
          Criar conta
        </button>
        <button
          type="button"
          class="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          @click="cancelSignup"
        >
          Cancelar
        </button>
      </div>
    </div>

    <!-- Botão Google padrão -->
    <GoogleLogin v-else class="w-full" :callback="handleGoogleLogin" prompt>
      <button
        type="button"
        class="flex w-full items-center justify-center gap-3 rounded-lg border px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        :class="error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 533.5 544.3" class="shrink-0">
          <path fill="#4285f4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272.1v95.3h146.9c-6.4 34.7-25.7 64.1-54.8 83.5v69.1h88.7c52-47.9 80.6-118.5 80.6-197.5z"/>
          <path fill="#34a853" d="M272.1 544.3c73.9 0 135.9-24.5 181.2-66.6l-88.7-69.1c-24.6 16.5-56.2 26.2-92.5 26.2-71.1 0-131.4-48-153-112.8h-90v70.9c45.4 89.7 138.7 151.4 243 151.4z"/>
          <path fill="#fbbc04" d="M119.1 321.9c-10.3-30.6-10.3-63.7 0-94.3v-70.9h-90c-38.1 74.9-38.1 161.2 0 236.1l90-70.9z"/>
          <path fill="#ea4335" d="M272.1 107.4c39.9 0 75.8 13.8 104.2 40.8l78.1-78.1C407.9 24.2 345.9 0 272.1 0 167.8 0 74.5 61.7 29.1 151.4l90 70.9c21.6-64.8 81.9-112.8 153-112.8z"/>
        </svg>
        <span>Entrar com Google</span>
      </button>
      <span v-if="error" class="mt-1.5 flex w-full justify-center text-xs text-red-500">{{ error }}</span>
    </GoogleLogin>
  </div>
</template>

<script>
import { useAuthStore } from '@/modules/auth/store';
import { useCompanyStore } from '@/modules/users/store/company';
import { useUserStore } from '@/modules/users/store/user';

export default {
  name: 'GoogleLoginButton',
  data() {
    return {
      error: '',
      pendingProvider: null
    };
  },
  computed: {
    authStore:    () => useAuthStore(),
    companyStore: () => useCompanyStore(),
    userStore:    () => useUserStore()
  },
  methods: {
    async handleGoogleLogin(response) {
      this.error = '';
      this.pendingProvider = null;

      const callback = response.credential
        ? { path: '/auth/google/credential/callback', payload: { idToken: response.credential } }
        : { path: '/auth/google/code/callback',       payload: { code: response.code } };

      try {
        const data = await this.axios.post(callback.path, callback.payload);

        if (data.user) {
          this.signinSuccessful(data);
        } else {
          // Usuário não encontrado — pedir confirmação antes de abrir cadastro
          this.pendingProvider = { email: data.payload?.email, raw: data };
        }
      } catch (error) {
        this.error = error?.response?.data?.error;
      }
    },

    confirmSignup() {
      const data = this.pendingProvider.raw;
      this.pendingProvider = null;

      // Garante que o subdomain da sessão anterior não afete as chamadas de registro
      this.authStore.clearSession();
      this.authStore.setProvider({ ...data, name: 'google' });
      this.authStore.setStepRegister(2);
      this.$router.push('/signup');
    },

    cancelSignup() {
      this.pendingProvider = null;
    },

    signinSuccessful(response) {
      this.authStore.login(response);
      this.authStore.setLoginMethod('google');

      if (response?.companies?.length > 1) {
        this.authStore.setStepLogin(2);
      } else {
        this.companyStore.setChosenCompany(response?.companies[0]);
        this.userStore.setUserCompany(response?.companies[0]?.id);
        this.$router.push('/');
      }
    }
  }
};
</script>
