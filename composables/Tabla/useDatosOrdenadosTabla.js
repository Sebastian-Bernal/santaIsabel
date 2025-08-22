import { ref, computed } from 'vue';
import { usePaginacion } from './usePaginacion';

const paginaActual = usePaginacion();

export function useOrdenamiento(datos = ref([])) {
    const busqueda = ref('');
    const menorAMayor = ref(true);
    const columnaOrden = ref('');

    const sortedItems = (nombreColumna) => {
        if (columnaOrden.value === nombreColumna) {
            menorAMayor.value = !menorAMayor.value;
        } else {
            columnaOrden.value = nombreColumna;
            menorAMayor.value = true;
        }
    };

    const datosOrdenados = computed(() => {
        let resultado = [...datos.value];

        if (busqueda.value.trim() !== '') {
            const termino = busqueda.value.trim().toLowerCase();
            resultado = resultado.filter(item =>
                Object.values(item).some(valor =>
                    String(valor).toLowerCase().includes(termino)
                )
            );
        }

        if (columnaOrden.value) {
            resultado.sort((a, b) => {
                const valorA = a[columnaOrden.value];
                const valorB = b[columnaOrden.value];
                if (typeof valorA === 'number') {
                    return menorAMayor.value ? valorA - valorB : valorB - valorA;
                } else {
                    return menorAMayor.value
                        ? String(valorA).localeCompare(String(valorB))
                        : String(valorB).localeCompare(String(valorA));
                }
            });
        }

        return resultado;
    });

    return {
        busqueda,
        sortedItems,
        datosOrdenados,
        columnaOrden,
        menorAMayor,
    };
}