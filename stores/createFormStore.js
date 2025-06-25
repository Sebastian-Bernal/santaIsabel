import { ref } from 'vue';
import { defineStore } from "pinia";
import { accionesFormularios } from './Formularios/accionesFormulario';

// Store para cada formulario con estructura inicial
export const createFormStore = (storeId, estructuraInicial) => {
    return defineStore('FormData', () => {
        const { $swal } = useNuxtApp();
        const formData = ref(JSON.parse(JSON.stringify(estructuraInicial)));
        const estado = ref();

        const traerDatos = () => {
            const datosGuardados = localStorage.getItem(storeId);
            if (datosGuardados) {
                const data = JSON.parse(datosGuardados);
                Object.assign(formData.value, data);
            } else {
                console.log('No hay datos', storeId)
            }
        };

        // Agrega un nuevo ítem a una lista dentro de formData, validando el último campo
        const agregarItem = (campo, plantilla, campoValidar) => {
            const lista = formData.value[campo];
            const ultimoValor = lista.at(-1)?.[campoValidar];

            if (!ultimoValor || ultimoValor === '') {
                $swal.fire({
                    position: "top-end",
                    text: `'${campo}' esta vacio, por favor ingrese un valor`,
                    showConfirmButton: false,
                    timer: 1500,
                    background: '#d33',
                    color: '#fff'
                });
                return;
            }

            lista.push({ ...plantilla });
        };

        // Elimina un ítem de una lista, asegurando que quede al menos uno
        const eliminarItem = (campo, index) => {
            const lista = formData.value[campo];
            if (lista.length > 1) {
                lista.splice(index, 1);
            } else {
                console.log(`Debe haber al menos un elemento en '${campo}'.`);
            }
        };

        const guardarDatos = (newValue) => {
            localStorage.setItem(storeId, JSON.stringify(newValue));
        };

        const limpiar = () => {
            localStorage.removeItem(storeId);
        };

        const mandarFormulario = async (data) => {
            const accion = accionesFormularios[storeId];
            if (typeof accion === 'function') {
                try {
                    estado.value = await accion(data);
                    return true
                } catch (err) {
                    estado.value = false;
                    console.error(`Error enviando formulario '${storeId}':`, err);
                }
            } else {
                console.warn(`No se encontró función de envío para '${storeId}'`);
                estado.value = false;
            }
        };
        
        return {
            formData,
            estado,
            traerDatos,
            guardarDatos,
            agregarItem,
            limpiar,
            eliminarItem,
            mandarFormulario
        }
    });
}