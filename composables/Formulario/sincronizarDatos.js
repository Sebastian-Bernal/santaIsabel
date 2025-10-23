import { enviarFormulario } from "~/Core/Empresa/Datos/Eps/POSTEps";
import { enviarFormularioPutEPS } from "~/Core/Empresa/Datos/Eps/PUTEps";
import { enviarFormularioProfesion } from "~/Core/Empresa/Datos/Profesion/POSTProfesion";
import { enviarFormularioPutProfesion } from "~/Core/Empresa/Datos/Profesion/PUTProfesion";
import { enviarFormularioCita } from "~/Core/Usuarios/Cita/POSTCita";
import { enviarFormularioPaciente } from "~/Core/Usuarios/Paciente/POSTPaciente";
import { enviarFormularioPutPaciente } from "~/Core/Usuarios/Paciente/PUTPaciente";
import { enviarFormularioPutMedico } from "~/Core/Usuarios/Profesional/PUTMedico";

async function sincronizarEntidad({
  nombreEntidad,
  claveRelacion = null,
  nombreRelacion = null,
  construirObjeto,
  enviarFuncion,
  actualizarFuncion
}) {
  const store = useIndexedDBStore();

  // 1. Leer registros pendientes de sincronización
  store.almacen = nombreEntidad;
    console.log('almacen sincronizando...', nombreEntidad)
  const registrosPendientes = (await store.leerdatos()).filter(r => r.sincronizado === 0);
    console.log(registrosPendientes)
  if (registrosPendientes.length === 0 || !navigator.onLine) return;

  for (const registro of registrosPendientes) {
    // 2. Obtener datos relacionales si aplica
    let relacion = null;
    if (claveRelacion && nombreRelacion) {
      store.almacen = nombreRelacion;
      relacion = (await store.leerdatos()).find(r => r.id === registro[claveRelacion]);
    }

    // 3. Construir objeto completo
    const objetoCompleto = construirObjeto(registro, relacion);

    // 4. Enviar a la API
    try {
      // await enviarFuncion(objetoCompleto, true);
      if (registro.id && typeof actualizarFuncion === 'function') {
        await actualizarFuncion(objetoCompleto, true);
        console.log(`Registro actualizado: ${registro.id}`);
      } else {
        await enviarFuncion(objetoCompleto, true);
        console.log(`Registro enviado: ${registro.id_temporal}`);
      }

    } catch (error) {
      console.error(`Error al sincronizar ${nombreEntidad} ${registro.id}:`, error);
    }
  }
}

export function iniciarSincronizacionPeriodica(intervalo = 10000) {
  const tareasSincronizacion = [
    {
      nombreEntidad: 'EPS',
      construirObjeto: (registro) => ({
        EPS: {
          id_temporal: registro.id_temporal,
          nombre: registro.nombre,
          codigo: registro.codigo,
          direccion: registro.direccion,
          telefono: registro.telefono,
          email: registro.email,
          website: registro.website
      }
      }),
      enviarFuncion: enviarFormulario,
      actualizarFuncion: enviarFormularioPutEPS
    },
    {
      nombreEntidad: 'Profesion',
      construirObjeto: (registro) => ({
        Profesion: {
          id_temporal: registro.id_temporal,
          nombre: registro.nombre,
          codigo: registro.codigo,
      }
      }),
      enviarFuncion: enviarFormularioProfesion,
      actualizarFuncion: enviarFormularioPutProfesion
    },
    {
      nombreEntidad: 'Cita',
      construirObjeto: (registro) => ({
        Cita: {
          ...registro,
          id_temporal: registro.id_temporal
        }
      }),
      enviarFuncion: enviarFormularioCita,
    },
    {
      nombreEntidad: 'Paciente',
      claveRelacion: 'id_usuario',
      nombreRelacion: 'InformacionUser',
      construirObjeto: (registro, InformacionUser) => ({
        Paciente: {
          ...registro,
          id_temporal: registro.id_temporal
        },
        InformacionUser: {
          ...InformacionUser,
          id_temporal: InformacionUser.id_temporal
        }
      }),
      enviarFuncion: enviarFormularioPaciente,
      actualizarFuncion: enviarFormularioPutPaciente
    },
    {
      nombreEntidad: 'Profesional',
      claveRelacion: 'id_usuario',
      nombreRelacion: 'InformacionUser',
      construirObjeto: (registro, InformacionUser) => ({
        Paciente: {
          ...registro,
          id_temporal: registro.id_temporal
        },
        InformacionUser: {
          ...InformacionUser,
          id_temporal: InformacionUser.id_temporal
        },
        User: {
          correo: InformacionUser.correo
        }
      }),
      enviarFuncion: enviarFormularioCita,
      actualizarFuncion: enviarFormularioPutMedico
    }
    // {
    //   nombreEntidad: 'HistoriaClinica',
    //   construirObjeto: (registro) => ({ ...registro }),
    //   enviarFuncion: enviarHistoriaClinicaAPI
    // },
    // {
    //   nombreEntidad: 'Analisis',
    //   claveRelacion: 'id_historia',
    //   nombreRelacion: 'HistoriaClinica',
    //   construirObjeto: (registro, historia) => ({
    //     ...registro,
    //     historiaClinica: historia
    //   }),
    //   enviarFuncion: enviarAnalisisAPI
    // },
    // {
    //   nombreEntidad: 'Diagnosticos',
    //   claveRelacion: 'id_analisis',
    //   nombreRelacion: 'Analisis',
    //   construirObjeto: (registro, analisis) => ({
    //     ...registro,
    //     analisisRelacionado: analisis
    //   }),
    //   enviarFuncion: enviarDiagnosticoAPI
    // },
    // {
    //   nombreEntidad: 'Antecedentes',
    //   construirObjeto: (registro) => ({ ...registro }),
    //   enviarFuncion: enviarAntecedenteAPI
    // },
    // {
    //   nombreEntidad: 'Enfermedad',
    //   claveRelacion: 'id_analisis',
    //   nombreRelacion: 'Analisis',
    //   construirObjeto: (registro, analisis) => ({
    //     ...registro,
    //     analisisRelacionado: analisis
    //   }),
    //   enviarFuncion: enviarEnfermedadAPI
    // },
    // {
    //   nombreEntidad: 'ExamenFisico',
    //   claveRelacion: 'id_analisis',
    //   nombreRelacion: 'Analisis',
    //   construirObjeto: (registro, analisis) => ({
    //     ...registro,
    //     analisisRelacionado: analisis
    //   }),
    //   enviarFuncion: enviarExamenFisicoAPI
    // },
    // {
    //   nombreEntidad: 'Plan_manejo_medicamentos',
    //   claveRelacion: 'id_analisis',
    //   nombreRelacion: 'Analisis',
    //   construirObjeto: (registro, analisis) => ({
    //     ...registro,
    //     analisisRelacionado: analisis
    //   }),
    //   enviarFuncion: enviarMedicamentoAPI
    // },
    // {
    //   nombreEntidad: 'Plan_manejo_procedimientos',
    //   claveRelacion: 'id_analisis',
    //   nombreRelacion: 'Analisis',
    //   construirObjeto: (registro, analisis) => ({
    //     ...registro,
    //     analisisRelacionado: analisis
    //   }),
    //   enviarFuncion: enviarProcedimientoAPI
    // },
    // {
    //   nombreEntidad: 'Plan_manejo_insumos',
    //   claveRelacion: 'id_analisis',
    //   nombreRelacion: 'Analisis',
    //   construirObjeto: (registro, analisis) => ({
    //     ...registro,
    //     analisisRelacionado: analisis
    //   }),
    //   enviarFuncion: enviarInsumoAPI
    // },
    // {
    //   nombreEntidad: 'Plan_manejo_equipos',
    //   claveRelacion: 'id_analisis',
    //   nombreRelacion: 'Analisis',
    //   construirObjeto: (registro, analisis) => ({
    //     ...registro,
    //     analisisRelacionado: analisis
    //   }),
    //   enviarFuncion: enviarEquipoAPI
    // },
  ];

  setInterval(() => {
    tareasSincronizacion.forEach(async (tarea) => {
      try {
        await sincronizarEntidad(tarea);
      } catch (error) {
        console.error(`Error en sincronización de ${tarea.nombreEntidad}:`, error);
      }
    });
  }, intervalo);
}
