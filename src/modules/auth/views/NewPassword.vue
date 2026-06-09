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
            Seja muito<br />
            <span class="text-blue-400">bem-vindo!</span>
          </h1>
          <p class="mt-5 max-w-xs text-base leading-relaxed text-slate-400">
            Um administrador criou sua conta. Defina sua senha para começar a usar o Roster Pro.
          </p>
        </div>

        <p class="text-xs text-slate-600">rosterpro.com.br © {{ new Date().getFullYear() }}</p>
      </div>
    </div>

    <!-- ───── Painel direito — Formulário ───── -->
    <div class="flex flex-1 flex-col justify-center bg-white px-8 py-12 sm:px-12">

      <!-- Logo mobile -->
      <div class="mb-10 md:hidden">
        <img src="@/assets/roster.png" alt="Roster Pro" class="w-36" />
      </div>

      <!-- Step 1: Definir senha -->
      <div v-if="step === 1" class="mx-auto w-full max-w-sm">

        <div class="mb-8">
          <h2 class="text-2xl font-bold text-slate-900">Defina sua senha</h2>
          <p class="mt-1 text-sm text-slate-500">Escolha uma senha segura para acessar sua conta.</p>
        </div>

        <div v-if="error" class="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-center text-sm text-red-600">
          {{ error }}
        </div>

        <form class="space-y-5" @submit.prevent="reset">
          <div>
            <FormInput
              v-model="password"
              type="password"
              label="Nova senha"
              placeholder="Mínimo 8 caracteres"
              icon="LockClosed"
            />
            <div
              v-for="(x, index) in v$.password.$errors"
              :key="index"
              class="mt-1 text-xs text-red-500"
            >
              {{ x.$message }}
            </div>
          </div>

          <div>
            <FormInput
              v-model="passwordConfirmation"
              type="password"
              label="Confirmar senha"
              placeholder="Repita a senha"
              icon="LockClosed"
            />
            <div
              v-for="(x, index) in v$.passwordConfirmation.$errors"
              :key="index"
              class="mt-1 text-xs text-red-500"
            >
              {{ x.$message }}
            </div>
          </div>

          <button
            type="submit"
            class="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none"
          >
            Definir senha e entrar
            <BaseIcon name="ChevronRight" class="!size-4" />
          </button>
        </form>
      </div>

    </div>
  </div>
</template>

<script>
import FormInput from '@/components/form/Input';
import BaseIcon from '@/components/icons/BaseIcon';

import { useVuelidate } from '@vuelidate/core/index.js';
import { required, minLength, sameAs, helpers } from '@vuelidate/validators/index.js';
import { useAuthStore } from '@/modules/auth/store';
import { useCompanyStore } from '@/modules/users/store/company';
import { useUserStore } from '@/modules/users/store/user';

export default {
  name: 'NewPassword',
  components: { FormInput, BaseIcon },
  setup() {
    return { v$: useVuelidate() };
  },
  data() {
    return {
      // step 1
      password: '',
      passwordConfirmation: '',
      token: '',
      user: '',
      error: '',
    };
  },
  computed: {
    authStore: () => useAuthStore(),
    companyStore: () => useCompanyStore(),
    userStore: () => useUserStore()
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    this.token = decodeURIComponent(urlParams.get('token'));
    this.user = decodeURIComponent(urlParams.get('hash'));
  },
  validations() {
    return {
      password: {
        required: helpers.withMessage('Obrigatório', required),
        minLength: helpers.withMessage('Mínimo 8 caracteres', minLength(8))
      },
      passwordConfirmation: {
        required: helpers.withMessage('Obrigatório', required),
        sameAs: helpers.withMessage('Senhas não são iguais', sameAs(this.password))
      }
    };
  },
  methods: {
    async reset() {
      const result = await this.v$.$validate();
      if (!result) return;

      this.axios
        .put('/password', {
          password: this.password,
          password_confirmation: this.passwordConfirmation,
          reset_password_token: this.token,
          user: this.user
        }, { withCredentials: true })
        .then(response => this.resetSuccessful(response))
        .catch(() => { this.error = 'Sessão inválida ou expirada.'; });
    },
    resetSuccessful(response) {
      this.authStore.login(response);
      this.userStore.setUser(response?.user);
      this.error = '';

      if (response?.companies?.length > 1) {
        this.authStore.setStepLogin(2);
      } else {
        this.companyStore.setChosenCompany(response?.companies[0]);
        this.userStore.setUserCompany(response?.companies[0]?.id);
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
