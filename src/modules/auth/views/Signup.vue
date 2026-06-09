<template>
  <div>
    <!-- Banner Vagas sempre visível no cadastro -->
    <div
      v-if="authStore.stepRegister <= 2"
      class="flex items-center justify-center gap-2 border-b border-blue-100 bg-blue-50 px-4 py-2 text-sm text-blue-700"
    >
      <span>Criando sua conta para o <strong>RosterPro Vagas</strong></span>
    </div>

    <SignupAccount v-if="authStore.stepRegister == 1" />
    <SignupCompany v-if="authStore.stepRegister == 2" />
    <SignupPlan    v-if="authStore.stepRegister == 3" />
    <SignupSuccess v-if="authStore.stepRegister == 4" />
  </div>
</template>

<script>
import SignupAccount from '@/modules/auth/components/signup/Account';
import SignupCompany from '@/modules/auth/components/signup/Company';
import SignupPlan    from '@/modules/auth/components/signup/Plan';
import SignupSuccess from '@/modules/auth/components/signup/Success';

import { useAuthStore } from '@/modules/auth/store';

export default {
  components: { SignupAccount, SignupCompany, SignupPlan, SignupSuccess },

  computed: {
    authStore: () => useAuthStore()
  },

  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    const step = decodeURIComponent(urlParams.get('step'));

    this.authStore.register = {};
    // Este app é sempre Vagas — não depende de URL param
    this.authStore.setActiveProduct('vagas');

    if (!this.authStore.isSignedIn) {
      this.authStore.clearSession();
    }

    if (step && ['1', '2', '3', '4'].includes(step)) {
      this.authStore.stepRegister = parseInt(step);
    } else if (!this.authStore.isOauth) {
      this.authStore.stepRegister = 1;
    } else {
      this.authStore.stepRegister = 2;
    }
  },

  created() {
    const hasPlanId = new URLSearchParams(window.location.search).has('plan_id');
    if (!hasPlanId && this.authStore.isSignedIn) {
      this.$router.replace('/');
    }
  }
};
</script>
