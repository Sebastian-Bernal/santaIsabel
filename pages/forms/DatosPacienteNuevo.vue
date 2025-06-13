<script setup>
import Formulario from '~/components/Forms/Formulario.vue';
import Label from '~/components/Labels/Label.vue';
import Input from '~/components/Inputs/Input.vue';
import Section from '~/components/Forms/Section.vue';
import Select from '~/components/Selects/Select.vue';
import { ubicacion } from '../../data/colombia.js'
import { ref, computed } from 'vue'
definePageMeta({
    layout: 'authentication'
});

const formData = ref({
    nombre: '',
    nacimiento: '',
    tipoDocumento: '',
    documento: '',
    sexo: '',
    direccion: '',
    departamento: 'Valle del Cauca',
    municipio: '',
    zona: '',
    barrio: '',
    celular: '',
    telefono: '',
    Eps: '',
    Regimen: '',
    poblacionVulnerable: '',
    Tipo: ''
});

const ciudades = computed(() => {
    return ubicacion.filter(data => data.departamento === formData.value.departamento)[0].ciudades
}
);
</script>

<template>
    <Formulario :datos="{
        titulo: 'Nuevo paciente',
        botones: [
            { texto: 'Salir', ruta: '/', color: 'bg-gray-500' },
            { texto: 'Registrar', ruta: '', color: 'bg-[var(--color-primary)]', submit: true }
        ],
        formData: formData.value
    }">

        <div class="w-full md:w-4/5">
            <Label forLabel="nombre">Paciente</Label>
        </div>
        
        <Section class="md:flex-row flex-col">
            <Input v-model="formData.nombre" type="text" id="nombre" name="nombre" placeholder="Nombres y Apellidos"
                tamaño="md:w-4/5 w-full" />
            <Input v-model="formData.nacimiento" type="date" id="nacimiento" name="nacimiento" placeholder="Nacimiento"
                tamaño="md:w-1/5 w-full text-gray-500" />
        </Section>



        <Section class="md:flex-row flex-col">
            <Select v-model="formData.tipoDocumento" id="tipoDocumento" name="tipoDocumento"
                :options="[{ text: 'Cedula de ciudadania', value: 'cedula' }, { text: 'Tarjeta de identidad', value: 'ti' }, { text: 'Cedula Extranjera', value: 'extranjera' }, { text: 'RC', value: 'RC' }]"
                placeholder="Tipo de documento" tamaño="w-full"></Select>
            <Input v-model="formData.documento" type="number" id="documento" name="documento"
                placeholder="Número de documento" tamaño="w-full" />
            <Select v-model="formData.genero" id="genero" name="genero"
                :options="[{ text: 'Masculino', value: 'masculino' }, { text: 'Femenino', value: 'femenino' }, { text: 'Otro', value: 'otro' }]"
                placeholder="Genero" tamaño="w-full"></Select>
        </Section>

        <div class="w-full md:w-4/5">
        <Label forLabel="departamento">Direccion y Contacto</Label>
        </div>
        <Section>
            <Input v-model="formData.departamento" type="text" id="departamento" name="departamento"
                placeholder="Departamento" tamaño="md:w-1/3 w-full" list="listDepartamento" />
            <datalist id="listDepartamento" class="bg-white text-black">
                <option v-for="(data, id) in ubicacion" :key="id" :value="data.departamento + ' / ' + '987'">
                </option>
            </datalist>
            <Input v-model="formData.municipio" type="text" id="municipio" name="municipio" placeholder="Municipio"
                tamaño="md:w-1/3 w-full" list="listMunicipio" />
            <datalist id="listMunicipio" v-if="formData.departamento">
                <option v-for="(data, id) in ciudades" :key="id" :value="data + ' / ' + '745'">
                </option>
            </datalist>
            <Select v-model="formData.zona" id="zona" name="zona"
                :options="[{ text: 'Rural', value: 'rural' }, { text: 'Urbana', value: 'urbana' }]" placeholder="Zona"
                tamaño="md:w-1/3 w-full"></Select>
        </Section>



        <Section>
            <Input v-model="formData.barrio" type="text" id="barrio" name="barrio" placeholder="Barrio"
                tamaño="md:w-1/2 w-full" />
            <Input v-model="formData.direccion" type="text" id="direccion" name="direccion" placeholder="Direccion"
                tamaño="md:w-1/2 w-full" />
        </Section>

        <Section>
            <Input v-model="formData.celular" type="number" id="celular" name="celular" placeholder="Celular"
                tamaño="w-1/2" />
            <Input v-model="formData.telefono" type="number" id="telefono" name="telefono" placeholder="Telefono"
                tamaño="w-1/2" />
        </Section>


        <Label forLabel="eps">Datos adicionales</Label>
        <Section class="md:flex items-center gap-3 grid grid-cols-2">
            <Input v-model="formData.eps" type="text" id="eps" name="eps" placeholder="Eps" tamaño="md:w-1/4 w-full" />
            <Input v-model="formData.regimen" type="text" id="regimen" name="regimen" placeholder="Regimen"
                tamaño="md:w-1/4 w-full" />
            <Input v-model="formData.poblacion" type="text" id="poblacion" name="poblacion"
                placeholder="Poblacion vulnerable" tamaño="md:w-1/4 w-full" />
            <Input v-model="formData.tipo" type="text" id="tipo" name="tipo" placeholder="Tipo"
                tamaño="md:w-1/4 w-full" />
        </Section>

    </Formulario>
</template>