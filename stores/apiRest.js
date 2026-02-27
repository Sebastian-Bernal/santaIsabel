import { defineStore } from "pinia";
import { decryptData } from "~/composables/Formulario/crypto";
import { consumirPermiso } from "~/Core/Empresa/Datos/Profesion/POSTConsumirPermiso";

// Store para loader
export const useApiRest = defineStore('apiRest', {
    state: () => ({
        baseUrl: null,
        data: null
    }),

    actions: {
        async functionCall(opcion) {
            const notificacionesStore = useNotificacionesStore()
            const config = useRuntimeConfig()
            const varView = useVarView()
            this.baseUrl = config.public.api // URL API


            if (!opcion || !opcion.metodo) {
                throw new Error('Debes definir el método y la tabla antes de llamar a functionCall')
            }

            const url = new URL(`${this.baseUrl}/${opcion.url}`)

            /*  // Agregar query params si existen
              if (opcion.metodo === 'GET' && Object.keys(opcion.params).length > 0) {
                  Object.entries(opcion.params).forEach(([key, value]) => {
                      url.searchParams.append(key, value)
                  })
              }*/
            const empresa = sessionStorage.getItem('Empresa')

            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...(empresa ? { 'X-Company': empresa } : {}),
                ...opcion.head
            }

            // Agregar token si existe
            if (opcion.token) {
                headers['Authorization'] = `Bearer ${opcion.token}`
            }

            const options = {
                method: opcion.metodo,
                headers
            }

            // Agregar body
            if (opcion.body) {
                options.body = JSON.stringify(opcion.body)
            }
            // console.log(url, options)
            try {
                const response = await fetch(url.toString(), options)
                if (response.status === 200 || response.status === 201 || response.status === 204) {
                    const data = await response.json();
                    this.data = data
                } else {
                    let errorData;
                    try {
                        errorData = await response.json();
                    } catch {
                        errorData = { message: 'Error en la solicitud' };
                    }

                    // Asegurarte de que sea string
                    const mensajeCompleto = errorData.message || 'Error en la solicitud';

                    // Cortar hasta el primer paréntesis
                    const mensajeCorto = mensajeCompleto.split('(')[0].trim();


                    console.log('Error response:', errorData);

                    // Validar si es Unauthorized (401) o Forbidden (403)
                    if (response.status === 401 || response.status === 403) {
                        notificacionesStore.options.icono = 'warning';
                        notificacionesStore.options.titulo = 'Inicio de sesión caducado';
                        notificacionesStore.options.texto = 'Vuelve a ingresar';
                        notificacionesStore.options.tiempo = 5000;
                        await notificacionesStore.simple();

                        // Redirigir al login
                        window.location.href = '/';
                        return;
                    }

                    if (opcion.metodo === 'GET') {
                        varView.cargando = false
                        return
                    }

                    // Notificación con el mensaje del backend o fallback
                    notificacionesStore.options.icono = 'warning';
                    notificacionesStore.options.titulo = '¡Ha ocurrido un problema!';
                    notificacionesStore.options.texto = mensajeCorto;
                    notificacionesStore.options.tiempo = 5000;
                    notificacionesStore.simple();

                    throw new Error(errorData.message || 'Error en la solicitud');

                }

                return this.data
            } catch (error) {
                console.error('Error en functionCall:', error);
                varView.cargando = false
                // Notificación genérica si algo falla fuera del bloque anterior
                // notificacionesStore.options.icono = 'warning';
                // notificacionesStore.options.titulo = '¡Ha ocurrido un problema!';
                // notificacionesStore.options.texto = error.message || 'No se pudo enviar formulario, intenta de nuevo en un momento';
                // notificacionesStore.options.tiempo = 3000;
                // notificacionesStore.simple();

                throw error;

            }
        },

        async getData(almacen, nombre, time = true) {
            let datos = [];
            const varView = useVarView()
            const token = decryptData(sessionStorage.getItem('token'));
            const config = useRuntimeConfig()

            if (navigator.onLine) {
                try {
                    const options = {
                        metodo: 'GET',
                        url: config.public[nombre],
                        token: token
                    };

                    let respuesta
                    if (time) {
                        // Promesa de timeout
                        const timeout = new Promise((_, reject) =>
                            setTimeout(() => reject(new Error("Timeout")), 10000) // 10 segundos
                        );

                        // Correr la llamada y el timeout en paralelo
                        respuesta = await Promise.race([
                            this.functionCall(options),
                            timeout
                        ]);
                    } else {
                        respuesta = await this.functionCall(options);
                    }

                    if (respuesta?.success && Array.isArray(respuesta.data)) {
                        datos = await respuesta.data;
                        // guardar en IndexedDB para uso offline
                        if (almacen !== '') {
                            const store = useIndexedDBStore();
                            store.almacen = almacen;
                            await store.bulkPut(datos)
                        };
                        // for (const item of datos) {
                        //     await store.actualiza({ ...item })
                        // };
                    }

                } catch (error) {
                    console.error("Error al obtener datos desde la API:", error);
                    console.error("Fallo:", almacen)
                    datos = await this.getOfflineData(almacen);
                }
            } else {
                datos = await this.getOfflineData(almacen);
            }

            varView.cargando = false
            varView.cambioEnApi = false
            return datos;
        },

        async getOfflineData(almacen) {
            const store = useIndexedDBStore();
            store.almacen = almacen;
            const todosLosDatos = await store.leerdatos();
            return todosLosDatos
        },
    }
})
