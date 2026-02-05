import { ref, computed, watch } from 'vue';
import { nombresMeses } from '~/data/Fechas';

export function useOrdenamiento(datos = ref([]), columnas = [], noBuscarPor = []) {
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
                Object.entries(item).some(([key, valor]) =>
                    !noBuscarPor?.includes(key) &&
                    String(valor).toLowerCase().includes(termino)
                )
            );

        }

        // Datos por filtros en columnas, hash maps
        const filtroFecha = { mes: null, año: null };

        for (const [columna, valorFiltro] of Object.entries(filtros.value)) {
            if (valorFiltro && valorFiltro !== "") {
                const colDef = columnas.find(c => c.columna === columna);
                const columnaReal = colDef?.columnaReal || columna;

                if (colDef?.tipo === 'mes') {
                    filtroFecha.mes = Number(valorFiltro);
                } else if (colDef?.tipo === 'año') {
                    filtroFecha.año = Number(valorFiltro);
                } else {
                    const val = String(valorFiltro).toLowerCase();
                    const indiceCol = indicePorColumna.value[columnaReal];
                    if (indiceCol && indiceCol[val]) {
                        resultado = resultado.filter(item => indiceCol[val].includes(item));
                    } else {
                        resultado = [];
                    }
                }
            }
        }


        // Aplicar filtro combinado de fecha
        if (filtroFecha.mes || filtroFecha.año) {
            resultado = resultado.filter(item => {
                const fecha = new Date(item["fecha"]);
                const mes = fecha.getMonth() + 1;
                const año = fecha.getFullYear();

                if (filtroFecha.mes && filtroFecha.año) {
                    return mes === filtroFecha.mes && año === filtroFecha.año;
                } else if (filtroFecha.mes) {
                    return mes === filtroFecha.mes;
                } else if (filtroFecha.año) {
                    return año === filtroFecha.año;
                }
            });
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
            const columnaReal = col.columnaReal || col.columna;

            if (col.tipo === 'mes') {
                const meses = [
                    { text: 'Enero', value: 1 },
                    { text: 'Febrero', value: 2 },
                    { text: 'Marzo', value: 3 },
                    { text: 'Abril', value: 4 },
                    { text: 'Mayo', value: 5 },
                    { text: 'Junio', value: 6 },
                    { text: 'Julio', value: 7 },
                    { text: 'Agosto', value: 8 },
                    { text: 'Septiembre', value: 9 },
                    { text: 'Octubre', value: 10 },
                    { text: 'Noviembre', value: 11 },
                    { text: 'Diciembre', value: 12 }
                ];
                return { ...col, datos: meses };
            } else if (col.tipo === 'año') {
                const añosUnicos = [
                    ...new Set(
                        unref(datos)
                            .map(d => {
                                const fecha = d[columnaReal];
                                if (!fecha) return null;
                                const parsed = new Date(fecha);
                                return isNaN(parsed) ? null : parsed.getFullYear();
                            })
                            .filter(v => v !== null)
                    )
                ];
                return {
                    ...col,
                    datos: añosUnicos.map(a => ({ text: String(a), value: a }))
                };
            } else {
                const valoresUnicos = [
                    ...new Set(unref(datos).map(d => d[columnaReal]).filter(v => v !== null && v !== undefined))
                ];
                return {
                    ...col,
                    datos: valoresUnicos.map(v => ({ text: v, value: v }))
                };
            }
        });
    });

    const borrarFiltros = () => {
        busqueda.value = ''
        filtros.value = {}
        menorAMayor.value = true;
        columnaOrden.value = '';
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