async function sincronizarEntidad({
  nombreEntidad,
  claveRelacion,
  nombreRelacion,
  construirObjeto,
  enviarFuncion
}) {
  const store = useIndexedDBStore();

  // 1. Leer registros pendientes de sincronización
  store.almacen = nombreEntidad;
  const registrosPendientes = (await store.leerdatos()).filter(r => r.sincronizacion === 0);

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
      await enviarFuncion(objetoCompleto);

      // 5. Marcar como sincronizado
      store.almacen = nombreEntidad;
      await store.actualizardato(registro.id_temporal, {
        ...registro,
        sincronizacion: 1
      });
    } catch (error) {
      console.error(`Error al sincronizar ${nombreEntidad} ${registro.id}:`, error);
    }
  }
}

export async function sincronizarEntidad2({
  nombreEntidad,
  claveRelacion = null,
  nombreRelacion = null,
  construirObjeto,
  enviarFuncion,
  maxIntentos = 3
}) {
  const store = useIndexedDBStore();

  // 1️⃣ Leer registros pendientes
  store.almacen = nombreEntidad;
  const registrosPendientes = (await store.leerdatos()).filter(r =>
    r.sincronizacion === 0 && (r.intentosSync ?? 0) < maxIntentos
  );

  if (registrosPendientes.length === 0 || !navigator.onLine) return;

  for (const registro of registrosPendientes) {
    let relacion = null;

    // 2️⃣ Obtener datos relacionales si aplica
    if (claveRelacion && nombreRelacion) {
      store.almacen = nombreRelacion;
      relacion = (await store.leerdatos()).find(r => r.id === registro[claveRelacion]);
    }

    // 3️⃣ Construir objeto completo
    const objetoCompleto = construirObjeto(registro, relacion);

    // 4️⃣ Enviar a la API
    try {
      await enviarFuncion(objetoCompleto);

      // 5️⃣ Marcar como sincronizado
      store.almacen = nombreEntidad;
      await store.actualizardato(registro.id_temporal, {
        ...registro,
        sincronizacion: 1,
        errorSync: false,
        intentosSync: (registro.intentosSync ?? 0) + 1
      });
    } catch (error) {
      // 6️⃣ Manejo de error
      store.almacen = nombreEntidad;
      await store.actualizardato(registro.id_temporal, {
        ...registro,
        sincronizacion: 0,
        errorSync: true,
        intentosSync: (registro.intentosSync ?? 0) + 1,
        mensajeError: error.message ?? 'Error desconocido'
      });

      // 7️⃣ (Opcional) registrar en tabla de errores
      store.almacen = 'ErroresSync';
      await store.guardardatosID({
        id_temporal: registro.id_temporal,
        tipo: nombreEntidad,
        mensajeError: error.message ?? 'Error desconocido',
        timestamp: new Date().toISOString()
      });
    }
  }
}

export function iniciarSincronizacionPeriodica(intervalo = 60000) {
  const tareasSincronizacion = [
    {
      nombreEntidad: 'HistoriaClinica',
      construirObjeto: (registro) => ({ ...registro }),
      enviarFuncion: enviarHistoriaClinicaAPI
    },
    {
      nombreEntidad: 'Analisis',
      claveRelacion: 'id_historia',
      nombreRelacion: 'HistoriaClinica',
      construirObjeto: (registro, historia) => ({
        ...registro,
        historiaClinica: historia
      }),
      enviarFuncion: enviarAnalisisAPI
    },
    {
      nombreEntidad: 'Diagnosticos',
      claveRelacion: 'id_analisis',
      nombreRelacion: 'Analisis',
      construirObjeto: (registro, analisis) => ({
        ...registro,
        analisisRelacionado: analisis
      }),
      enviarFuncion: enviarDiagnosticoAPI
    },
    {
      nombreEntidad: 'Antecedentes',
      construirObjeto: (registro) => ({ ...registro }),
      enviarFuncion: enviarAntecedenteAPI
    },
    {
      nombreEntidad: 'Enfermedad',
      claveRelacion: 'id_analisis',
      nombreRelacion: 'Analisis',
      construirObjeto: (registro, analisis) => ({
        ...registro,
        analisisRelacionado: analisis
      }),
      enviarFuncion: enviarEnfermedadAPI
    },
    {
      nombreEntidad: 'ExamenFisico',
      claveRelacion: 'id_analisis',
      nombreRelacion: 'Analisis',
      construirObjeto: (registro, analisis) => ({
        ...registro,
        analisisRelacionado: analisis
      }),
      enviarFuncion: enviarExamenFisicoAPI
    },
    {
      nombreEntidad: 'Plan_manejo_medicamentos',
      claveRelacion: 'id_analisis',
      nombreRelacion: 'Analisis',
      construirObjeto: (registro, analisis) => ({
        ...registro,
        analisisRelacionado: analisis
      }),
      enviarFuncion: enviarMedicamentoAPI
    },
    {
      nombreEntidad: 'Plan_manejo_procedimientos',
      claveRelacion: 'id_analisis',
      nombreRelacion: 'Analisis',
      construirObjeto: (registro, analisis) => ({
        ...registro,
        analisisRelacionado: analisis
      }),
      enviarFuncion: enviarProcedimientoAPI
    },
    {
      nombreEntidad: 'Plan_manejo_insumos',
      claveRelacion: 'id_analisis',
      nombreRelacion: 'Analisis',
      construirObjeto: (registro, analisis) => ({
        ...registro,
        analisisRelacionado: analisis
      }),
      enviarFuncion: enviarInsumoAPI
    },
    {
      nombreEntidad: 'Plan_manejo_equipos',
      claveRelacion: 'id_analisis',
      nombreRelacion: 'Analisis',
      construirObjeto: (registro, analisis) => ({
        ...registro,
        analisisRelacionado: analisis
      }),
      enviarFuncion: enviarEquipoAPI
    },
    {
      nombreEntidad: 'Cita',
      claveRelacion: 'id_analisis',
      nombreRelacion: 'Analisis',
      construirObjeto: (registro, analisis) => ({
        ...registro,
        estado: 'Realizada',
        id_examen_fisico: analisis?.id
      }),
      enviarFuncion: enviarCitaAPI
    }
  ];

  //   await sincronizarEntidad({
  //   nombreEntidad: 'EPS',
  //   construirObjeto: (registro) => ({
  //     nombre: registro.nombre,
  //     codigo: registro.codigo,
  //     direccion: registro.direccion,
  //     telefono: registro.telefono,
  //     email: registro.email,
  //     website: registro.website
  //   }),
  //   enviarFuncion: validarYEnviarDatosEPS
  // });

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
