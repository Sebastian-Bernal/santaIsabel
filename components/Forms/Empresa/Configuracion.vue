<script setup>
import Input from '~/components/Inputs/Input.vue';
import InputIcon from '~/components/Inputs/InputIcon.vue';
import InputContenido from '~/components/Inputs/InputContenido.vue';
</script>

<template>
    <div class="flex flex-col gap-6">
        <div class="flex flex-col bg-white p-4 rounded-2xl gap-4">
            <div>
                <h3 class="text-xl font-semibold">Datos de la Empresa</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input placeholder="Nombre Comercial" name="nombre"></Input>
                <Input placeholder="Logo" type="file" name="logo"></Input>
                <Input placeholder="Logo login" name="logoLogin"></Input>
                <Input placeholder="JPG firmas facturas" name="firmas"></Input>
            </div>
        </div>

        <div class="flex flex-col bg-white p-4 rounded-2xl gap-4">
            <div>
                <h3 class="text-xl font-semibold">Configuracion de la Empresa</h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Input placeholder="Numero de identificacion" name="IdEmpresa"></Input>
                <Input placeholder="DV" name="DV"></Input>
                <Input placeholder="Registro Mercantil" name="regitroMercantil"></Input>
                <Input placeholder="Direccion" name="direccion"></Input>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Telefono" name="telefono"></Input>
                <Input placeholder="Lenguaje" name="lenguaje"></Input>
                <Input placeholder="Impuesto" name="impuesto"></Input>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Pais" name="pais"></Input>
                <Input placeholder="Tipo de Documento" name="tipodocuemnto"></Input>
                <Input placeholder="Tipo de Operacion" name="tipoOperacion"></Input>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Tipo Entorno" name="tipoEntorno"></Input>
                <Input placeholder="Tipo Moneda" name="tipoMoneda"></Input>
                <Input placeholder="Tipo de Organizacion" name="tipoOrganizacion"></Input>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Input placeholder="Municipio" tipo="municipio" name="municipio"></Input>
                <Input placeholder="Tipo de Responsabilidad" name="tipoResponsabilidad"></Input>
                <Input placeholder="Tipo de Regimen" name="tipoRegimen"></Input>
            </div>
        </div>

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
            <div class="bg-gray-100 md:w-1/2 w-full flex flex-col items-center p-4 py-6">
                <i class="fa-solid fa-cloud-arrow-up text-6xl text-gray-500"></i>
                <p>Sulta tu archivo aqui o <span class="text-blue-400">haz clic para cargar</span></p>
            </div>
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