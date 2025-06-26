import { defineStore } from "pinia";
import { accionesFormularios } from './Formularios/accionesFormulario';

// Store para crear cada store de formulario con estructura inicial (/stores/Formularios)
export const createFormStore = (storeId, estructuraInicial) => {
    return defineStore(storeId, {
        state: () => {
            return {
                formData: JSON.parse(JSON.stringify(estructuraInicial)),
                estado: '',
            }
        },

        actions: {
            traerDatos() {
                const datosGuardados = localStorage.getItem(storeId);
                if (datosGuardados) {
                    const data = JSON.parse(datosGuardados);
                    Object.assign(this.formData, data);
                } else {
                    console.log('No hay datos', storeId)
                }
            },

            guardarDatos(newValue) {
                localStorage.setItem(storeId, JSON.stringify(newValue));
            },

            limpiar() {
                localStorage.removeItem(storeId);
            },

            agregarItem(campo, plantilla, campoValidar) {
                const $swal = useNuxtApp()
                const lista = this.formData[campo];
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
            },

            eliminarItem(campo, index) {
                const lista = this.formData[campo];
                if (lista.length > 1) {
                    lista.splice(index, 1);
                } else {
                    console.log(`Debe haber al menos un elemento en '${campo}'.`);
                }
            },

            async mandarFormulario(data) {
                const accion = accionesFormularios[storeId];
                if (typeof accion === 'function') {
                    try {
                        this.estado = await accion(data);
                        return true
                    } catch (err) {
                        this.estado = false;
                        console.error(`Error enviando formulario '${storeId}':`, err);
                    }
                } else {
                    console.warn(`No se encontró función de envío para '${storeId}'`);
                    this.estado = false;
                }
            },


        }
    });
}