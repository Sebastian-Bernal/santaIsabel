import { defineStore } from "pinia";

// Store para loader
export const useApiRest = defineStore('apiRest', {
    state: () => ({
        metodo: '',       // 'GET', 'POST', 'PUT', 'DELETE'
        tabla: '',
        head: {},
        body: {},
        params: {},
        token: ''
    }),
    actions: {
        async functionCall(opcion) {
            const config = useRuntimeConfig()
            const baseUrl = config.public.api // URL API

            if (!this.metodo || !opcion) {
                throw new Error('Debes definir el método y la tabla antes de llamar a functionCall')
            }

            const url = new URL(`${baseUrl}/${opcion}`)

            // Agregar query params si existen
            if (this.metodo === 'GET' && Object.keys(this.params).length > 0) {
                Object.entries(this.params).forEach(([key, value]) => {
                    url.searchParams.append(key, value)
                })
            }

            const headers = {
                'Content-Type': 'application/json',
                ...this.head
            }

            // Agregar token si existe
            if (this.token) {
                headers['Authorization'] = `Bearer ${this.token}`
            }

            const options = {
                method: this.metodo,
                headers
            }

            // Agregar body si es POST o PUT
            if (['POST', 'PUT'].includes(this.metodo)) {
                options.body = JSON.stringify(this.body)
            }

            try {
                const response = await fetch(url.toString(), options)
                const data = await response.json()

                if (response.status === 200 || response.status === 201 || response.status === 204) {
                    console.log('mensaje')
                } else if (!response.ok) {
                    throw new Error(data.message || 'Error en la solicitud')
                }

                return data
            } catch (error) {
                console.error('Error en functionCall:', error)
                throw error
            }
        }

    }
})
