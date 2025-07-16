<script setup>
import Input from '~/components/Inputs/Input.vue';
import DatosEmpresa from './DatosEmpresa.vue';
import DatosSoftware from './DatosSoftware.vue';
import CertificadoDigital from './CertificadoDigital.vue';
</script>

<template>
    <div class="flex flex-col gap-6">
        <DatosEmpresa />
        <!-- Dian -->
        <DatosSoftware tabla="Dian" :datos="{titulo: 'Software', inputID: 'ID asignado por la DIAN', inputPin: 'Digite el pin del Software', inputTestID: 'Introduzca el codigo del Set de pruebas para habilitacion'}"/>
        <!-- Nómina -->
        <DatosSoftware tabla="Nomina" :datos="{titulo: 'Configuracion de nómina electrónica', inputID: 'ID Software Nómina', inputPin: 'Pin Software Nómina', inputTestID: 'Test Set ID Nómina'}"/>
        <!-- documentos equivalentes -->
        <DatosSoftware tabla="Equivalentes" :datos="{titulo: 'Configuracion de documentos equivalentes', inputID: 'ID Software Documentos Equivalentes', inputPin: 'Pin Software Docuementos Equivalentes', inputTestID: 'Test Set ID Docuemntos Equivalentes'}"/>

        <CertificadoDigital/>

    </div>
</template>