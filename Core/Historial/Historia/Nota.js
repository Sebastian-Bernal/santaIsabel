import { guardarEnDB } from '../composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

export const enviarNota = async (datos, reintento = false) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = decryptData(localStorage.getItem('token'))
    const varView = useVarView()

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.historiasClinicasNota,
                token: token,
                body: {
                    HistoriaClinica: datos.HistoriaClinica,
                    Nota: datos.Nota,
                    Analisis: datos.Analisis,
                    Diagnosticos: datos.Diagnosticos,
                    Descripcion: datos.Descripcion,
                    Cita: datos.Cita
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {

                varView.propiedadesPDF = {
                    id: respuesta.data.id_analisis,
                    servicio: 'Nota'
                }
                varView.showPDFServicio = true
                return true
            }
        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
        }
    } else {

        try {
            const datosActualizar = {
                Analisis: {
                    historia: datos.HistoriaClinica,
                    nota: datos.nota,
                    diagnosticos: datos.Diagnosticos,
                    motivo: 'Nota Medica',
                    medicamentos: datos.Plan_manejo_medicamentos,
                    descripcion: datos.Nota.Descripcion,
                    cita: datos.Cita,

                    tipoAnalisis: datos.tipoAnalisis,
                    id_medico: datos.Cita.id_medico,
                    id_servicio: datos.Cita.id_servicio,
                    sinconizado: 0
                },
            };
            if (!reintento) {
                await guardarEnDB(JSON.parse(JSON.stringify(datosActualizar)), "HistoriaClinica")
            }
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'No hay internet';
            notificacionesStore.options.texto = 'Datos guardados localmente'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
            return true
        } catch {
            notificacionesStore.options.icono = 'warning'
            notificacionesStore.options.titulo = 'Datos incorrectos';
            notificacionesStore.options.texto = 'No se pudo guardar el formulario'
            notificacionesStore.options.tiempo = 3000
            await notificacionesStore.simple()
        }
    }
};