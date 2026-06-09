<template>
  <div class="overflow-hidden rounded-xl border border-gray-200">
    <!-- Header colapsável (opcional) -->
    <button
      v-if="collapsible"
      type="button"
      class="flex w-full items-center justify-between px-5 py-4 text-left"
      @click="open = !open"
    >
      <div class="flex items-center gap-2.5">
        <BaseIcon name="Calendar" class="!size-4 text-blue-500" />
        <div>
          <p class="text-sm font-semibold text-gray-900">Agenda Pessoal (iCal)</p>
          <p class="text-xs text-gray-500">Suas escalas no Google Calendar, Outlook ou Apple Calendar.</p>
        </div>
      </div>
      <BaseIcon :name="open ? 'ChevronUp' : 'ChevronDown'" class="!size-4 text-gray-400" />
    </button>

    <!-- Header fixo (sem collapse) -->
    <div v-else class="flex items-center gap-2.5 border-b border-gray-100 bg-gray-50 px-5 py-4">
      <BaseIcon name="Calendar" class="!size-4 text-blue-500" />
      <div>
        <p class="text-sm font-semibold text-gray-900">Agenda Pessoal (iCal)</p>
        <p class="text-xs text-gray-500">Suas escalas no Google Calendar, Outlook ou Apple Calendar.</p>
      </div>
    </div>

    <div v-if="!collapsible || open" :class="collapsible ? 'border-t border-gray-100' : ''" class="px-5 pb-5 pt-4 space-y-4">

      <!-- Carregando -->
      <div v-if="loading" class="flex items-center gap-2 text-sm text-gray-400">
        <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        Carregando link da agenda...
      </div>

      <template v-else-if="feedUrl">
        <!-- URL copiável -->
        <div>
          <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">Link do feed</label>
          <div class="flex gap-2">
            <input
              :value="feedUrl"
              readonly
              class="flex-1 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-mono text-gray-700 focus:outline-none select-all"
              @click="e => e.target.select()"
            />
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
              @click="copyUrl"
            >
              <BaseIcon :name="copied ? 'CheckCircle' : 'Clipboard'" class="!size-4" :class="copied ? 'text-green-500' : ''" />
              {{ copied ? 'Copiado!' : 'Copiar' }}
            </button>
          </div>
        </div>

        <!-- Instruções por app -->
        <div class="grid gap-3 sm:grid-cols-3">
          <div class="rounded-md border border-gray-100 bg-gray-50 p-3">
            <p class="mb-1 text-xs font-semibold text-gray-700">Google Calendar</p>
            <p class="text-xs text-gray-500">Outras agendas → <strong>Por URL</strong> → cole o link</p>
          </div>
          <div class="rounded-md border border-gray-100 bg-gray-50 p-3">
            <p class="mb-1 text-xs font-semibold text-gray-700">Outlook / Microsoft</p>
            <p class="text-xs text-gray-500">Adicionar calendário → <strong>Da internet</strong> → cole o link</p>
          </div>
          <div class="rounded-md border border-gray-100 bg-gray-50 p-3">
            <p class="mb-1 text-xs font-semibold text-gray-700">Apple Calendar</p>
            <p class="text-xs text-gray-500">Arquivo → <strong>Nova assinatura</strong> → cole o link</p>
          </div>
        </div>

        <!-- Avisos -->
        <div class="space-y-2">
          <p class="flex items-start gap-1.5 text-xs text-gray-500">
            <BaseIcon name="Clock" class="mt-0.5 !size-3.5 shrink-0 text-gray-400" />
            A agenda sincroniza automaticamente a cada ~1 hora. Para urgências, confira sempre o app.
          </p>
          <p class="flex items-start gap-1.5 text-xs text-amber-600">
            <BaseIcon name="ExclamationTriangle" class="mt-0.5 !size-3.5 shrink-0" />
            Mantenha este link privado — qualquer pessoa com ele pode ver suas escalas.
          </p>
        </div>

        <!-- Gerar novo link -->
        <button
          type="button"
          :disabled="resetting"
          class="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-500 transition hover:border-red-200 hover:text-red-600 disabled:opacity-50"
          @click="reset"
        >
          <BaseIcon name="ArrowPath" class="!size-4" />
          {{ resetting ? 'Gerando...' : 'Gerar novo link (invalida o atual)' }}
        </button>
      </template>

      <div v-else class="text-sm text-gray-400">
        Não foi possível carregar o link da agenda. Tente recarregar a página.
      </div>

    </div>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';

export default {
  name: 'CalendarFeedSettings',
  components: { BaseIcon },
  props: {
    collapsible: { type: Boolean, default: true }
  },
  data() {
    return {
      open:     false,
      feedUrl:  null,
      loading:  false,
      resetting: false,
      copied:   false
    };
  },
  mounted() {
    this.fetch();
  },
  methods: {
    async fetch() {
      this.loading = true;
      try {
        const res = await this.axios.get('/users/calendar_token');
        this.feedUrl = res.feedUrl;
      } catch {
        this.feedUrl = null;
      } finally {
        this.loading = false;
      }
    },
    async reset() {
      this.resetting = true;
      try {
        const res = await this.axios.post('/users/reset_calendar_token');
        this.feedUrl = res.feedUrl;
        this.copied  = false;
      } finally {
        this.resetting = false;
      }
    },
    async copyUrl() {
      try {
        await navigator.clipboard.writeText(this.feedUrl);
        this.copied = true;
        setTimeout(() => { this.copied = false; }, 2500);
      } catch {
        // clipboard não disponível
      }
    }
  }
};
</script>
