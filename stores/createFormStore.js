import { defineStore } from "pinia";
import { accionesFormularios } from './Formularios/accionesFormulario';
import { useNotificacionesStore } from "./notificaciones";

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
                this.formData = JSON.parse(JSON.stringify(estructuraInicial));
            },

            agregarItem(campo, plantilla, campoValidar) {
                const notificaciones = useNotificacionesStore()
                // Función interna para resolver campos anidados desde un string con '.'
                function obtenerCampo(obj, ruta) {
                    return ruta.split('.').reduce((acc, prop) => acc?.[prop], obj);
                }

                const lista = obtenerCampo(this.formData, campo);

                if (lista.length < 1) {
                    lista.push({ ...plantilla });
                    return
                }
                const ultimoValor = lista.at(-1)?.[campoValidar];

                const campoNombre = campo.split('.').at(-1);

                if (!ultimoValor || ultimoValor === '') {
                    notificaciones.options.position = 'top-end'
                    notificaciones.options.texto = `'${campoNombre}' esta vacio, por favor ingrese un valor`
                    notificaciones.options.tiempo = 1500
                    notificaciones.mensaje()
                    return;
                }

                lista.push({ ...plantilla });
            },

            eliminarItem(campo, index) {
                // Función interna para resolver campos anidados desde un string con '.'
                function obtenerCampo(obj, ruta) {
                    return ruta.split('.').reduce((acc, prop) => acc?.[prop], obj);
                }

                const lista = obtenerCampo(this.formData, campo);

                lista.splice(index, 1);
            },

            validarform() {
                const notificaciones = useNotificacionesStore()
                notificaciones.options.position = 'top-end';
                notificaciones.options.texto = "Falta campos por llenar, por favor ingrese valores";
                notificaciones.options.tiempo = 1500
                notificaciones.mensaje()
            },

            async mandarFormulario(data) {
                const notificaciones = useNotificacionesStore()
                const accion = accionesFormularios[storeId];
                if (typeof accion === 'function') {
                    try {
                        const res = await accion(data);
                        if (res) {
                            notificaciones.options.icono = 'success';
                            notificaciones.options.titulo = '¡Se ha enviado correctamente!';
                            notificaciones.options.texto = 'Formulario enviado con exito';
                            notificaciones.options.tiempo = 3000
                            const respuesta = await notificaciones.simple()
                            if (respuesta.isConfirmed || respuesta.dismiss) {
                                this.limpiar();
                                window.location.reload()
                            }
                        } else {
                            notificaciones.options.icono = 'error';
                            notificaciones.options.titulo = '¡A ocurrido un problema!';
                            notificaciones.options.texto = 'No se pudo enviar formulario';
                            notificaciones.options.tiempo = 2000
                            notificaciones.simple()
                        }
                        return res
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