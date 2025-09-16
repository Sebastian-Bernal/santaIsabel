<template>
  <table class="w-full border-collapse border text-sm mb-4">
    <thead>
      <tr>
        <th v-for="col in Propiedades.columnas" :key="col" class="border px-2 py-1 ">
          {{ col }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(fila, i) in Propiedades.filas" :key="i">
        <td v-for="(valor, j) in fila" :key="j" class="border px-2 py-1">
          {{ valor }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
const props = defineProps({
  Propiedades: { type: Object, required: true },
})
</script>
