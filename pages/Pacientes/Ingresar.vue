<script setup>
import Formulario from '~/components/Forms/Formulario.vue';
import Label from '~/components/Labels/Label.vue';
import Input from '~/components/Inputs/Input.vue';
import Section from '~/components/Forms/Section.vue';
import Select from '~/components/Selects/Select.vue';
import { ubicacion } from '../../data/colombia.js'
import { ref, computed, watch, onMounted } from 'vue'
import { useNuevoPacienteStore } from '~/composables/Formulario/NuevoPaciente';

const nuevoPacienteStore = useNuevoPacienteStore(); // Se instancia aquí

const {
    formData,
    traerDatos,
    guardarDatos,
} = nuevoPacienteStore;

const formComplete = ref(false);

watch(formData, (newValue) => {
    guardarDatos(newValue);

    if (formData.Paciente.name !== '' && formData.Paciente.No_docuement !== '') {
        formComplete.value = true
    } else {
        formComplete.value = false
    }
}, { deep: true });

onMounted(() => {
    traerDatos();
});

const ciudades = computed(() => {
    return ubicacion.filter(data => data.departamento === formData.Paciente.departamento)[0].ciudades
}
);
</script>

<template>
    <div class="w-full h-full flex flex-col items-center">
        <Formulario :datos="{
            titulo: 'Nuevo paciente',
            botones: [
                { texto: 'Salir', ruta: '/', color: 'bg-gray-500' },
                { texto: 'Registrar', ruta: '', color: 'bg-blue-500', submit: formComplete ? true : false }
            ],
            formStore: 'NuevoPaciente'
        }" tamaño="w-[80%] h-[100%]">

            <Section>
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-user text-blue-500"></i>
                    <Label forLabel="nombre" size="text-sm">Paciente</Label>
                </div>
            </Section>

            <Section class="md:flex-row flex-col">
                <Input v-model="formData.Paciente.name" type="text" id="nombre" name="nombre"
                    placeholder="Nombres y Apellidos" tamaño="md:w-4/5 w-full" />
                <Input v-model="formData.Paciente.nacimiento" type="date" id="nacimiento" name="nacimiento"
                    placeholder="Nacimiento" tamaño="md:w-1/5 w-full text-gray-500" />
            </Section>



            <Section class="md:flex-row flex-col">
                <Select v-model="formData.Paciente.type_doc" id="tipoDocumento" name="tipoDocumento"
                    :options="[{ text: 'Cedula de ciudadania', value: 'cedula' }, { text: 'Tarjeta de identidad', value: 'ti' }, { text: 'Cedula Extranjera', value: 'extranjera' }, { text: 'RC', value: 'RC' }]"
                    placeholder="Tipo de documento" tamaño="w-full"></Select>
                <Input v-model="formData.Paciente.No_document" type="number" id="documento" name="documento"
                    placeholder="Número de documento" tamaño="w-full" />
                <Select v-model="formData.Paciente.genero" id="genero" name="genero"
                    :options="[{ text: 'Masculino', value: 'masculino' }, { text: 'Femenino', value: 'femenino' }, { text: 'Otro', value: 'otro' }]"
                    placeholder="Genero" tamaño="w-full"></Select>
            </Section>

            <Section styles="mt-3">
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-location-dot text-blue-500"></i>
                    <Label forLabel="departamento" size="text-sm">Ubicacion y Contacto</Label>
                </div>
            </Section>
            <Section>
                <Input v-model="formData.Paciente.departamento" type="text" id="departamento" name="departamento"
                    placeholder="Departamento" tamaño="md:w-1/3 w-full" list="listDepartamento" />
                <datalist id="listDepartamento" class="bg-white text-black">
                    <option v-for="(data, id) in ubicacion" :key="id" :value="data.departamento">
                        codigo: {{ 0 }}
                    </option>
                </datalist>
                <Input v-model="formData.Paciente.municipio" type="text" id="municipio" name="municipio"
                    placeholder="Municipio" tamaño="md:w-1/3 w-full" list="listMunicipio" />
                <datalist id="listMunicipio" v-if="formData.Paciente.departamento">
                    <option v-for="(data, id) in ciudades" :key="id" :value="data">
                    </option>
                </datalist>
                <Select v-model="formData.Paciente.zona" id="zona" name="zona"
                    :options="[{ text: 'Rural', value: 'rural' }, { text: 'Urbana', value: 'urbana' }]"
                    placeholder="Zona" tamaño="md:w-1/3 w-full"></Select>
            </Section>



            <Section>
                <Input v-model="formData.Paciente.barrio" type="text" id="barrio" name="barrio" placeholder="Barrio"
                    tamaño="md:w-1/2 w-full" />
                <Input v-model="formData.Paciente.direccion" type="text" id="direccion" name="direccion"
                    placeholder="Direccion" tamaño="md:w-1/2 w-full" />
            </Section>

            <Section>
                <Input v-model="formData.Paciente.celular" type="number" id="celular" name="celular"
                    placeholder="Celular" tamaño="w-1/2" />
                <Input v-model="formData.Paciente.telefono" type="number" id="telefono" name="telefono"
                    placeholder="Telefono" tamaño="w-1/2" />
            </Section>

            <Section styles="mt-3">
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-file text-blue-500"></i>
                    <Label forLabel="eps" size="text-sm">Datos Adicionales</Label>
                </div>
            </Section>
            <Section class="md:flex items-center gap-3 grid grid-cols-2 mb-3">
                <Input v-model="formData.Paciente.Eps" type="text" id="eps" name="eps" placeholder="Eps"
                    tamaño="md:w-1/4 w-full" />
                <Input v-model="formData.Paciente.Regimen" type="text" id="regimen" name="regimen" placeholder="Regimen"
                    tamaño="md:w-1/4 w-full" />
                <Input v-model="formData.Paciente.poblacionVulnerable" type="text" id="poblacion" name="poblacion"
                    placeholder="Poblacion vulnerable" tamaño="md:w-1/4 w-full" />
                <Input v-model="formData.Paciente.Tipo" type="text" id="tipo" name="tipo" placeholder="Tipo"
                    tamaño="md:w-1/4 w-full" />
            </Section>

        </Formulario>
    </div>
</template>