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