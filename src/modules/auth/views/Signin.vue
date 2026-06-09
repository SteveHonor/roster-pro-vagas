<template>
  <section>
    <SigninForm v-if="authStore.currentStepLogin == 1" />
    <ChooseCompany v-if="authStore.currentStepLogin == 2" />
  </section>
</template>

<script>
import { useAuthStore } from '@/modules/auth/store';

import SigninForm from '@/modules/auth/components/signin/SigninForm';
import ChooseCompany from '@/modules/auth/components/signin/ChooseCompany';

export default {
  name: 'Login',
  components: {
    SigninForm,
    ChooseCompany
  },
  computed: {
    authStore: () => useAuthStore()
  }
};
</script>
