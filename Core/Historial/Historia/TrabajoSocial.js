import { guardarEnDB } from '../composables/Formulario/useIndexedDBManager.js';
import { decryptData } from '~/composables/Formulario/crypto';

export const enviarTrabajoSocial = async (datos, reintento = false) => {
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
                url: config.public.historiasClinicasTrabajoSocial,
                token: token,
                body: {
                    HistoriaClinica: datos.HistoriaClinica,
                    Analisis: datos.Analisis,
                    Diagnosticos: datos.Diagnosticos,
                    Plan_manejo_medicamentos: datos.Plan_manejo_medicamentos,
                    Cita: datos.Cita
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {

                varView.propiedadesPDF = {
                    id: respuesta.Analisis.id,
                    servicio: 'Trabajo Social'
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
                    diagnosticos: datos.Diagnosticos,
                    medicamentos: datos.Plan_manejo_medicamentos,
                    descripcion: datos.Nota.Descripcion,
                    cita: datos.Cita,

                    motivo: datos.Analisis.motivo,
                    observacion: datos.Analisis.observacion,
                    tratamiento: datos.Analisis.tratamiento,
                    analisis: datos.Analisis.analisis,
                    tipoAnalisis: datos.Analisis.tipoAnalisis,
                    id_medico: datos.Analisis.id_medico,
                    id_servicio: datos.Analisis.id_servicio,
                    sinconizado: 0
                }
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