<script setup>

</script>

<template>
    <div class="paginador px-10">
        <p class="text-sm text-gray-500">
            Registros {{ ultimaPagina - itemsPorPagina + 1 }} al {{ ultimaPagina }}</p>

        <div class="btnsPagina">
            <button class="text-l p-2 text-white" @click="paginaAnterior()">
                <i class="fa-solid fa-caret-left"></i>
            </button>
            <div class="flex gap-2 pagina">
                <h2 v-if="paginaActual > 1">{{ paginaActual - 1 }}</h2>
                <h2 class="bg-[var(--color-gray-200)] px-2 rounded">{{ paginaActual }}</h2>
                <h2 v-if="paginaActual < totalPaginas">{{ paginaActual + 1 }}</h2>
            </div>
            <button class="text-l p-2 text-white" @click="siguientePagina()">
                <i class="fa-solid fa-caret-right"></i>
            </button>
        </div>

        <div class="flex gap-2 items-center">
            <p class="text-sm text-gray-500">Número de registros</p>
            <select name="numRegistros" class="text-black bg-gray-200 rounded-xl p-1"
                v-model.number="itemsPorPagina">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
            </select>
        </div>
    </div>
</template>

<style scoped>
.paginador {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 30px;
    color: var(--color--negro);
}

.btnsPagina {
    display: flex;
    align-items: center;
    gap: 20px;
}

.btnsPagina button {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: linear-gradient(to left, var(--color-negro-rojizo), var(--color-rojo));
}

.pagina {
    color: var(--color-rojo-oscuro);
}
</style>