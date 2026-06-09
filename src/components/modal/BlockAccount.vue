<template>
  <Modal :open="authStore.isBlocked && !$can.canAccess('admin')">
    <div
      class="animate-fade-in mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-md"
    >
      <!-- Ícone -->
      <div class="mb-4 flex justify-center">
        <div
          class="flex h-14 w-14 items-center justify-center rounded-full bg-red-100"
        >
          <BaseIcon name="exclamation" class="h-7 w-7 text-red-600" />
        </div>
      </div>

      <!-- Título -->
      <h2 class="mb-2 text-center text-xl font-semibold text-gray-800">
        Conta desativada
      </h2>

      <!-- Conteúdo -->
      <div class="space-y-3 text-sm text-gray-600">
        <p>
          Esta conta foi <strong>desativada pelo administrador</strong> e não
          está mais disponível para acesso.
        </p>

        <p>
          Fique tranquilo(a): todos os dados, históricos e registros da conta
          estão sendo <strong>armazenados com segurança</strong>.
        </p>

        <p>
          Um <strong>backup completo</strong> será preparado e enviado ao
          administrador responsável em até <strong>10 dias úteis</strong>.
        </p>

        <p class="text-xs text-gray-500">
          Caso tenha dúvidas ou precise de suporte adicional, nossa equipe está
          à disposição.
        </p>
      </div>

      <!-- Ação -->
      <div class="mt-6">
        <BaseButton
          class="w-full"
          @click="logout"
        >
          Sair da conta
        </BaseButton>
      </div>
    </div>
  </Modal>
</template>

<script>
import { useAuthStore } from '@/modules/auth/store';

import BaseButton from '@/components/base/Button';
import BaseIcon from '@/components/icons/BaseIcon';
import Modal from '@/components/modal/Modal';

export default {
  name: 'BlockAccount',
  components: {
    BaseButton,
    BaseIcon,
    Modal
  },

  computed: {
    authStore: () => useAuthStore()
  },

  methods: {
    logout() {
      // Limpa autenticação local
      this.authStore.logout();

      // Redireciona para login
      this.$router.replace('/');
    }
  }
};
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
</style>
