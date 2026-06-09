<template>
  <div>
    <div class="sticky top-0 z-10 flex h-12 items-center border-b border-slate-100 bg-white px-4">
      <router-link
        to="/member/profile"
        class="flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-700"
      >
        <BaseIcon name="ChevronLeft" class="!size-4" />
        Perfil
      </router-link>
      <span class="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-slate-800">
        Notificações
      </span>
    </div>
    <div class="p-4">
      <Notifications />
    </div>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import Notifications from '@/modules/settings/views/Notifications';

export default {
  components: { BaseIcon, Notifications }
};
</script>
