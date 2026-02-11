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
import { CardBuilder } from '~/build/Constructores/CardBuilder';
import { enviarFormularioDeleteProfesion } from '~/Core/Empresa/Datos/Profesion/DELETEProfesion';
import { enviarFormularioDeleteServicio } from '~/Core/Empresa/Datos/Servicio/DeleteServicio';

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
const editarProfesion = ref(false)
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

watch(() => showModificarServicio.value,
    async (estado) => {
        if(!estado && varView.cambioEnApi){
            Servicios.value = await apiRest.getData('Servicio', 'servicios')
            refresh.value++;
        }
    }
);

watch(() => showNuevoServicio.value,
    async (estado) => {
        if(!estado && varView.cambioEnApi){
            Servicios.value = await apiRest.getData('Servicio', 'servicios')
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

// Funciones Actualizar Profesion

function nuevaProfesion() {
    showNuevaProfesion.value = true
}

async function actualizarProfesion(profesion) {
    mapCampos(profesion, storeProfesion.Formulario)
    storeProfesion.Formulario.Profesion.id = profesion.id
    storeProfesion.Formulario.Profesion.id_temporal = profesion.id_temporal
    const permisos = await storeProfesion.traerPermisos(profesion.id)
    storeProfesion.Formulario.Profesion.ListaPacientes = permisos.includes("ListaPacientes")
    storeProfesion.Formulario.Profesion.Diagnosticos_view = permisos.includes("Diagnosticos_view")
    storeProfesion.Formulario.Profesion.permisos = permisos
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

async function eliminarProfesion() {
    const Profesion = storeProfesion.Formulario.Profesion
    
    notificaciones.options.icono = 'warning';
    notificaciones.options.titulo = 'Deseas Eliminar la Profesion?';
    notificaciones.options.html = `Se eliminaran los Profesionales y Citas asociadas.`;
    notificaciones.options.confirmtext = 'Si, Eliminar'
    notificaciones.options.canceltext = 'Atras'
    const respuestaAlert = await notificaciones.alertRespuesta()

    if (respuestaAlert === 'confirmado') {
        const res = await enviarFormularioDeleteProfesion(Profesion)
        if (res) {
            notificaciones.options.position = 'top-end';
            notificaciones.options.texto = "Profesion eliminada con exito.";
            notificaciones.options.background = '#6bc517'
            notificaciones.options.tiempo = 1500
            notificaciones.mensaje()
            notificaciones.options.background = '#d33'
            
            cerrar()
            await llamadatos();
            refresh.value++;
        }
    }
}

async function eliminarServicio() {
    const Servicio = storeServicio.Formulario.Servicio
    
    notificaciones.options.icono = 'warning';
    notificaciones.options.titulo = 'Deseas Eliminar el Servicio?';
    notificaciones.options.html = `Se eliminaran todas las Citas asociadas.`;
    notificaciones.options.confirmtext = 'Si, Eliminar'
    notificaciones.options.canceltext = 'Atras'
    const respuestaAlert = await notificaciones.alertRespuesta()

    if (respuestaAlert === 'confirmado') {
        const res = await enviarFormularioDeleteServicio(Servicio)
        if (res) {
            notificaciones.options.position = 'top-end';
            notificaciones.options.texto = "Servicio eliminado con exito.";
            notificaciones.options.background = '#6bc517'
            notificaciones.options.tiempo = 1500
            notificaciones.mensaje()
            notificaciones.options.background = '#d33'
            
            cerrarServicio()
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
    if (!puedeVer) {
        pagina
            .setFondo('FondoDefault')
            .setEstilos('')
            .setContenedor('w-full')
            .addComponente('Card', new CardBuilder()
                .setCards(
                    [
                        {
                            header: {
                                html: `<div class="flex flex-col items-center justify-center h-full text-gray-500">
                                <i class="fa-solid fa-user-lock text-6xl mb-4"></i>
                                <h2 class="text-lg font-semibold">Acceso restringido</h2>
                                <p class="text-sm text-center">
                                    No tienes permisos para acceder a este módulo.
                                </p>
                                </div>`,
                            },
                        },
                        {

                        },
                        {

                        }
                    ]
                )
                .setcontenedorCards('flex flex-col')
                .setContenedor('w-full')
                .setTamaño('flex sm:flex-row justify-center items-center rounded-lg bg-inherit! border dark:border-gray-700 border-gray-200')
                .setheaderTitle('Administrar Datos de Empresa')
                .setheaderHtml(`<a href="/Home" class="text-base text-blue-500 hover:text-blue-700"><i class="fa-solid fa-angle-left mr-1"></i>Volver al Inicio</a>`)
                .build()
            )
        return pagina.build()
    }
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
            eliminar: false,
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
            eliminar: eliminarProfesion,
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
            actualizar: false,
            showModificarServicio: showNuevoServicio,
            cerrar: cerrarServicio,
            eliminar: false
        })
        : null;

    const propiedadesVerServicio = puedePutServicio
        ? useServicioBuilder({
            storeId: 'ActualizarServicio',
            storePinia: 'Servicio',
            actualizar: true,
            showModificarServicio: showModificarServicio,
            cerrar: cerrarServicio,
            eliminar: eliminarServicio
        })
        : null;

    // Tabla EPS
    builderTablaEPS
        .setColumnas([
            { titulo: 'nit', value: 'Nit', tamaño: 100, ordenar: true },
            { titulo: 'nombre', value: 'Nombre', tamaño: 300, ordenar: true },
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
            { titulo: 'codigo', value: 'Codigo', tamaño: 150, ordenar: true },
            { titulo: 'nombre', value: 'Nombre', tamaño: 350, ordenar: true },
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
            { titulo: 'plantilla', value: 'Tipo', tamaño: 150, ordenar: true },
            { titulo: 'name', value: 'Nombre', tamaño: 800, ordenar: true },
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
        builderTablaServicios.setAcciones({ icons: [{ icon: 'ver', action: actualizarServicio }], botones: true });
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