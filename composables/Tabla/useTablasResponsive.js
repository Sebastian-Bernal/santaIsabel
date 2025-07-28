import { ref, watchEffect, onMounted, onUnmounted } from 'vue';

export function useColumnasResponsivas(columnas, espacioMargen = 200) {
    const screenWidth = ref(0);
    const columnasVisibles = ref([]);
    const columnasSobrantes = ref([]);
    const collapse = ref(false);

    function updateWidth() {
        screenWidth.value = window.innerWidth;
    }

    onMounted(() => {
        updateWidth();
        window.addEventListener('resize', updateWidth);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', updateWidth);
    });

    watchEffect(() => {
        let acumulado = 0;
        columnasVisibles.value = [];
        columnasSobrantes.value = [];

        const margen = screenWidth.value < 540 ? 150 : espacioMargen;
        columnas.value.forEach(col => {
            acumulado += col.tamaño;
            if (acumulado <= screenWidth.value - margen) {
                columnasVisibles.value.push(col);
            } else {
                columnasSobrantes.value.push(col);
            }
        });

        collapse.value = columnasSobrantes.value.length > 0;
    });

    // Collapse activo
    const activarCollapse = (id) => {
        const collapseElement = document.getElementById(id);

        if (!collapseElement) return;

        collapseElement.classList.toggle('collapseActive');
    };

    return {
        columnasVisibles,
        columnasSobrantes,
        collapse,
        activarCollapse,
        screenWidth,
    };
}