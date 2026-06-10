<template>
  <div
    class="relative z-50"
    aria-labelledby="slide-over-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      :class="
        drawer.open(context) &&
        'fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
      "
      aria-hidden="true"
    ></div>

    <div :class="drawer.open(context) && 'fixed inset-0 overflow-hidden'">
      <div :class="drawer.open(context) && 'absolute inset-0 overflow-hidden'">
        <div
          class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full md:pl-10"
        >
          <div
            :class="[
              'pointer-events-auto relative w-screen  transform transition duration-500 ease-in-out',
              drawer.open(context) ? 'translate-x-0' : 'translate-x-full',
              size()
            ]"
          >
            <div
              class="flex h-full flex-col overflow-y-auto bg-white shadow-xl"
            >
              <div
                class="flex justify-between border-b border-gray-100 px-6 py-4"
              >
                <h2
                  id="slide-over-title"
                  ref="h2"
                  class="text-xl font-semibold leading-10 text-gray-600"
                >
                  {{ drawer.title }}
                </h2>

                <button v-if="exitButton" type="button" @click="exit">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="h-7 w-7"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div class="relative mt-6 flex-1 px-6 sm:px-8">
                <div v-if="drawer.open(context)">
                  <form class="mb-24" @submit.prevent>
                    <slot ref="formSlot" />
                  </form>
                </div>
              </div>

              <div class="fixed bottom-0 flex w-full items-center justify-between border-t border-gray-100 bg-white px-4 py-3">
                <slot name="footer">
                  <button
                    type="button"
                    class="h-10 min-w-24 rounded-md border border-gray-200 px-4 text-sm text-gray-600 transition hover:bg-gray-50"
                    @click="close()"
                  >
                    {{ actionCloseName }}
                  </button>

                  <!-- Modo confirmação dupla (confirmar + cancelar) -->
                  <div v-if="confirmation" class="flex gap-3">
                    <button
                      type="button"
                      :class="[
                        { hidden: typeof onCancel !== 'function' },
                        saving ? 'cursor-not-allowed opacity-50' : 'hover:bg-red-100'
                      ]"
                      class="flex h-10 min-w-24 items-center justify-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-700 transition"
                      :disabled="saving"
                      @click="cancel"
                    >
                      <svg v-if="savingAction === 'cancel'" class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {{ savingAction === 'cancel' ? 'Aguarde...' : cancelLabel }}
                    </button>

                    <button
                      type="button"
                      class="flex h-10 min-w-24 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold text-white transition"
                      :class="[
                        disabled || saving ? 'cursor-not-allowed bg-gray-300' : 'hover:opacity-90',
                        { hidden: typeof onConfirm !== 'function' }
                      ]"
                      :style="!(disabled || saving) ? { background: 'var(--brand-primary)' } : {}"
                      :disabled="disabled || saving"
                      @click="confirm"
                    >
                      <svg v-if="savingAction === 'confirm'" class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {{ savingAction === 'confirm' ? 'Aguarde...' : confirmLabel }}
                    </button>
                  </div>

                  <!-- Modo simples (salvar) -->
                  <div v-else>
                    <button
                      type="button"
                      class="flex h-10 min-w-24 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold text-white transition"
                      :class="[
                        disabled || saving ? 'cursor-not-allowed bg-gray-300' : 'hover:opacity-90',
                        { hidden: typeof onSave !== 'function' }
                      ]"
                      :style="!(disabled || saving) ? { background: 'var(--brand-primary)' } : {}"
                      :disabled="disabled || saving"
                      @click="save"
                    >
                      <svg v-if="saving" class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {{ saving ? 'Salvando...' : confirmLabel }}
                    </button>
                  </div>
                </slot>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useDrawerStore } from '@/components/drawer/store';

export default {
  props: {
    context: {
      type: String,
      required: true
    },
    exitButton: {
      type: Boolean,
      default: true
    },

    /* Callbacks */
    onSave: {
      type: [Function, null],
      required: false
    },
    onClose: {
      type: Function
    },
    onExit: {
      type: Function
    },
    onOpen: {
      type: Function
    },
    onConfirm: {
      type: [Function, null],
      required: false
    },
    onCancel: {
      type: [Function, null],
      required: false
    },

    /* Labels */
    actionButtonName: {
      type: String,
      default: 'Salvar'
    },
    actionCloseName: {
      type: String,
      default: 'Fechar'
    },
    confirmLabel: {
      type: String,
      default: 'Salvar'
    },
    cancelLabel: {
      type: String,
      default: 'Cancelar'
    },

    /* Confirmation */
    confirmation: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return { saving: false, savingAction: null };
  },
  computed: {
    drawer: () => useDrawerStore(),
    isDrawerOpen: self => self.drawer.open(self.context)
  },
  watch: {
    isDrawerOpen(val) {
      if (val) {
        document.body.style.overflow = 'hidden';
        if (this.onOpen) this.onOpen();
      } else {
        document.body.style.overflow = '';
      }
    }
  },
  methods: {
    async save() {
      this.saving = true;
      try {
        if (this.onSave) await this.onSave();
        if (this.drawer.onSave) this.drawer.onSave(this.context);
      } finally {
        this.saving = false;
      }
    },
    async confirm() {
      this.saving = true;
      this.savingAction = 'confirm';
      try {
        if (this.onConfirm) await this.onConfirm();
      } finally {
        this.saving = false;
        this.savingAction = null;
      }
    },
    async cancel() {
      this.saving = true;
      this.savingAction = 'cancel';
      try {
        if (this.onCancel) await this.onCancel();
      } finally {
        this.saving = false;
        this.savingAction = null;
      }
    },
    async close() {
      if (this.onClose) this.onClose();

      if (this.drawer.close) this.drawer.close();
    },
    exit() {
      if (this.onExit) this.onExit();

      this.drawer.close();
    },
    size() {
      let size;

      switch (this.drawer.size) {
        case 'small':
          size = 'max-w-[20rem]';
          break;

        case 'medium':
          size = 'max-w-full md:max-w-[40rem]';
          break;

        case 'large':
          size = 'max-w-full md:max-w-[60rem]';
          break;

        default:
          break;
      }

      return size;
    }
  }
};
</script>
