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
            Recupere seu<br />
            <span class="text-blue-400">acesso agora.</span>
          </h1>
          <p class="mt-5 max-w-xs text-base leading-relaxed text-slate-400">
            Enviaremos um link seguro para você criar uma nova senha rapidamente.
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

        <!-- Step 1: Formulário de e-mail -->
        <template v-if="step === 1">
          <div class="mb-8">
            <h2 class="text-2xl font-bold text-slate-900">Recuperar senha</h2>
            <p class="mt-1 text-sm text-slate-500">
              Digite seu e-mail para receber as instruções.
            </p>
          </div>

          <!-- Disclaimer: magic link -->
          <div class="mb-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
            <BaseIcon name="Envelope" class="!size-4 mt-0.5 shrink-0" />
            <span>
              Sabia que você pode entrar sem senha?
              <router-link to="/signin" class="font-semibold underline underline-offset-2 hover:text-blue-900">
                Use o link mágico
              </router-link>
              — receba um link no e-mail e acesse em segundos, sem precisar de senha.
            </span>
          </div>

          <div v-if="error" class="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-center text-sm text-red-600">
            {{ error }}
          </div>

          <form class="space-y-5" @submit.prevent="recovery">
            <div>
              <FormInput
                v-model="email"
                type="email"
                label="E-mail"
                placeholder="seu@email.com"
                icon="Envelope"
              />
            </div>

            <button
              type="submit"
              class="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none"
            >
              Enviar instruções
              <BaseIcon name="ChevronRight" class="!size-4" />
            </button>
          </form>

          <p class="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-400">
            Lembrou a senha?
            <router-link to="/signin" class="font-semibold text-blue-600 hover:text-blue-800">
              Entrar
            </router-link>
          </p>
        </template>

        <!-- Step 2: E-mail enviado -->
        <template v-else>
          <div class="text-center">
            <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <BaseIcon name="Envelope" class="!size-8 text-slate-700" />
            </div>

            <h2 class="text-2xl font-bold text-slate-900">Verifique seu e-mail</h2>
            <p class="mt-2 text-sm text-slate-500">
              Enviamos as instruções para:
            </p>
            <p class="mt-1 font-semibold text-slate-800">{{ email }}</p>

            <p class="mt-6 text-sm text-slate-500 leading-relaxed">
              Caso esse e-mail esteja registrado, você receberá as instruções em instantes.
              Não recebeu?
              <button class="font-semibold text-blue-600 hover:text-blue-800" @click="step = 1">
                Reenviar
              </button>
            </p>

            <router-link
              to="/signin"
              class="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Voltar para o login
            </router-link>
          </div>
        </template>

      </div>
    </div>
  </div>
</template>

<script>
import FormInput from '@/components/form/Input';
import BaseIcon from '@/components/icons/BaseIcon';

export default {
  components: { FormInput, BaseIcon },
  data() {
    return {
      email: '',
      step: 1,
      error: '',
      features: [
        { icon: 'LockClosed', label: 'Link seguro com expiração automática' },
        { icon: 'Envelope',   label: 'Instruções enviadas para seu e-mail' },
        { icon: 'FingerPrint', label: 'Proteção contra acesso não autorizado' }
      ]
    };
  },
  mounted() {
    if (this.$route.query?.email) {
      this.email = this.$route.query.email;
    }
  },
  methods: {
    async recovery() {
      await this.axios
        .post('/reset_password', { user: { email: this.email } })
        .then(() => { this.step = 2; })
        .catch(err => {
          this.error = err?.response?.data?.error || 'Erro ao enviar. Tente novamente.';
        });
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
