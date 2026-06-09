<template>
  <div class="pb-6">
    <!-- Header -->
    <div class="sticky top-14 z-20 flex h-12 items-center border-b border-slate-100 bg-white px-4">
      <span class="text-sm font-semibold text-slate-800">Minha Agenda</span>
    </div>

    <div class="p-4 space-y-4">
      <!-- Intro card -->
      <div
        class="flex items-start gap-3 rounded-xl p-4"
        :style="{ background: 'var(--brand-primary, #6366f1)' }"
      >
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20">
          <BaseIcon name="Calendar" class="!size-5 text-white" />
        </div>
        <div>
          <p class="text-sm font-bold text-white">Sincronize suas escalas</p>
          <p class="mt-0.5 text-xs leading-relaxed text-white/80">
            Adicione suas escalas ao Google Calendar, Outlook ou Apple Calendar. Atualiza automaticamente.
          </p>
        </div>
      </div>

      <!-- Componente de configuração (sempre aberto) -->
      <CalendarFeedSettings :collapsible="false" />
    </div>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import CalendarFeedSettings from '@/modules/settings/components/CalendarFeedSettings';

export default {
  name: 'MemberAgenda',
  components: { BaseIcon, CalendarFeedSettings }
};
</script>
