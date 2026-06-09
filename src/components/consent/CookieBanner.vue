<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="visible"
      class="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white shadow-lg"
    >
      <div class="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-start gap-3">
          <BaseIcon name="ShieldCheck" class="!size-5 shrink-0 mt-0.5 text-slate-400" />
          <p class="text-sm text-slate-600 leading-relaxed">
            Usamos cookies analíticos (<strong>PostHog</strong>) e de monitoramento de erros (<strong>Sentry</strong>)
            para melhorar o produto. Nenhum dado é vendido a terceiros.
            <router-link to="/politics" class="text-blue-600 hover:underline">Política de Privacidade</router-link>
          </p>
        </div>

        <div class="flex shrink-0 gap-2">
          <button
            type="button"
            class="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            @click="reject"
          >
            Apenas essenciais
          </button>
          <button
            type="button"
            class="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
            @click="accept"
          >
            Aceitar tudo
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import { saveConsent, initAnalytics } from '@/analytics';
import { useAuthStore } from '@/modules/auth/store';

export default {
  name: 'CookieBanner',
  components: { BaseIcon },
  emits: ['consented'],
  data() {
    return { visible: false };
  },
  computed: {
    authStore: () => useAuthStore()
  },
  mounted() {
    const raw = localStorage.getItem('cookie_consent');
    this.visible = raw === null;
  },
  methods: {
    accept() {
      saveConsent(true);
      this.visible = false;
      initAnalytics(this.$root.$.appContext.app, this.$router);
      this.recordBackend(true);
      this.$emit('consented', true);
    },
    reject() {
      saveConsent(false);
      this.visible = false;
      this.$emit('consented', false);
    },
    recordBackend(accepted) {
      if (!this.authStore.isSignedIn) return;
      this.axios
        .post('/consent/cookie', { accepted })
        .catch(() => {});
    }
  }
};
</script>
