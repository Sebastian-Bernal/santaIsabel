import { decryptData } from '~/composables/Formulario/crypto';
export const guardarColores = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))
console.log(datos)
    const online = navigator.onLine;
    if (online) {
        try {

            for(let i = 0; i < datos.celdasPintadas.length; i++){
                // mandar a api
                let options = {
                    metodo: 'POST',
                    url: config.public.celdaColors,
                    token: token,
                    body: {
                        fila: datos.celdasPintadas[i].fila,
                        columna: datos.celdasPintadas[i].columna,
                        color: datos.celdasPintadas[i].color,
                        tabla: datos.tabla,
                        id_infoUsuario: datos.id_infoUsuario,
                    }
                }
                
                await api.functionCall(options)

            }

            return true

        } catch (error) {
            console.error('Fallo al enviar.', error);
        }
    } else {
        console.log('error guardando colores')
    }
};