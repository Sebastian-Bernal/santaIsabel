<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import { useEpsBuilder } from '~/build/Empresa/useEpsBuilder'
import { useProfesionesBuilder } from '~/build/Empresa/useProfesionesBuilder'
import { TablaBuilder } from '~/build/Constructores/TablaBuilder';
import { ComponenteBuilder } from '~/build/Constructores/ComponentesBuilder';
import { useDatosEPSStore } from '~/stores/Formularios/empresa/EPS';
import { useDatosProfesionStore } from '~/stores/Formularios/empresa/Profesion';
import { mapCampos, mapCamposLimpios } from '~/components/organism/Forms/useFormulario';
import { ref, onMounted } from 'vue';

const storeEPS = useDatosEPSStore();
const storeProfesion = useDatosProfesionStore();
const varView = useVarView();

const EPSdata = ref([]);
const Profesiones = ref([]);
const showNuevaEPS = ref(false)
const showNuevaProfesion = ref(false)
const showModificarProfesion = ref(false)
const showModificarEPS = ref(false)
const secciones = ref([])
const refresh = ref(1)

async function llamadatos() {
    EPSdata.value = await storeEPS.listEPS
    Profesiones.value = await storeProfesion.listProfesion
}

// Refrescar pagina cuando se agrega o modifica Paciente
watch(() => showModificarProfesion.value,
    async () => {
        await llamadatos();
        refresh.value++;
    }
);

watch(() => showNuevaProfesion.value,
    async () => {
        await llamadatos();
        refresh.value++;
    }
);

watch(() => showModificarEPS.value,
    async () => {
        await llamadatos();
        refresh.value++;
    }
);

watch(() => showNuevaEPS.value,
    async () => {
        await llamadatos();
        refresh.value++;
    }
);

onMounted(async () => {
    varView.cargando = true
    EPSdata.value = await storeEPS.listEPS
    Profesiones.value = await storeProfesion.listProfesion
    secciones.value = await storeProfesion.listSecciones()
    varView.cargando = false
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

// Construccion de pagina

const propiedades = computed(() => {
    const pagina = new ComponenteBuilder()
    const builderTablaProfessions = new TablaBuilder()
    const builderTablaEPS = new TablaBuilder()

    // Verifica permisos específicos
    const puedeVer = varView.getPermisos.includes('Datos_view');
    if(!puedeVer) return
    const puedePostEPS = varView.getPermisos.includes('Datos_post');
    const puedePutEPS = varView.getPermisos.includes('Datos_put');
    const puedePostProfesion = varView.getPermisos.includes('Datos_post');
    const puedePutProfesion = varView.getPermisos.includes('Datos_put');

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
            cerrar: cerrarEPS
        })
        : null;

    // Tabla EPS
    builderTablaEPS
        .setColumnas([
            { titulo: 'nombre', value: 'Nombre', tamaño: 100, ordenar: true },
            { titulo: 'direccion', value: 'Direccion', tamaño: 100, ordenar: true },
            { titulo: 'email', value: 'Correo', tamaño: 100, ordenar: true },
            { titulo: 'telefono', value: 'Telefono', tamaño: 100, ordenar: true },
            { titulo: 'codigo', value: 'Codigo', tamaño: 100, ordenar: true },
        ])
        .setHeaderTabla({ titulo: 'EPS Registradas', color: 'bg-[var(--color-default)] text-white', accionAgregar: puedePostEPS ? nuevaEPS : null })
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

    // Construcción final
    pagina
        .setFondo('FondoDefault')
        .setHeaderPage({
            titulo: 'Datos Asociados a la Empresa',
            descripcion: 'Registra y configura según los datos de tu Empresa.',
        })
        .setEstilos('')
        .setLayout('')
        .setContenedor('w-full flex flex-col gap-5');

    if (propiedadesEPS) pagina.addComponente('Form', propiedadesEPS);
    pagina.addComponente('Tabla', builderTablaEPS);
    if (propiedadesVerEPS) pagina.addComponente('Form', propiedadesVerEPS);
    if (propiedadesProfesion) pagina.addComponente('Form', propiedadesProfesion);
    pagina.addComponente('Tabla', builderTablaProfessions);
    if (propiedadesVerProfesion) pagina.addComponente('Form', propiedadesVerProfesion);

    return pagina.build();

})

// console.log(propiedades)
</script>

<template>
    <Pagina :Propiedades="propiedades" :key="refresh" />
</template>