<script setup>
import Input from '~/components/Inputs/Input.vue';
import InputContenido from '~/components/Inputs/InputContenido.vue';
import DatosEmpresa from './DatosEmpresa.vue';
</script>

<template>
    <div class="flex flex-col gap-6">
        <DatosEmpresa />

        <div class="flex flex-col bg-white p-4 rounded-2xl gap-4">
            <div>
                <h3 class="text-xl font-semibold">Software</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="ID asignado por la DIAN" name="idDIAN"></Input>
                <InputContenido placeholder="Digite el pin del Software" name="pinSoftware" maxlength="5">
                    <div class="flex text-gray-500">
                        <p>0</p>/<p>5</p>
                    </div>
                </InputContenido>
                <Input placeholder="Introduzca el codigo del Set de Pruebas para habilitacion." name="set"></Input>
            </div>
            <div class="w-full flex justify-end">
                <button class="bg-blue-500 text-white text-sm p-3 rounded-2xl flex items-center gap-3">
                    <i class="fa-solid fa-download"></i>Guardar
                </button>
            </div>
        </div>

        <div class="flex flex-col bg-white p-4 rounded-2xl gap-4">
            <div>
                <h3 class="text-xl font-semibold">Configuracion de nómina electrónica</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="ID Software Nómina" name="idSoftwareNomina"></Input>
                <Input placeholder="Pin Software Nómina" name="pinSoftwareNomina"></Input>
                <Input placeholder="Test Set ID Nómina" name="IdTestNomina"></Input>
            </div>
            <div class="w-full flex justify-end">
                <button class="bg-blue-500 text-white text-sm p-3 rounded-2xl flex items-center gap-3">
                    <i class="fa-solid fa-download"></i>Guardar
                </button>
            </div>
        </div>

        <div class="flex flex-col bg-white p-4 rounded-2xl gap-4">
            <div>
                <h3 class="text-xl font-semibold">Configuracion de documentos equivalentes</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Id Software Documentos Equivalentesa" name="idEquivalentes"></Input>
                <Input placeholder="Pin Software Documentos Equivalentes" name="pinEquivalentes"></Input>
                <Input placeholder="Test Set ID Documentos Equivalentes" name="idTestEquivalentes"></Input>
            </div>
            <div class="w-full flex justify-end">
                <button class="bg-blue-500 text-white text-sm p-3 rounded-2xl flex items-center gap-3">
                    <i class="fa-solid fa-download"></i>Guardar
                </button>
            </div>
        </div>

        <div class="flex flex-col bg-white p-4 rounded-2xl gap-4">
            <div class="justify-self-start">
                <h3 class="text-xl font-semibold text-start">Certificado Digital</h3>
            </div>
            <div class="flex flex-col items-center gap-3">
            <label for="certificado" class="bg-gray-100 md:w-1/2 w-full flex flex-col items-center p-4 py-6">
                <i class="fa-solid fa-cloud-arrow-up text-6xl text-gray-500"></i>
                <p>Sulta tu archivo aqui o <span class="text-blue-400">haz clic para cargar</span></p>
            </label>
            <input type="file" id="certificado" name="certificado" class="hidden"/>
            <Input placeholder="Password Certificado" name="certificado" tamaño="md:w-1/2 w-full"></Input>
            </div>
            <div class="w-full flex justify-end">
                <button class="bg-blue-500 text-white text-sm p-3 rounded-2xl flex items-center gap-3">
                    <i class="fa-solid fa-download"></i>Guardar
                </button>
            </div>
        </div>

    </div>
</template>