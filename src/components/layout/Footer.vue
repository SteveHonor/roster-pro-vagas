<template>
  <footer class="mb-6 mt-6 hidden md:block border-t border-gray-100 pt-4">
    <router-link to="/" class="mb-3 inline-block">
      <img src="@/assets/roster.png" alt="Roster Pro" class="h-5 w-auto opacity-30" />
    </router-link>

    <div class="space-y-1 text-xs text-gray-400">
      <router-link to="/" class="block hover:text-gray-600 transition-colors">
        rosterpro.com.br © {{ moment().year() }}
      </router-link>
      <router-link to="/politics" class="block hover:text-gray-600 transition-colors">
        Termos e Políticas
      </router-link>
      <div class="flex items-center gap-3 pt-1">
        <a
          href="https://www.instagram.com/rosterpro.app"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1 hover:text-gray-600 transition-colors"
        >
          <BaseIcon name="instagram" class="!size-3.5" />
        </a>
        <a
          href="https://www.facebook.com/people/Roster-Pro/61590467463793/"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1 hover:text-gray-600 transition-colors"
        >
          <BaseIcon name="facebook" class="!size-3.5" />
        </a>
      </div>
    </div>
  </footer>
</template>

<script>
import BaseIcon from '@/components/icons/BaseIcon';

export default {
  components: { BaseIcon }
};
</script>
