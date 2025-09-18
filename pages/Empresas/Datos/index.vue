<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import { useEpsBuilder } from '~/build/Empresa/useEpsBuilder'
import { useProfesionesBuilder } from '~/build/Empresa/useProfesionesBuilder'
import { TablaBuilder } from '~/build/Constructores/ClassTablas';
import { ComponenteBuilder } from '~/build/Constructores/ClassFormulario';
import { useDatosEPSStore } from '~/stores/Formularios/empresa/EPS';
import { useDatosProfesionStore } from '~/stores/Formularios/empresa/Profesion';
import { secciones } from '~/data/Buttons';
import { mapCampos, mapCamposLimpios } from '~/components/organism/Forms/useFormulario';
import { ref, onMounted } from 'vue';

const storeEPS = useDatosEPSStore();
const storeProfesion = useDatosProfesionStore();
const varView = useVarView();

const EPSdata = ref([]);
const Profesiones = ref([]);

const showModificarProfesion = ref(false)

onMounted(async () => {
    varView.cargando = true
    await storeProfesion.indexDBDatos()
    await storeEPS.indexDBDatos()
    EPSdata.value = await storeEPS.listEPS
    Profesiones.value = await storeProfesion.listProfesion
    varView.cargando = false
});

// Formularios Configuracion Empresa
const propiedadesEPS = useEpsBuilder({
    storeId: 'EPS',
    storePinia: 'EPS',
})

const propiedadesProfesion = useProfesionesBuilder({
    storeId: 'Profesion',
    storePinia: 'Profesion',
    permisos: secciones,
    actualizar: false
})

const propiedadesVerProfesion = useProfesionesBuilder({
    storeId: 'ActualizarProfesion',
    storePinia: 'Profesion',
    permisos: secciones,
    actualizar: true,
    showModificarProfesion: showModificarProfesion,
    cerrar
})

function actualizarProfesion (profesion) {
    mapCampos(profesion, storeProfesion.Formulario)
    storeProfesion.Formulario.Profesion.id = profesion.id
    showModificarProfesion.value = true
}

function cerrar () {
    showModificarProfesion.value = false
    mapCamposLimpios(storeProfesion.Formulario)
}

// Construccion de pagina
const pagina = new ComponenteBuilder()
const builderTabla = new TablaBuilder()

const propiedades = pagina
    .setFondo('FondoDefault')
    .setHeaderPage({titulo: 'Datos Asociados a la Empresa', descripcion: 'Registra y configura segun los datos de tu Empresa.',})
    .setEstilos('')
    .setLayout('')
    .setContenedor('w-full flex flex-col gap-5')
    .addComponente('Form', propiedadesEPS)
    // .addComponente('Tabla', builderTabla
    //     .setColumnas([
    //         { titulo: 'nombre', value: 'Nombre', tamaño: 100, ordenar: true },
    //         { titulo: 'codigo', value: 'Codigo', tamaño: 100, ordenar: true },
    //     ])
    //     .setHeaderTabla({ titulo: 'Resoluciones Registradas', color: 'bg-[var(--color-default)] text-white', })
    //     .setDatos(Resoluciones)
    // )
    .addComponente('Form', propiedadesProfesion)
    .addComponente('Tabla', builderTabla
        .setColumnas([
            { titulo: 'nombre', value: 'Nombre', tamaño: 500, ordenar: true },
            { titulo: 'codigo', value: 'Codigo', tamaño: 200, ordenar: true },
        ])
        .setHeaderTabla({ 
            titulo: 'Profesiones Registradas', 
            color: 'bg-[var(--color-default)] text-white',
            buscador: true, 
            excel: true,  
        })
        .setAcciones({ icons: [{icon: 'ver', action: actualizarProfesion}], botones: true, })
        .setDatos(Profesiones)
    )
    .addComponente('Form', propiedadesVerProfesion)
    .build()

// console.log(propiedades)
</script>

<template>
    <Pagina :Propiedades="propiedades"/>
</template>