<template>
  <div
    v-if="confirmation.open"
    class="relative z-[1000]"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="fixed inset-0 bg-gray-500/75 transition-opacity"
      aria-hidden="true"
      @click="closeModal"
    ></div>

    <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
      <div
        class="flex min-h-full items-end justify-center text-center sm:items-center sm:p-0 md:p-4"
      >
        <div
          class="relative w-full transform overflow-hidden bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg md:rounded"
        >
          <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div
                class="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full sm:mx-0 sm:size-10"
                :class="`bg-${confirmation.color}-100`"
              >
                <slot name="icon">
                  <BaseIcon
                    :class="`text-${confirmation.color}-600 size-6`"
                    name="exclamation"
                  />
                </slot>
              </div>
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3
                  id="modal-title"
                  class="text-base font-semibold text-gray-900"
                >
                  {{ confirmation.title }}
                </h3>
                <div class="mt-2">
                  <p
                    class="text-sm text-gray-500"
                    v-html="safeDescription"
                  ></p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-100 p-4 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              class="shadow-xs flex w-full justify-center gap-2 rounded px-3 py-2 text-sm font-semibold text-white sm:ml-3 sm:w-auto"
              :disabled="loadingStore.isLoading"
              :class="handleClass"
              @click="confirm()"
            >
              <BaseIcon
                v-if="loadingStore.isLoading"
                name="arrow-path"
                class="h-5 w-5"
                :class="{ 'animate-spin': loadingStore.isLoading }"
              />
              {{ confirmation.confirmText || 'Confirmar' }}
            </button>
            <button
              v-if="confirmation.cancel !== false"
              type="button"
              class="shadow-xs ring-1 ring-gray-300 ring-inset mt-3 inline-flex w-full justify-center rounded bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              @click="() => close()"
            >
              {{ confirmation.cancelText || 'Cancelar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DOMPurify from 'dompurify';
import BaseIcon from '@/components/icons/BaseIcon';
import { useConfirmationStore } from '@/components/confirmation/store';
import { useLoadingStore } from '@/components/loading/store';

export default {
  components: {
    BaseIcon
  },
  computed: {
    confirmation: () => {
      const confirmationStore = useConfirmationStore();

      return confirmationStore.confirmation;
    },
    safeDescription() {
      return DOMPurify.sanitize(this.confirmation.description || '');
    },
    loadingStore: () => useLoadingStore(),
    handleClass() {
      if (this.loadingStore.isLoading) return 'bg-blue-400 cursor-not-allowed';

      return this.confirmation.color
        ? `bg-${this.confirmation.color}-600 hover:bg-${this.confirmation.color}-500`
        : 'bg-blue-600 hover:bg-blue-700';
    }
  },
  watch: {
    'confirmation.open'(val) {
      if (val) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  },
  methods: {
    confirm() {
      this.confirmation.onConfirm();
    },
    close() {
      const confirmationStore = useConfirmationStore();

      if (this.confirmation.onCancel) {
        this.confirmation.onCancel();
      } else {
        confirmationStore.close();
      }
    }
  }
};
</script>
