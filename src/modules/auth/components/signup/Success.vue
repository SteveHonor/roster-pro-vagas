<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 px-6">
    <div class="mx-auto w-full max-w-md rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm">

      <!-- Logo -->
      <img src="@/assets/roster.png" alt="Roster Pro" class="mx-auto mb-8 w-32" />

      <!-- Ícone de sucesso -->
      <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900">
        <BaseIcon name="Check" class="!size-8 text-white" />
      </div>

      <!-- Mensagem -->
      <h2 class="text-2xl font-bold text-slate-900">
        Parabéns, {{ firstName }}!
      </h2>
      <p class="mt-2 text-slate-500">Sua conta RosterPro Vagas está pronta!</p>

      <!-- Caixa informativa -->
      <div class="mt-6 rounded-xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-600 leading-relaxed">
        Enviamos um e-mail de confirmação para você.<br />
        Verifique sua caixa de entrada e clique no link para ativar sua conta.
      </div>

      <router-link
        to="/signin"
        class="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
      >
        Ir para o login
        <BaseIcon name="ChevronRight" class="!size-4" />
      </router-link>

      <p class="mt-6 text-xs text-slate-400">
        Não recebeu o e-mail? Verifique a pasta de spam.
      </p>
    </div>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import { useAuthStore } from '@/modules/auth/store';

export default {
  name: 'SignupSuccess',
  components: { BaseIcon },
  data() {
    return { name: '' };
  },
  computed: {
    authStore: () => useAuthStore(),
    firstName() {
      const full = this.authStore.register.name || this.name || '';
      return full.split(' ')[0] || 'seja bem-vindo';
    }
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    const name = decodeURIComponent(urlParams.get('name'));
    this.name = name || '';
    this.authStore.firstAccess = true;
  }
};
</script>
