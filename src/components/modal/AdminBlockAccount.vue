<template>
  <Modal :open="authStore.isBlocked && $can.canAccess('operator')">
    <div
      class="animate-fade-in mx-4 w-full max-w-lg rounded-lg bg-white p-6 shadow-md"
    >
      <!-- Ícone -->
      <div class="mb-4 flex justify-center">
        <div
          class="flex h-14 w-14 items-center justify-center rounded-full bg-orange-100"
        >
          <BaseIcon name="lock-closed" />
        </div>
      </div>

      <!-- Título -->
      <h2 class="my-6 text-center text-xl font-semibold text-gray-800">
        Conta em processo de encerramento
      </h2>

      <!-- Conteúdo -->
      <p class="mb-4 leading-relaxed text-gray-600">
        Esta conta foi <strong>encerrada por um administrador</strong> e
        atualmente está em
        <strong class="text-orange-600">Processo de encerramento</strong>.
      </p>

      <p class="mb-6 text-sm text-gray-600">
        Após o processo de encerramento da conta uma cópia da conta será enviada
        para o e-mail solicitante.
      </p>

      <p class="mb-6 text-sm text-gray-600">
        Durante esse período, todos os usuários permanecem bloqueados.
        <br />
        <br />
        Caso necessário, você pode <strong>reativar a conta agora</strong> ou
        sair do sistema.
      </p>

      <!-- Ações -->
      <div class="flex flex-col gap-3 sm:flex-row">
        <button
          class="w-full rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          @click="logout"
        >
          Sair da conta
        </button>

        <button
          class="w-full rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          @click="handleReactivate"
        >
          Reativar conta
        </button>
      </div>
    </div>
  </Modal>
</template>

<script>
import { useAuthStore } from '@/modules/auth/store';

import BaseIcon from '@/components/icons/BaseIcon';
import Modal from '@/components/modal/Modal';

export default {
  name: 'AdminBlockAccount',
  components: {
    BaseIcon,
    Modal
  },

  computed: {
    authStore: () => useAuthStore()
  },

  methods: {
    logout() {
      this.authStore.logout();

      this.$router.go();
    },
    handleReactivate() {
      this.axios.post('/users/reactivate').then(() => {
        this.authStore.setBlocked(false);
        this.$router.go();
      });
    }
  }
};
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.96);
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
