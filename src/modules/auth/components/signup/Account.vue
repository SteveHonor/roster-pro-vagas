<template>
  <div class="flex min-h-screen">

    <!-- ───── Painel esquerdo — Brand ───── -->
    <div class="relative hidden md:flex md:w-[42%] flex-col justify-between overflow-hidden bg-slate-900 p-12">
      <!-- Foto de fundo -->
      <div class="absolute inset-0 bg-login bg-cover bg-center opacity-20" />

      <!-- Gradiente -->
      <div class="absolute inset-0 bg-gradient-to-br from-blue-700/30 via-transparent to-transparent" />

      <!-- Grade pontilhada -->
      <div class="absolute inset-0 opacity-[0.04]" style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 28px 28px;" />

      <div class="relative z-10 flex flex-col justify-between h-full">

        <!-- Logo -->
        <img src="@/assets/roster.png" alt="Roster Pro" class="w-36 brightness-0 invert" />

        <!-- Value prop -->
        <div>
          <h1 class="text-4xl font-black leading-tight text-white">
            Comece grátis.<br />
            <span class="text-blue-400">Sem cartão de crédito.</span>
          </h1>
          <p class="mt-5 max-w-xs text-base leading-relaxed text-slate-400">
            Configure escalas e gerencie equipes em minutos. Simples assim.
          </p>

          <div class="mt-10 space-y-4">
            <div v-for="feat in features" :key="feat.label" class="flex items-center gap-3">
              <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                <BaseIcon :name="feat.icon" class="text-blue-400" />
              </div>
              <span class="text-sm text-slate-300">{{ feat.label }}</span>
            </div>
          </div>

          <router-link
            to="/signin"
            class="mt-10 inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-white"
          >
            Já tem conta? Entrar
            <BaseIcon name="ChevronRight" class="!size-4" />
          </router-link>
        </div>

        <p class="text-xs text-slate-600">rosterpro.com.br © {{ new Date().getFullYear() }}</p>
      </div>
    </div>

    <!-- ───── Painel direito — Formulário ───── -->
    <div class="flex flex-1 flex-col bg-white px-8 py-10 sm:px-12 overflow-y-auto">

      <!-- Logo mobile -->
      <div class="mb-8 md:hidden">
        <img src="@/assets/roster.png" alt="Roster Pro" class="w-36" />
      </div>

      <div class="my-auto mx-auto w-full max-w-lg">

        <!-- Heading -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-slate-900">Crie sua conta</h2>
          <p class="mt-1 text-sm text-slate-500">Preencha os dados abaixo para começar.</p>
        </div>

        <form class="space-y-5" @submit.prevent="signup">

          <!-- Email + Celular -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-5">
            <div class="sm:col-span-3">
              <FormInput
                v-model="authStore.register.email"
                type="email"
                label="E-mail"
                placeholder="seu@email.com"
                icon="Envelope"
                :on-blur="emailChecker"
              />
              <div v-if="v$.authStore.register.email.$error" class="mt-1 text-xs text-red-500">
                Obrigatório
              </div>
              <LgpdFieldHint
                v-else
                hint="Usado para login, confirmação e comunicações."
                :icon="true"
              />
            </div>

            <div class="sm:col-span-2">
              <FormInput
                v-model="authStore.register.phone"
                v-mask="['(##) ####-####', '(##) #####-####']"
                type="text"
                label="Celular"
                placeholder="(00) 00000-0000"
                icon="Phone"
              />
              <div v-if="v$.authStore.register.phone.$error" class="mt-1 text-xs text-red-500">
                Obrigatório
              </div>
              <LgpdFieldHint
                v-else
                hint="Para verificação de identidade."
                :icon="true"
              />
            </div>
          </div>

          <!-- Nome -->
          <div>
            <FormInput
              v-model="authStore.register.name"
              label="Nome Completo"
              type="text"
              placeholder="Seu nome completo"
              icon="User"
            />
            <div v-if="v$.authStore.register.name.$error" class="mt-1 text-xs text-red-500">
              Obrigatório
            </div>
            <LgpdFieldHint
              v-else
              hint="Exibido nos relatórios de escala."
              :icon="true"
            />
          </div>

          <!-- Divisor -->
          <div class="flex items-center gap-3 py-1">
            <div class="h-px flex-1 bg-slate-100" />
            <span class="text-xs text-slate-400">senha de acesso</span>
            <div class="h-px flex-1 bg-slate-100" />
          </div>

          <!-- Senha + Confirmação -->
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <FormInput
                v-model="authStore.register.password"
                label="Senha"
                type="password"
                placeholder="Mínimo 8 caracteres"
                icon="LockClosed"
              />
              <ul class="mt-2 space-y-0.5">
                <li
                  class="flex items-center gap-1.5 text-xs transition-colors"
                  :class="(authStore.register.password?.length ?? 0) >= 8 ? 'text-green-600' : 'text-slate-400'"
                >
                  <span>{{ (authStore.register.password?.length ?? 0) >= 8 ? '✓' : '•' }}</span>
                  Mínimo 8 caracteres
                </li>
                <li
                  class="flex items-center gap-1.5 text-xs transition-colors"
                  :class="/[A-Z]/.test(authStore.register.password) ? 'text-green-600' : 'text-slate-400'"
                >
                  <span>{{ /[A-Z]/.test(authStore.register.password) ? '✓' : '•' }}</span>
                  1 letra maiúscula
                </li>
                <li
                  class="flex items-center gap-1.5 text-xs transition-colors"
                  :class="/[0-9]/.test(authStore.register.password) ? 'text-green-600' : 'text-slate-400'"
                >
                  <span>{{ /[0-9]/.test(authStore.register.password) ? '✓' : '•' }}</span>
                  1 número
                </li>
              </ul>
            </div>

            <div>
              <FormInput
                v-model="authStore.register.passwordConfirmation"
                type="password"
                label="Confirmar Senha"
                placeholder="Repita a senha"
                icon="LockClosed"
              />
              <div
                v-for="(x, index) in v$.authStore.register.passwordConfirmation.$errors"
                :key="index"
                class="mt-1 text-xs text-red-500"
              >
                {{ x.$message }}
              </div>
            </div>
          </div>

          <!-- Checkboxes -->
          <div class="space-y-3 pt-1">
            <label class="flex cursor-pointer items-start gap-3">
              <input
                v-model="authStore.register.terms"
                type="checkbox"
                class="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-slate-900"
              />
              <span class="text-sm text-slate-700">
                Li e concordo com os
                <router-link
                  to="/politics"
                  target="_blank"
                  class="font-semibold underline underline-offset-2 hover:text-slate-900"
                >
                  Termos de Uso e Política de Privacidade
                </router-link>
              </span>
            </label>

            <label class="flex cursor-pointer items-start gap-3">
              <input
                v-model="authStore.register.marketing_consent"
                type="checkbox"
                class="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-slate-900"
              />
              <span class="text-sm text-slate-500">
                Aceito receber novidades e ofertas por e-mail
                <span class="text-xs text-slate-400">(opcional)</span>
              </span>
            </label>
          </div>

          <!-- CTA -->
          <button
            type="submit"
            class="mt-2 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-bold text-white transition focus:outline-none"
            :class="authStore.register.terms
              ? 'bg-slate-900 hover:bg-slate-800 cursor-pointer'
              : 'bg-slate-900/30 cursor-not-allowed'"
            :disabled="!authStore.register.terms"
            @click="nextStep"
          >
            Próximo
            <BaseIcon name="ChevronRight" class="!size-4" />
          </button>
        </form>

        <!-- Footer -->
        <p class="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-400">
          Já tem conta?
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
import LgpdFieldHint from '@/components/form/LgpdFieldHint.vue';
import BaseIcon from '@/components/icons/BaseIcon';

import { useVuelidate } from '@vuelidate/core/index.js';
import {
  required,
  email,
  minLength,
  sameAs,
  helpers
} from '@vuelidate/validators/index.js';
import { useAuthStore } from '@/modules/auth/store';

export default {
  name: 'SignupAccount',
  components: {
    FormInput,
    LgpdFieldHint,
    BaseIcon
  },
  setup() {
    return { v$: useVuelidate() };
  },
  data() {
    return {
      features: [
        { icon: 'Calendar', label: 'Escalas diárias, semanais e personalizadas' },
        { icon: 'Users',    label: 'Convide sua equipe e comece a organizar' },
        { icon: 'Sparkles', label: 'IA para otimizar seus times automaticamente' }
      ]
    };
  },
  validations() {
    return {
      authStore: {
        register: {
          name: { required },
          email: { required, email },
          phone: { required },
          password: {
            required: helpers.withMessage('Obrigatório', required),
            minLength: helpers.withMessage('Mínimo 8 caracteres', minLength(8)),
            complexity: helpers.withMessage(
              'Deve conter pelo menos 1 letra maiúscula e 1 número',
              value => !value || (/[A-Z]/.test(value) && /[0-9]/.test(value))
            )
          },
          passwordConfirmation: {
            required: helpers.withMessage('Obrigatório', required),
            sameAs: helpers.withMessage(
              'Senhas não são iguais',
              sameAs(this.authStore.register.password)
            )
          }
        }
      }
    };
  },
  computed: {
    authStore: () => useAuthStore()
  },
  mounted() {
    this.$nextTick(() => {
      this.authStore.register.email = this.$route.query.email || '';
      this.authStore.register.phone = this.$route.query.phone || '';
    });
  },
  methods: {
    async nextStep() {
      const result = await this.v$.$validate();

      if (result) {
        this.authStore.stepRegister += 1;
      }
    },
    async emailChecker() {
      if (await this.v$.authStore.register.email.$validate()) {
        await this.axios
          .post('/email-checker', {
            email: this.authStore.register.email
          })
          .then(response => {
            if (response === 'found') {
              this.confirmationStore.setConfirmation({
                title: 'Ops! Esse e-mail já tem conta',
                description: 'Deseja criar uma nova senha para acessar?',
                open: true,
                confirmText: 'Sim, quero recuperar minha senha',
                cancelText: 'Voltar para login',
                onConfirm: () => {
                  this.$router.replace({
                    path: '/recuperar-senha',
                    query: { email: this.authStore.register.email }
                  });
                  this.confirmationStore.close();
                },
                onCancel: () => {
                  this.$router.replace('/signin');
                  this.confirmationStore.close();
                }
              });
            }
          });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.bg-login {
  background-image: url('@/assets/bg-login-up.jpg');
  background-size: cover;
  background-position-x: right;
}
</style>
