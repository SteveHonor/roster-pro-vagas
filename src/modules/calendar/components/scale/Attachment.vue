<template>
  <Drawer context="scale-attachment">
    <div
      v-if="eventDayStore.eventDay.event.attachmentsUrls.length"
      class="my-5 w-full"
    >
      <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        <div
          v-for="(url, index) in eventDayStore.eventDay.event.attachmentsUrls"
          :key="index"
          class="group flex flex-col items-center justify-center rounded border border-gray-200 bg-white p-4 transition hover:shadow"
        >
          <div
            class="mb-2 flex h-32 w-full items-center justify-center overflow-hidden rounded bg-gray-50"
          >
            <img
              v-if="isImage(url)"
              :src="url"
              class="max-h-full object-contain"
              alt="Preview"
            />
            <BaseIcon
              v-else
              name="document-text"
              class="h-8 w-8 text-gray-600"
            />
          </div>
          <div class="w-full truncate text-center text-xs text-gray-700">
            {{ decodeURIComponent(url.split('/').pop()) }}
          </div>
          <div class="mt-2 flex gap-2">
            <a
              :href="url"
              target="_blank"
              rel="noopener"
              class="text-xs text-gray-600 hover:text-gray-800"
            >
              Visualizar
            </a>
            <a
              :href="url"
              target="_blank"
              :download="decodeURIComponent(url.split('/').pop())"
              class="text-xs text-gray-500 hover:text-gray-700"
            >
              Baixar
            </a>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <Empty
        title="Nenhum documento"
        description="foi adicionado a este evento"
      />
    </div>
  </Drawer>
</template>

<script>
import Drawer from '@/components/drawer/Drawer';
import BaseIcon from '@/components/icons/BaseIcon';
import Empty from '@/components/empty/Empty';

import { useEventDayStore } from '@/modules/calendar/store/eventDay';

export default {
  components: {
    Drawer,
    BaseIcon,
    Empty
  },
  computed: {
    eventDayStore: () => useEventDayStore()
  },
  methods: {
    extractFileName(url) {
      return url.split('/').pop();
    },
    isImage(url) {
      return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    }
  }
};
</script>
