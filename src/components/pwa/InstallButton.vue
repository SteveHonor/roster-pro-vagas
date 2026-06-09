<template>
  <div>
    <!-- Android / Chrome -->
    <button
      v-if="canInstall"
      class="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 active:bg-slate-100"
      @click="install"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      Instalar app
    </button>

    <!-- iOS -->
    <button
      v-else-if="isIos && !isInStandaloneMode"
      class="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 active:bg-slate-100"
      @click="showIosModal = true"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
      Instalar app
    </button>

    <!-- iOS install instructions modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div v-if="showIosModal" class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-4" @click.self="showIosModal = false">
          <div class="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <div class="mb-4 flex items-center justify-between">
              <p class="font-bold text-slate-800">Instalar no iPhone</p>
              <button class="rounded-full p-1 text-slate-400 hover:bg-slate-100" @click="showIosModal = false">
                <BaseIcon name="XMark" class="!size-5" />
              </button>
            </div>
            <ol class="space-y-4 text-sm text-slate-600">
              <li class="flex items-center gap-3">
                <span class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">1</span>
                <span>
                  Toque em <strong class="text-slate-800">Compartilhar</strong>
                  <svg class="mx-1 inline-block h-4 w-4 align-middle text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                  </svg>
                  na barra do Safari
                </span>
              </li>
              <li class="flex items-center gap-3">
                <span class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">2</span>
                <span>Role para baixo e toque em <strong class="text-slate-800">Adicionar à Tela de Início</strong></span>
              </li>
              <li class="flex items-center gap-3">
                <span class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">3</span>
                <span>Toque em <strong class="text-slate-800">Adicionar</strong> no canto superior direito</span>
              </li>
            </ol>
            <p class="mt-5 text-xs text-slate-400">O app abrirá em tela cheia, sem barra do browser.</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';

export default {
  components: { BaseIcon },

  data: () => ({
    deferredPrompt: null,
    showIosModal: false
  }),

  computed: {
    isIos() {
      return /iphone|ipad|ipod/i.test(navigator.userAgent);
    },
    isInStandaloneMode() {
      return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    },
    canInstall() {
      return !!this.deferredPrompt;
    }
  },

  mounted() {
    if (window.__pwaPrompt) {
      this.deferredPrompt = window.__pwaPrompt;
    }
    window.addEventListener('beforeinstallprompt', this.onBeforeInstallPrompt);
  },

  beforeUnmount() {
    window.removeEventListener('beforeinstallprompt', this.onBeforeInstallPrompt);
  },

  methods: {
    onBeforeInstallPrompt(e) {
      e.preventDefault();
      this.deferredPrompt = e;
      window.__pwaPrompt = e;
    },

    async install() {
      if (!this.deferredPrompt) return;
      this.deferredPrompt.prompt();
      await this.deferredPrompt.userChoice;
      this.deferredPrompt = null;
      window.__pwaPrompt = null;
    }
  }
};
</script>
