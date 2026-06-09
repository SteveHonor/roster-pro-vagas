<template>
  <div class="mb-4 flex w-full justify-end">
    <button
      class="inline-flex items-center gap-1.5 rounded border border-slate-200 px-3 py-1.5 text-[11px] font-medium text-slate-600 transition hover:bg-slate-50"
      @click="setActive"
    >
      <BaseIcon name="Cog" class="!size-3.5" />
      Editar escala
    </button>
  </div>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';
import { useScaleStore } from '@/modules/calendar/store/scale';

export default {
  name: 'ScalePositionList',
  components: {
    BaseIcon
  },
  computed: {
    scaleStore: () => useScaleStore()
  },
  methods: {
    setActive() {
      this.scaleStore.setPositionActive();
    }
  }
};
</script>
