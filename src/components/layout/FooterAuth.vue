<template>
  <footer class="flex w-full">
    <div
      class="container mx-auto mt-20 flex flex-wrap items-center justify-between space-x-4"
    >
      <router-link to="/" class="z-50">
        <img
          src="@/assets/roster-all-white.png"
          alt="Roster Pro"
          class="w-32"
        />
      </router-link>
      <div class="text-white">
        rosterpro.com.br © {{ moment().year() }}
      </div>
    </div>
  </footer>
</template>

<script>
export default {};
</script>
