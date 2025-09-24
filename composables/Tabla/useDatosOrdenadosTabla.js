import { ref, computed } from 'vue';

export function useOrdenamiento(datos = ref([]), columnas = []) {
    const busqueda = ref('');
    const filtros = ref({});
    const menorAMayor = ref(true);
    const columnaOrden = ref('');
    // const indicePorColumna = ref({});

    const sortedItems = (nombreColumna) => {
        if (columnaOrden.value === nombreColumna) {
            menorAMayor.value = !menorAMayor.value;
        } else {
            columnaOrden.value = nombreColumna;
            menorAMayor.value = true;
        }
    };

    const datosOrdenados = computed(() => {
        let resultado = [...unref(datos)];
        // Datos por busqueda Global de datos
        if (busqueda.value.trim() !== '') {
            const termino = busqueda.value.trim().toLowerCase();
            resultado = resultado.filter(item =>
                Object.values(item).some(valor =>
                    String(valor).toLowerCase().includes(termino)
                )
            );
        }
        // Datos por filtros en columnas
        for (const [columna, valorFiltro] of Object.entries(filtros.value)) {
            if (valorFiltro && valorFiltro !== '') {
                resultado = resultado.filter(item =>
                    String(item[columna]).toLowerCase().includes(String(valorFiltro).toLowerCase())
                );
            }
        }
        // Datos menor a mayor - mayor a menor
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

    // Generar ociones por datos no repetidos de columna a filtrar
    const filtrosConOpciones = computed(() => {
        return columnas.map(col => {
            const valoresUnicos = [
                ...new Set(unref(datos).map(d => d[col.columna]).filter(v => v !== null && v !== undefined))
            ];
            return {
                ...col,
                datos: valoresUnicos.map(v => ({ text: v, value: v }))
            };
        });
    });

    return {
        busqueda,
        filtros,
        filtrosConOpciones,
        sortedItems,
        datosOrdenados,
        columnaOrden,
        menorAMayor,
    };
}