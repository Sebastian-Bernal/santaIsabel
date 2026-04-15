import { decryptData } from '~/composables/Formulario/crypto';

export async function guardarCie10(formData) {
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            const metodo = formData.id ? 'PUT' : 'POST';
            const url = formData.id 
                ? `${config.public.cie10}/${formData.id}` 
                : config.public.cie10;
                
            let options = {
                metodo: metodo,
                url: url,
                body: formData,
                token: token
            }
            const respuesta = await api.functionCall(options)
            return true
        } catch (error) {
            console.error('Fallo al guardar', error);
            return { success: false, error: error.message }
        }
    }
    return { success: false, error: 'Sin conexión' }
}
