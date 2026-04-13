import { decryptData } from '~/composables/Formulario/crypto';

export async function guardarConvenio(form) {
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))
    console.log(form)
    const online = navigator.onLine;
    if (online) {
        try {
            const metodo = form.id ? 'POST' : 'POST';
            const url = form.id
                ? `${config.public.convenios}/${form.id}`
                : config.public.convenios;

            const formData = new FormData();
            formData.append("nombre", form.nombre);
            form.pacientes_ids.forEach(id => {
            formData.append("pacientes_ids[]", id);
            });


            // Si form.logo es un Blob, conviértelo en File
            if (form.logo) {
                const file = new File([form.logo], "logo.jpg", { type: form.logo.type });
                formData.append("logo", file);
            }


            if (form.id) {
                formData.append("_method", "PUT");
                formData.append("id", form.id);
            }

            let options = {
                metodo: metodo,
                url: url,
                body: formData,
                formData: true,
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
