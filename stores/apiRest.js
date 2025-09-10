import { defineStore } from "pinia";

// Store para loader
export const useApiRest = defineStore('apiRest', {
    state: () => ({
       baseUrl : null,
       data : null
    }),

    actions: {
        async functionCall(opcion) {
            const config = useRuntimeConfig()
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

            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
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
            console.log(url, options)
            try {
                const response = await fetch(url.toString(), options)
                if (response.status === 200 || response.status === 201 || response.status === 204) {
                    const data = await response.json();
                    this.data =  data
                } else{
                    throw new Error(response.message || 'Error en la solicitud')
                }

                return this.data
            } catch (error) {
                console.error('Error en functionCall:', error)
                throw error
            }
        },

    }
})
