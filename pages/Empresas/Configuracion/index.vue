<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import { useDatosEmpresaBuilder } from '~/build/Empresa/useDatosEmpresaBuilder';
import { useDatosSofwareBuilder } from '~/build/Empresa/useDatosSoftwareBuilder';
import { useDatosNominaBuilder } from '~/build/Empresa/useDatosNominaBuilder';
import { useDatosEquivalentesBuilder } from '~/build/Empresa/useDatosEquivalentesBuilder';
import { ComponenteBuilder } from '~/composables/Formulario/ClassFormulario';


// Formularios Configuracion Empresa
const propiedadesEmpresa = useDatosEmpresaBuilder({
    storeId: 'DatosEmpresa',
    storePinia: 'Empresa'
})

const propiedadesSoftware = useDatosSofwareBuilder({
    storeId: 'DatosSoftware',
    storePinia: 'Software'
})

const propiedadesNomina = useDatosNominaBuilder({
    storeId: 'DatosNomina',
    storePinia: 'Software'
})

const propiedadesEquivalente = useDatosEquivalentesBuilder({
    storeId: 'DatosEquivalentes',
    storePinia: 'Software'
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

console.log(propiedades)
</script>

<template>
    <Pagina :Propiedades="propiedades"/>
</template>