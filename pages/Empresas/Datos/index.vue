<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import { useEpsBuilder } from '~/build/Empresa/useEpsBuilder'
import { useProfesionesBuilder } from '~/build/Empresa/useProfesionesBuilder'
import { TablaBuilder } from '~/build/Constructores/ClassTablas';
import { ComponenteBuilder } from '~/build/Constructores/ClassFormulario';

import { useFacturacionStore } from '~/stores/Formularios/empresa/Facturacion';
import { useDatosEPSStore } from '~/stores/Formularios/empresa/EPS';
import { useDatosProfesionStore } from '~/stores/Formularios/empresa/Profesion';
import { secciones } from '~/data/Buttons';
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';

const storeFacturacion = useFacturacionStore();
const storeEPS = useDatosEPSStore();
const storeProfesion = useDatosProfesionStore();
const varView = useVarView();
const { listResoluciones } = storeToRefs(storeFacturacion);

const Resoluciones = ref([]);
const EPSdata = ref([]);
const Profesiones = ref([]);

onMounted(async () => {
    varView.cargando = true
    Resoluciones.value = await listResoluciones.value
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
    permisos: secciones
})

// Construccion de pagina
const pagina = new ComponenteBuilder()
const builderTabla = new TablaBuilder()

const propiedades = pagina
    .setFondo('FondoDefault')
    .setHeaderPage({titulo: 'Datos Asociados a la Empresa', descripcion: 'Registra y configura segun los datos de tu Empresa.'})
    .setEstilos('')
    .setLayout('')
    .setContenedor('w-full flex flex-col gap-3')
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
    // .addComponente('Tabla', builderTabla
    //     .setColumnas([
    //         { titulo: 'nombre', value: 'Nombre', tamaño: 100, ordenar: true },
    //         { titulo: 'codigo', value: 'Codigo', tamaño: 100, ordenar: true },
    //     ])
    //     .setHeaderTabla({ titulo: 'Resoluciones Registradas', color: 'bg-[var(--color-default)] text-white', })
    //     .setDatos(Resoluciones)
    // )
    .build()

console.log(propiedades)
</script>

<template>
    <Pagina :Propiedades="propiedades"/>
</template>