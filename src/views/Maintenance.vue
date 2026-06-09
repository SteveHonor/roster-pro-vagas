<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 px-4 text-white"
  >
    <div class="max-w-lg space-y-6 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="mx-auto h-20 w-20 text-gray-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-2 4h.01M6.938 4.938a9 9 0 0112.124 0M5.636 6.344a8.963 8.963 0 00-.707 1.061M4.05 9a8.963 8.963 0 000 6m1.586 2.595a8.963 8.963 0 00.707 1.06M6.938 19.062a9 9 0 0110.124 0M18.364 17.656a8.963 8.963 0 00.707-1.06M19.95 15a8.963 8.963 0 000-6m-1.586-2.595a8.963 8.963 0 00-.707-1.06"
        />
      </svg>
      <h1 class="text-4xl font-bold">Roster Pro</h1>
      <h1 class="mb-24 text-lg">
        Gestão de escalas e equipes de forma profissional
      </h1>
      <hr />
      <h1 class="text-4xl font-bold">Estamos em manutenção</h1>
      <p class="text-lg text-gray-200">
        Estamos atualizando nosso site para trazer melhorias e novas
        funcionalidades.
      </p>
      <p class="text-gray-300">
        Voltaremos em breve. Obrigado pela compreensão!
      </p>
    </div>
    <footer class="mt-12 text-sm text-gray-400">
      &copy; {{ currentYear }} Roster Pro. Todos os direitos reservados.
    </footer>
  </div>
</template>

<script>
export default {
  name: 'Maintenance',
  data() {
    return {
      currentYear: new Date().getFullYear()
    };
  }
};
</script>
