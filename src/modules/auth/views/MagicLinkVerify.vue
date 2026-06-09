<template>
  <div class="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-10 text-center shadow-sm mx-auto">
      <router-link to="/" class="mb-10 block">
        <img src="@/assets/roster.png" alt="Roster Pro" class="mx-auto w-36" />
      </router-link>

      <!-- Carregando -->
      <div v-if="status === 'loading'">
        <div class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <BaseIcon name="ArrowPath" class="!size-6 animate-spin text-slate-700" />
        </div>
        <p class="text-sm text-slate-500">Verificando seu link de acesso...</p>
      </div>

      <!-- Erro -->
      <div v-else-if="status === 'error'">
        <div class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <BaseIcon name="Exclamation" class="!size-6 text-red-500" />
        </div>
        <h3 class="mb-2 text-base font-semibold text-slate-800">Link inválido ou expirado</h3>
        <p class="mb-6 text-sm text-slate-500">
          Este link já foi usado ou expirou. Solicite um novo link de acesso.
        </p>
        <router-link
          to="/signin"
          class="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >
          Voltar para o login
        </router-link>
      </div>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';

import { useAuthStore } from '@/modules/auth/store';
import { useCompanyStore } from '@/modules/users/store/company';
import { useUserStore } from '@/modules/users/store/user';
import { usePlanStore } from '@/components/plan/store';

export default {
  name: 'MagicLinkVerify',
  components: { BaseIcon },
  data() {
    return { status: 'loading' };
  },
  computed: {
    authStore:    () => useAuthStore(),
    planStore:    () => usePlanStore(),
    companyStore: () => useCompanyStore(),
    userStore:    () => useUserStore()
  },
  mounted() {
    this.verify();
  },
  methods: {
    verify() {
      const token = this.$route.query.token;
      if (!token) { this.status = 'error'; return; }

      this.axios
        .post('magic_link/verify', { token })
        .then(response => this.onSuccess(response))
        .catch(() => { this.status = 'error'; });
    },

    onSuccess(response) {
      if (response?.deviceToken) {
        this.authStore.setDeviceToken(response.deviceToken);
      }

      this.authStore.login(response);
      this.authStore.setLoginMethod('magic_link');
      this.planStore.setPlan(response.plan);

      if (response?.companies?.length > 1) {
        this.authStore.setStepLogin(2);
        this.$router.replace('/signin');
      } else {
        this.companyStore.setChosenCompany(response?.companies?.[0]);
        this.userStore.setUserCompany(response?.companies?.[0]?.id);

        if (this.$can.canAccess('operator')) {
          this.$router.replace('/');
        } else {
          this.$router.replace('/member');
        }
      }
    }
  }
};
</script>
