import { decryptData, encryptData } from '~/composables/Formulario/crypto';

export async function verificarAPIPermisos(id) {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(sessionStorage.getItem('token'))

    try {
        // Mandar a API
        let options = {
            metodo: 'POST',
            url: config.public.verificarPermisos,
            token: token,
            body: {
                id_profesional: id,
            }
        }
        const respuesta = await api.functionCall(options)

        if (respuesta.success) {
            // actualizar datos local
            sessionStorage.setItem('permisosTemporales', JSON.stringify(respuesta.data))
            const permisos = useVarView.getPermisos
            permisos.push(respuesta.data.nombre)
            const permisosEncrypt = encryptData(permisos);

            sessionStorage.setItem('Permisos', permisosEncrypt);
            sessionStorage.setItem('permisoSolicitado', false)
            return true
        }
    } catch (error) {
        console.error('Fallo al enviar. Guardando localmente', error);
    }
}