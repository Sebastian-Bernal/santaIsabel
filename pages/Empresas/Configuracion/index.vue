<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
import { useSoftwareStore } from '~/stores/Formularios/empresa/Software';
import { useSoftwareDEStore } from '~/stores/Formularios/empresa/DocumentosEquivalentes';

import { useDatosEmpresaBuilder } from '~/build/Empresa/useDatosEmpresaBuilder';
import { useDatosSofwareBuilder } from '~/build/Empresa/useDatosSoftwareBuilder';
import { useDatosNominaBuilder } from '~/build/Empresa/useDatosNominaBuilder';
import { useDatosEquivalentesBuilder } from '~/build/Empresa/useDatosEquivalentesBuilder';
import { ComponenteBuilder } from '~/build/Constructores/ClassFormulario';
import { watch } from 'vue';

const pinSoftware = ref(0)
const storeSoftware = useSoftwareStore()

watch(
  () => storeSoftware.Formulario.Software.Dian.pin,
  (nuevoValor) => {
    pinSoftware.value = nuevoValor.length || 0
    console.log(pinSoftware.value)
  }
);



// Formularios Configuracion Empresa
const propiedadesEmpresa = useDatosEmpresaBuilder({
    storeId: 'DatosEmpresa',
    storePinia: 'Empresa'
})

const propiedadesSoftware = useDatosSofwareBuilder({
    storeId: 'DatosSoftware',
    numeroLetras: pinSoftware? pinSoftware.value : 0,
    storePinia: 'Software'
})

const propiedadesNomina = useDatosNominaBuilder({
    storeId: 'DatosNomina',
    storePinia: 'Nomina'
})

const propiedadesEquivalente = useDatosEquivalentesBuilder({
    storeId: 'DatosEquivalentes',
    storePinia: 'DocumentosEquivalentes'
})

// Construccion de pagina
const pagina = new ComponenteBuilder()

const propiedades = pagina
    .setFondo('FondoDefault')
    .setHeaderPage({titulo: 'Configuracion de la Empresa', descripcion: 'Registra y configura segun los datos de tu Empresa.'})
    .setEstilos('')
    .setLayout('')
    .setContenedor('w-full flex flex-col gap-3')
    .addComponente('Form', propiedadesEmpresa)
    .addComponente('Form', propiedadesSoftware)
    .addComponente('Form', propiedadesNomina)
    .addComponente('Form', propiedadesEquivalente)
    .build()

// console.log(propiedades)
</script>

<template>
    <Pagina :Propiedades="propiedades"/>
</template>