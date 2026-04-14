import { decryptData } from '~/composables/Formulario/crypto';

export async function guardarVadecum(formData) {
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))

    const online = navigator.onLine;
    if (online) {
        try {
            const metodo = formData.id ? 'PUT' : 'POST';
            const url = formData.id 
                ? `${config.public.codesVadecum}/${formData.id}` 
                : config.public.codesVadecum;
                
            let options = {
                metodo: metodo,
                url: url,
                body: formData,
                token: token
            }
            const respuesta = await api.functionCall(options)
            return respuesta
        } catch (error) {
            console.error('Fallo al guardar', error);
            return { success: false, error: error.message }
        }
    }
    return { success: false, error: 'Sin conexión' }
}
