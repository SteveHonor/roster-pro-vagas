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
            Nova senha,<br />
            <span class="text-blue-400">acesso seguro.</span>
          </h1>
          <p class="mt-5 max-w-xs text-base leading-relaxed text-slate-400">
            Escolha uma senha forte para manter sua conta protegida.
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

      <div class="mx-auto w-full max-w-sm">

        <div class="mb-8">
          <h2 class="text-2xl font-bold text-slate-900">Redefinir senha</h2>
          <p class="mt-1 text-sm text-slate-500">Preencha os campos abaixo para criar sua nova senha.</p>
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
            <ul class="mt-2 space-y-0.5">
              <li
                class="flex items-center gap-1.5 text-xs transition-colors"
                :class="password.length >= 8 ? 'text-green-600' : 'text-slate-400'"
              >
                <span>{{ password.length >= 8 ? '✓' : '•' }}</span>
                Mínimo 8 caracteres
              </li>
              <li
                class="flex items-center gap-1.5 text-xs transition-colors"
                :class="/[A-Z]/.test(password) ? 'text-green-600' : 'text-slate-400'"
              >
                <span>{{ /[A-Z]/.test(password) ? '✓' : '•' }}</span>
                1 letra maiúscula
              </li>
              <li
                class="flex items-center gap-1.5 text-xs transition-colors"
                :class="/[0-9]/.test(password) ? 'text-green-600' : 'text-slate-400'"
              >
                <span>{{ /[0-9]/.test(password) ? '✓' : '•' }}</span>
                1 número
              </li>
            </ul>
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
            Salvar nova senha
            <BaseIcon name="ChevronRight" class="!size-4" />
          </button>
        </form>

        <p class="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-400">
          Lembrou a senha?
          <router-link to="/signin" class="font-semibold text-blue-600 hover:text-blue-800">
            Entrar
          </router-link>
        </p>
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
  name: 'ResetPassword',
  components: { FormInput, BaseIcon },
  setup() {
    return { v$: useVuelidate() };
  },
  data() {
    return {
      password: '',
      passwordConfirmation: '',
      token: '',
      user: '',
      error: ''
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
        required:   helpers.withMessage('Obrigatório', required),
        minLength:  helpers.withMessage('Mínimo 8 caracteres', minLength(8)),
        complexity: helpers.withMessage(
          'Deve conter pelo menos 1 letra maiúscula e 1 número',
          value => !value || (/[A-Z]/.test(value) && /[0-9]/.test(value))
        )
      },
      passwordConfirmation: {
        required: helpers.withMessage('Obrigatório', required),
        sameAs:   helpers.withMessage('Senhas não são iguais', sameAs(this.password))
      }
    };
  },
  methods: {
    async reset() {
      const result = await this.v$.$validate();
      if (!result) return;

      this.error = '';

      this.axios
        .put('/password', {
          password: this.password,
          password_confirmation: this.passwordConfirmation,
          reset_password_token: this.token,
          user: this.user
        }, { withCredentials: true })
        .then(() => this.resetSuccessful())
        .catch(error => {
          const errors = error?.response?.data?.errors;
          this.error = Array.isArray(errors) ? errors.join(', ') : 'Sessão inválida ou expirada.';
        });
    },
    resetSuccessful() {
      this.error = '';
      this.$router.replace('/signin');
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
