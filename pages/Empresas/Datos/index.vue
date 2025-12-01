<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import { useEpsBuilder } from '~/build/Empresa/useEpsBuilder'
import { useProfesionesBuilder } from '~/build/Empresa/useProfesionesBuilder'
import { useServicioBuilder } from '~/build/Empresa/useServicioBuilder';
import { TablaBuilder } from '~/build/Constructores/TablaBuilder';
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder';
import { useDatosEPSStore } from '~/stores/Formularios/empresa/EPS';
import { useDatosProfesionStore } from '~/stores/Formularios/empresa/Profesion';
import { mapCampos, mapCamposLimpios } from '~/components/organism/Forms/useFormulario';
import { ref, onMounted } from 'vue';
import { enviarFormularioDeleteEPS } from '~/Core/Empresa/Datos/Eps/DELETEEps';
import { useDatosServicioStore } from '~/stores/Formularios/empresa/Servicio';

const storeEPS = useDatosEPSStore();
const storeProfesion = useDatosProfesionStore();
const storeServicio = useDatosServicioStore();
const varView = useVarView();
const notificaciones = useNotificacionesStore();
const apiRest = useApiRest();

const EPSdata = ref([]);
const Profesiones = ref([]);
const Servicios = ref([])
const showNuevaEPS = ref(false)
const showNuevaProfesion = ref(false)
const showNuevoServicio = ref(false)
const showModificarProfesion = ref(false)
const showModificarEPS = ref(false)
const showModificarServicio = ref(false)
const secciones = ref([])
const refresh = ref(1)

async function llamadatos() {
    varView.cargando = true
    EPSdata.value = await storeEPS.listEPS()
    Profesiones.value = await storeProfesion.listProfesiones()
    varView.cargando = false
}

// Refrescar pagina cuando se agrega o modifica Paciente
watch(() => showModificarProfesion.value,
    async (estado) => {
        if(!estado && varView.cambioEnApi){
            await llamadatos();
            refresh.value++;
        }
    }
);

watch(() => showNuevaProfesion.value,
    async (estado) => {
        if(!estado && varView.cambioEnApi){
            await llamadatos();
            refresh.value++;
        }
    }
);

watch(() => showModificarEPS.value,
    async (estado) => {
        if(!estado && varView.cambioEnApi){
            await llamadatos();
            refresh.value++;
        }
    }
);

watch(() => showNuevaEPS.value,
    async (estado) => {
        if(!estado && varView.cambioEnApi){
            await llamadatos();
            refresh.value++;
        }
    }
);

onMounted(async () => {
    varView.cargando = true
    EPSdata.value = await storeEPS.listEPS()
    Profesiones.value = await storeProfesion.listProfesion

    secciones.value = await storeProfesion.listSecciones()
    Servicios.value = await apiRest.getData('Servicio', 'servicios')

    varView.cargando = false
});

watch(() => {
    const seccionesBase = [...secciones.value]; // Copia para iterar sin modificar mientras insertamos

    for (let i = 0; i < seccionesBase.length; i++) {
        const seccion = seccionesBase[i];

        // Verifica si es una sección principal (no una acción)
        const esAccion = /(crear|actualizar|eliminar|leer)$/.test(seccion);
        if (esAccion) continue;

        const permiso = storeProfesion.Formulario.Profesion.permisos.find((s) => s === seccion);

        const acciones = [
            `${seccion} leer`,
            `${seccion} crear`,
            `${seccion} actualizar`,
            `${seccion} eliminar`
        ];

        const yaInsertadas = acciones.every((accion) => secciones.value.includes(accion));

        if (permiso && !yaInsertadas && permiso !== 'Diagnosticos') {
            const index = secciones.value.indexOf(seccion);
            secciones.value.splice(index + 1, 0, ...acciones);
        }

        // Si la sección principal ya no está en el formulario, eliminamos sus acciones
        if (!permiso) {
            secciones.value = secciones.value.filter((item) => {
                return !(acciones.includes(item));
            });
        }
    }
});


// Funciones Actualizar Profesion

function nuevaProfesion() {
    showNuevaProfesion.value = true
}

function actualizarProfesion(profesion) {
    mapCampos(profesion, storeProfesion.Formulario)
    storeProfesion.Formulario.Profesion.id = profesion.id
    storeProfesion.Formulario.Profesion.id_temporal = profesion.id_temporal
    showModificarProfesion.value = true
}

function cerrar() {
    showNuevaProfesion.value = false
    showModificarProfesion.value = false
    mapCamposLimpios(storeProfesion.Formulario)
}

// Funciones actualizar eps

function nuevaEPS() {
    showNuevaEPS.value = true
}

function actualizarEPS(eps) {
    mapCampos(eps, storeEPS.Formulario)
    storeEPS.Formulario.EPS.id = eps.id
    storeEPS.Formulario.EPS.id_temporal = eps.id_temporal
    showModificarEPS.value = true
}

function cerrarEPS() {
    showNuevaEPS.value = false
    showModificarEPS.value = false
    mapCamposLimpios(storeEPS.Formulario)
}

async function eliminarEPS() {
    const EPS = storeEPS.Formulario.EPS
    
    notificaciones.options.icono = 'warning';
    notificaciones.options.titulo = 'Deseas Eliminar EPS?';
    notificaciones.options.html = `Se eliminará la EPS: <span>${EPS.nombre}</span>`;
    notificaciones.options.confirmtext = 'Si, Eliminar'
    notificaciones.options.canceltext = 'Atras'
    const respuestaAlert = await notificaciones.alertRespuesta()
    console.log(respuestaAlert)
    if (respuestaAlert === 'confirmado') {
        const res = await enviarFormularioDeleteEPS(EPS)
        if (res) {
            notificaciones.options.position = 'top-end';
            notificaciones.options.texto = "Eps eliminado con exito.";
            notificaciones.options.background = '#6bc517'
            notificaciones.options.tiempo = 1500
            notificaciones.mensaje()
            notificaciones.options.background = '#d33'
            
            cerrarEPS()
            await llamadatos();
            refresh.value++;
        }
    }
}

// Funciones actualizar Servicio

function nuevoServicio() {
    showNuevoServicio.value = true
}

function actualizarServicio(servicio) {
    mapCampos(servicio, storeServicio.Formulario)
    storeServicio.Formulario.Servicio.id = servicio.id
    storeServicio.Formulario.Servicio.id_temporal = servicio.id_temporal
    showModificarServicio.value = true
}

function cerrarServicio() {
    showNuevoServicio.value = false
    showModificarServicio.value = false
    mapCamposLimpios(storeServicio.Formulario)
}

// Construccion de pagina

const propiedades = computed(() => {
    const pagina = new ComponenteBuilder()
    const builderTablaProfessions = new TablaBuilder()
    const builderTablaEPS = new TablaBuilder()
    const builderTablaServicios = new TablaBuilder()

    // Verifica permisos específicos
    const puedeVer = varView.getPermisos.includes('Datos_view');
    if (!puedeVer) return
    const puedePostEPS = varView.getPermisos.includes('Datos_post');
    const puedePutEPS = varView.getPermisos.includes('Datos_put');
    const puedePostProfesion = varView.getPermisos.includes('Datos_post');
    const puedePutProfesion = varView.getPermisos.includes('Datos_put');
    const puedePostServicio = varView.getPermisos.includes('Datos_post');
    const puedePutServicio = varView.getPermisos.includes('Datos_put');

    // Builders condicionales
    const propiedadesProfesion = puedePostProfesion
        ? useProfesionesBuilder({
            storeId: 'Profesion',
            storePinia: 'Profesion',
            permisos: secciones.value,
            showModificarProfesion: showModificarProfesion,
            actualizar: true,
            showModificarProfesion: showNuevaProfesion,
            cerrar
        })
        : null;

    const propiedadesVerProfesion = puedePutProfesion
        ? useProfesionesBuilder({
            storeId: 'ActualizarProfesion',
            storePinia: 'Profesion',
            permisos: secciones.value,
            actualizar: true,
            showModificarProfesion: showModificarProfesion,
            cerrar
        })
        : null;

    const propiedadesEPS = puedePostEPS
        ? useEpsBuilder({
            storeId: 'EPS',
            storePinia: 'EPS',
            actualizar: true,
            showModificarEPS: showNuevaEPS,
            cerrar: cerrarEPS,
        })
        : null;

    const propiedadesVerEPS = puedePutEPS
        ? useEpsBuilder({
            storeId: 'ActualizarEPS',
            storePinia: 'EPS',
            actualizar: true,
            showModificarEPS: showModificarEPS,
            cerrar: cerrarEPS,
            eliminar: eliminarEPS
        })
        : null;

    const propiedadesServicio = puedePostServicio
        ? useServicioBuilder({
            storeId: 'Servicio',
            storePinia: 'Servicio',
            actualizar: true,
            showModificarServicio: showNuevoServicio,
            cerrar: cerrarServicio,
        })
        : null;

    const propiedadesVerServicio = puedePutServicio
        ? useServicioBuilder({
            storeId: 'ActualizarServicio',
            storePinia: 'Servicio',
            actualizar: true,
            showModificarServicio: showModificarServicio,
            cerrar: cerrarServicio,
        })
        : null;

    // Tabla EPS
    builderTablaEPS
        .setColumnas([
            { titulo: 'nombre', value: 'Nombre', tamaño: 220, ordenar: true },
            { titulo: 'nit', value: 'Nit', tamaño: 100, ordenar: true },
            { titulo: 'codigo', value: 'Codigo', tamaño: 100, ordenar: true },
        ])
        .setHeaderTabla({ titulo: 'EPS Registradas', color: 'bg-[var(--color-default)] text-white', buscador: true, excel: true, accionAgregar: puedePostEPS ? nuevaEPS : null })
        .setDatos(EPSdata);

    if (puedePutEPS) {
        builderTablaEPS.setAcciones({ icons: [{ icon: 'ver', action: actualizarEPS }], botones: true });
    }

    // Tabla Profesiones
    builderTablaProfessions
        .setColumnas([
            { titulo: 'nombre', value: 'Nombre', tamaño: 500, ordenar: true },
            { titulo: 'codigo', value: 'Codigo', tamaño: 200, ordenar: true },
        ])
        .setHeaderTabla({
            titulo: 'Profesiones Registradas',
            color: 'bg-[var(--color-default)] text-white',
            buscador: true,
            excel: true,
            accionAgregar: puedePostProfesion ? nuevaProfesion : null
        })
        .setDatos(Profesiones);

    if (puedePutProfesion) {
        builderTablaProfessions.setAcciones({ icons: [{ icon: 'ver', action: actualizarProfesion }], botones: true });
    }

    // Tabla Profesiones
    builderTablaServicios
        .setColumnas([
            { titulo: 'name', value: 'Nombre', tamaño: 500, ordenar: true },
            { titulo: 'plantilla', value: 'Tipo', tamaño: 200, ordenar: true },
        ])
        .setHeaderTabla({
            titulo: 'Servicios Registrados',
            color: 'bg-[var(--color-default)] text-white',
            buscador: true,
            excel: true,
            accionAgregar: puedePostServicio ? nuevoServicio : null
        })
        .setDatos(Servicios);

    if (puedePutServicio) {
        builderTablaProfessions.setAcciones({ icons: [{ icon: 'ver', action: actualizarServicio }], botones: true });
    }

    // Construcción final
    pagina
        .setFondo('FondoDefault')
        .setHeaderPage({
            titulo: 'Datos Asociados a la Empresa',
            descripcion: 'Registra y configura según los datos de tu Empresa.',
        })
        .setEstilos('')
        .setContenedor('w-full flex flex-col gap-10');

        //EPS
    if (propiedadesEPS) pagina.addComponente('Form', propiedadesEPS);
    pagina.addComponente('Tabla', builderTablaEPS);
    if (propiedadesVerEPS) pagina.addComponente('Form', propiedadesVerEPS);

        //Profesiones
    if (propiedadesProfesion) pagina.addComponente('Form', propiedadesProfesion);
    pagina.addComponente('Tabla', builderTablaProfessions);
    if (propiedadesVerProfesion) pagina.addComponente('Form', propiedadesVerProfesion);

        //Servicios
    if (propiedadesServicio) pagina.addComponente('Form', propiedadesServicio);
    pagina.addComponente('Tabla', builderTablaServicios)
    if (propiedadesVerServicio) pagina.addComponente('Form', propiedadesVerServicio);

    return pagina.build();

})

// console.log(propiedades)
</script>

<template>
    <Pagina :Propiedades="propiedades" :key="refresh" />
</template>