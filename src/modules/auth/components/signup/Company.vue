<template>
  <div class="flex min-h-screen">

    <!-- ───── Painel esquerdo — Brand ───── -->
    <div class="relative hidden md:flex md:w-[42%] flex-col justify-between overflow-hidden bg-slate-900 p-12">
      <div class="absolute inset-0 bg-login bg-cover bg-center opacity-20" />
      <div class="absolute inset-0 bg-gradient-to-br from-blue-700/30 via-transparent to-transparent" />
      <div class="absolute inset-0 opacity-[0.04]" style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 28px 28px;" />

      <div class="relative z-10 flex flex-col justify-between h-full">
        <img src="@/assets/roster.png" alt="Roster Pro" class="w-36 brightness-0 invert" />

        <div>
          <h1 class="text-4xl font-black leading-tight text-white">
            Configure seu<br />
            <span class="text-blue-400">workspace.</span>
          </h1>
          <p class="mt-5 max-w-xs text-base leading-relaxed text-slate-400">
            Defina o tipo da sua conta para personalizar sua experiência no Roster Pro.
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

        <!-- Cabeçalho -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-slate-900">Tipo de conta</h2>
          <p class="mt-1 text-sm text-slate-500">Sua conta pode ser pessoal ou corporativa.</p>
        </div>

        <!-- Banner conta Google (só para OAuth) -->
        <div
          v-if="authStore.isOauth"
          class="mb-6 flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 533.5 544.3" class="shrink-0">
            <path fill="#4285f4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272.1v95.3h146.9c-6.4 34.7-25.7 64.1-54.8 83.5v69.1h88.7c52-47.9 80.6-118.5 80.6-197.5z"/>
            <path fill="#34a853" d="M272.1 544.3c73.9 0 135.9-24.5 181.2-66.6l-88.7-69.1c-24.6 16.5-56.2 26.2-92.5 26.2-71.1 0-131.4-48-153-112.8h-90v70.9c45.4 89.7 138.7 151.4 243 151.4z"/>
            <path fill="#fbbc04" d="M119.1 321.9c-10.3-30.6-10.3-63.7 0-94.3v-70.9h-90c-38.1 74.9-38.1 161.2 0 236.1l90-70.9z"/>
            <path fill="#ea4335" d="M272.1 107.4c39.9 0 75.8 13.8 104.2 40.8l78.1-78.1C407.9 24.2 345.9 0 272.1 0 167.8 0 74.5 61.7 29.1 151.4l90 70.9c21.6-64.8 81.9-112.8 153-112.8z"/>
          </svg>
          <div class="min-w-0">
            <p class="text-xs text-slate-500">Criando conta com Google:</p>
            <p class="truncate text-sm font-semibold text-slate-800">{{ authStore.provider?.payload?.email }}</p>
          </div>
        </div>

        <!-- Tipo de conta toggle -->
        <div class="mb-8 flex gap-3">
          <button
            type="button"
            class="flex-1 rounded-lg border py-2.5 text-sm font-semibold transition"
            :class="authStore.register.accountType === 'personal'
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
            @click="setAccountType('personal')"
          >
            Pessoa Física
          </button>
          <button
            type="button"
            class="flex-1 rounded-lg border py-2.5 text-sm font-semibold transition"
            :class="authStore.register.accountType !== 'personal'
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
            @click="setAccountType('corporate')"
          >
            Corporativa
          </button>
        </div>

        <form class="space-y-5" @submit.prevent="nextStep">

          <!-- Campos corporativos -->
          <div v-if="authStore.register.accountType !== 'personal'" class="space-y-5">
            <div>
              <FormInput
                v-model="authStore.register.companyName"
                type="text"
                label="Nome da Instituição"
                placeholder="Ex: Empresa ABC Ltda"
                icon="Company"
              />
              <div v-if="v$.authStore.register.companyName.$error" class="mt-1 text-xs text-red-500">
                Obrigatório
              </div>
            </div>

            <div>
              <FormInput
                v-model="authStore.register.companyDocument"
                v-mask="'##.###.###/####-##'"
                type="text"
                label="CNPJ da Instituição"
                placeholder="00.000.000/0000-00"
                icon="DocumentText"
              />
              <div v-if="v$.authStore.register.companyDocument.$error" class="mt-1 text-xs text-red-500">
                Obrigatório
              </div>
            </div>

            <div>
              <FormSelect
                v-model="authStore.register.companyType"
                label="Tipo da Instituição"
                :options="companiesTypes()"
                placeholder="Escolha o tipo"
                :revert-color="true"
              />
              <div v-if="v$.authStore.register.companyType.$error" class="mt-1 text-xs text-red-500">
                Obrigatório
              </div>
            </div>
          </div>

          <!-- Conta pessoal -->
          <div v-else class="rounded-lg border border-slate-100 bg-slate-50 p-5">
            <p class="text-sm text-slate-600">
              Como pessoa física, não precisamos de dados adicionais da empresa.
              Você pode avançar para escolher seu plano.
            </p>
          </div>

          <!-- Telefone (só para OAuth — email/senha já coletam no Account.vue) -->
          <div v-if="authStore.isOauth">
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
          </div>

          <!-- Termos (só para OAuth — email/senha já coletam no Account.vue) -->
          <div v-if="authStore.isOauth" class="space-y-3 pt-1">
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
            <div v-if="v$.authStore.register.terms.$error" class="text-xs text-red-500">
              {{ v$.authStore.register.terms.$errors[0]?.$message || 'Você precisa aceitar os termos para continuar' }}
            </div>

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

          <!-- Botões -->
          <div class="flex gap-3 pt-2">
            <!-- Para usuários OAuth: "Cancelar" vai para signin; para email: "Voltar" vai para step anterior -->
            <router-link
              v-if="authStore.isOauth"
              to="/signin"
              class="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Cancelar
            </router-link>
            <button
              v-else
              type="button"
              class="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              @click="previewStep"
            >
              Voltar
            </button>

            <button
              type="submit"
              class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none cursor-pointer"
            >
              Próximo
              <BaseIcon name="ChevronRight" class="!size-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import FormInput from '@/components/form/Input';
import FormSelect from '@/components/form/Select';
import BaseIcon from '@/components/icons/BaseIcon';

import { useVuelidate } from '@vuelidate/core';
import { requiredIf, helpers } from '@vuelidate/validators';
import { useAuthStore } from '@/modules/auth/store';


export default {
  name: 'SignupCompany',
  components: {
    FormInput,
    FormSelect,
    BaseIcon
  },
  setup() {
    return { v$: useVuelidate() };
  },
  validations() {
    return {
      authStore: {
        register: {
          companyName: {
            required: requiredIf(() => this.authStore.register.accountType !== 'personal')
          },
          companyDocument: {
            required: requiredIf(() => this.authStore.register.accountType !== 'personal')
          },
          companyType: {
            required: requiredIf(() => this.authStore.register.accountType !== 'personal')
          },
          phone: {
            required: requiredIf(() => this.authStore.isOauth)
          },
          terms: {
            mustBeTrue: helpers.withMessage(
              'Você precisa aceitar os termos para continuar',
              value => !this.authStore.isOauth || value === true
            )
          }
        }
      }
    };
  },
  data() {
    return {
      features: [
        { icon: 'Company',    label: 'Suporte a múltiplas instituições' },
        { icon: 'Users',      label: 'Gestão completa de equipes' },
        { icon: 'LockClosed', label: 'LGPD e privacidade por design' }
      ]
    };
  },
  computed: {
    authStore: () => useAuthStore()
  },
  methods: {
    setAccountType(type) {
      this.authStore.register.accountType = type;

      if (type === 'personal') {
        this.authStore.register.companyName     = '';
        this.authStore.register.companyDocument = '';
        this.authStore.register.companyType     = '';
      }
    },
    companiesTypes() {
      return [
        { value: 'instituicao_religiosa',    label: 'Instituição Religiosa' },
        { value: 'ong',                      label: 'ONG (Organização Não Governamental)' },
        { value: 'orgao_publico',            label: 'Órgão Público' },
        { value: 'empresa_publica',          label: 'Empresa Pública' },
        { value: 'empresa_privada',          label: 'Empresa Privada' },
        { value: 'autarquia',                label: 'Autarquia' },
        { value: 'fundacao_publica',         label: 'Fundação Pública' },
        { value: 'sociedade_economia_mista', label: 'Sociedade de Economia Mista' },
        { value: 'associacao',               label: 'Associação' },
        { value: 'fundacao_privada',         label: 'Fundação Privada' },
        { value: 'organizacao_social',       label: 'Organização Social (OS)' },
        { value: 'oscip',                    label: 'OSCIP' },
        { value: 'cooperativa',              label: 'Cooperativa' },
        { value: 'instituicao_financeira',   label: 'Instituição Financeira' },
        { value: 'instituicao_ensino_publica',  label: 'Instituição de Ensino Pública' },
        { value: 'instituicao_ensino_privada',  label: 'Instituição de Ensino Privada' },
        { value: 'organizacao_internacional',   label: 'Organização Internacional' },
        { value: 'conselho_profissional',    label: 'Conselho Profissional' },
        { value: 'others',                   label: 'Outros' }
      ];
    },
    previewStep() {
      this.authStore.stepRegister -= 1;
    },
    async nextStep() {
      const valid = await this.v$.$validate();
      if (!valid) return;
      this.authStore.stepRegister += 1;
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
