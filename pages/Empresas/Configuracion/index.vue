<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import { useDatosEmpresaBuilder } from '~/build/Empresa/useDatosEmpresaBuilder';
import { useDatosSofwareBuilder } from '~/build/Empresa/useDatosSoftwareBuilder';
import { useDatosNominaBuilder } from '~/build/Empresa/useDatosNominaBuilder';
import { useDatosEquivalentesBuilder } from '~/build/Empresa/useDatosEquivalentesBuilder';
import { ComponenteBuilder } from '~/build/Constructores/ClassFormulario';


function mostrarCantidadCaracteres(event) {
    const { name, value } = event.target;
    const cantidad = value.length;

    const contadorDiv = document.getElementById(`contador-${name}`);
    if (contadorDiv) {
        contadorDiv.innerHTML = cantidad > 5 ? `<p style="color: red;">${cantidad}</p>` : `<p>${cantidad}</p>`;
    }
}


// Formularios Configuracion Empresa
const propiedadesEmpresa = useDatosEmpresaBuilder({
    storeId: 'DatosEmpresa',
    storePinia: 'Empresa'
})

const propiedadesSoftware = useDatosSofwareBuilder({
    storeId: 'DatosSoftware',
    mostrarCantidadCaracteres: mostrarCantidadCaracteres,
    storePinia: 'Software'
})

const propiedadesNomina = useDatosNominaBuilder({
    storeId: 'DatosNomina',
    mostrarCantidadCaracteres: mostrarCantidadCaracteres,
    storePinia: 'Nomina'
})

const propiedadesEquivalente = useDatosEquivalentesBuilder({
    storeId: 'DatosEquivalentes',
    mostrarCantidadCaracteres: mostrarCantidadCaracteres,
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