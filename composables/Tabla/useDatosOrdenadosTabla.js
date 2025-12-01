import { ref, computed, watch } from 'vue';

export function useOrdenamiento(datos = ref([]), columnas = []) {
    const busqueda = ref('');
    const filtros = ref({});
    const menorAMayor = ref(true);
    const columnaOrden = ref('');
    const indicePorColumna = ref({});
    const indiceBusquedaGlobal = ref([]);
    const cacheOrdenes = {};

    watch(datos, (nuevosDatos) => {
        // Reindexar cada vez que cambian los datos
        if (!nuevosDatos || nuevosDatos.length === 0) return;

        // Índices hash para filtros categóricos
        const indiceTemp = {};
        const indiceGlobalTemp = {};

        for (const item of nuevosDatos) {
            for (const [col, valor] of Object.entries(item)) {
                if (!indiceTemp[col]) indiceTemp[col] = {};
                const val = String(valor).toLowerCase();
                if (!indiceTemp[col][val]) indiceTemp[col][val] = [];
                indiceTemp[col][val].push(item);

                // --- Índice global (palabras clave) ---
                const palabras = val.split(/\s+/); // separar por espacios
                for (const palabra of palabras) {
                    if (!indiceGlobalTemp[palabra]) indiceGlobalTemp[palabra] = [];
                    indiceGlobalTemp[palabra].push(item);
                }
            }
        }
        indicePorColumna.value = indiceTemp;
        indiceBusquedaGlobal.value = indiceGlobalTemp;

        // Limpiar cache de ordenamientos
        Object.keys(cacheOrdenes).forEach(k => delete cacheOrdenes[k]);
    }, { immediate: true });

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

        // Busqueda global con hash
        // if (busqueda.value.trim() !== "") {
        //     const termino = busqueda.value.trim().toLowerCase();
        //     resultado = indiceBusquedaGlobal.value[termino] || [];
        // }

        // Datos por filtros en columnas, hash maps
        for (const [columna, valorFiltro] of Object.entries(filtros.value)) {
            if (valorFiltro && valorFiltro !== "") {
                const val = String(valorFiltro).toLowerCase();
                const indiceCol = indicePorColumna.value[columna];
                if (indiceCol && indiceCol[val]) {
                    resultado = resultado.filter(item => indiceCol[val].includes(item));
                } else {
                    resultado = [];
                }
            }
        }

        // Datos menor a mayor - mayor a menor con cache
        if (columnaOrden.value) {
            const key = `${columnaOrden.value}_${menorAMayor.value ? "asc" : "desc"}`;
            if (!cacheOrdenes[key]) {
                cacheOrdenes[key] = [...resultado].sort((a, b) => {
                    const valorA = a[columnaOrden.value];
                    const valorB = b[columnaOrden.value];
                    if (typeof valorA === "number" && typeof valorB === "number") {
                        return menorAMayor.value ? valorA - valorB : valorB - valorA;
                    } else {
                        return menorAMayor.value
                            ? String(valorA).localeCompare(String(valorB))
                            : String(valorB).localeCompare(String(valorA));
                    }
                });
            }
            resultado = cacheOrdenes[key];
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

    const borrarFiltros = () => {
        busqueda.value = ''
        filtros.value = {}
    }

    return {
        busqueda,
        filtros,
        filtrosConOpciones,
        sortedItems,
        datosOrdenados,
        columnaOrden,
        menorAMayor,
        borrarFiltros
    };
}