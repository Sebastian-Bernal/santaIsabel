<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
import FondoDefault from '~/components/atoms/Fondos/FondoDefault.vue';
import Configuracion from '~/components/Forms/Empresa/Configuracion.vue';

import { useDatosEmpresaBuilder } from '~/build/useDatosEmpresaBuilder';
import { useDatosSofwareBuilder } from '~/build/useDatosSoftwareBuilder';
import { useDatosNominaBuilder } from '~/build/useDatosNominaBuilder';
import { ComponenteBuilder } from '~/composables/Formulario/ClassFormulario';


// Formularios Configuracion Empresa
const propiedadesEmpresa = useDatosEmpresaBuilder({
    storeId: 'DatosEmpresa'
})

const propiedadesSoftware = useDatosSofwareBuilder({
    storeId: 'DatosSoftware'
})

const propiedadesNomina = useDatosNominaBuilder({
    storeId: 'DatosNomina'
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
    .build()

console.log(propiedades)
</script>

<template>
    <Pagina :Propiedades="propiedades"/>
    <fondoDefault>
        <div>
            <div class="flex justify-between items-center mb-8">
                <div>
                    <h2 class="text-2xl font-bold text-gray-700">Configuracion de la Empresa</h2>
                    <p class="text-gray-600 mt-2">Registra y configura segun los datos de tu Empresa.</p>
                </div>
                <div class="flex gap-4">
                    <i class="fa-solid fa-hospital text-2xl text-blue-600"></i>
                </div>
            </div>

            <!-- <Configuracion/> -->
        </div>
    </fondoDefault>
</template>