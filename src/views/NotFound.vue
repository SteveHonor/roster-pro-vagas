<template>
  <div class="container">
    <div
      class="mx-auto flex h-[60vh] flex-wrap content-center items-center justify-center text-center"
    >
      <BaseIcon name="link-slash" class="h-32 w-32 text-gray-200" />
      <h1 class="mt-5 w-full text-8xl font-semibold text-gray-200">OOPS!</h1>
      <h2 class="mt-5 w-full text-2xl font-bold text-gray-500">
        Página não encontrada
      </h2>
      <p class="mt-2 font-thin text-gray-500">
        Navegue pelo menu ou entre em contato
        <span class="text-gray-800"> suporte@rosterpro.com.br</span>
      </p>
    </div>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { useAuthStore } from '@/modules/auth/store';

export default {
  components: {
    BaseIcon
  },
  computed: {
    authStore: () => useAuthStore()
  },
  created() {
    if (!this.authStore.isSignedIn) this.$router.replace('/signin');
  },
  mounted() {
    this.breadcrumbStore.setBreadcrumb([
      { name: 'Página não encontrada', link: '/not-found' }
    ]);
  }
};
</script>
