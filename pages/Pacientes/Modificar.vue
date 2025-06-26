<script setup>
// Componentes 
import Formulario from '~/components/Forms/Formulario.vue';
import Label from '~/components/Labels/Label.vue';
import Input from '~/components/Inputs/Input.vue';
import Section from '~/components/Forms/Section.vue';
import Select from '~/components/Selects/Select.vue';
import ButtonForm from '~/components/Buttons/ButtonForm.vue';
// Data
import { pacientes } from '~/data/pacientes.js';
import { ubicacion } from '../../data/colombia.js'
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente.js';

import { ref, computed, watch, onMounted } from 'vue'

const storePaciente = usePacientesStore();
const modificacionPacienteStore = storePaciente.createForm('ModificarPaciente');

// Importar states y funciones del store
const {
    formData,
    traerDatos,
    guardarDatos,
    limpiar,
    estado,
    mandarFormulario,
} = modificacionPacienteStore;

const formComplete = ref(false);
const { $swal } = useNuxtApp();

// Titulo del formulario
const pacienteAModificar = computed(() => formData.Paciente.name ? formData.Paciente.name : 'Paciente')

// Guardar Datos en el localStorage
watch(formData, (newValue) => {
    guardarDatos(newValue);

    if (formData.Paciente.name !== '' && formData.Paciente.No_docuement !== '') {
        formComplete.value = true
    } else {
        formComplete.value = false
    }
}, { deep: true });

// Traer datos del localStorage
onMounted(() => {
    traerDatos();
});


// Enviar formulario -------------------
const enviarModificarPaciente = async (formData) => {
    event.preventDefault()

    const estado = await mandarFormulario(formData)

    if (estado) {
        await $swal.fire({ title: '¡Se ha enviado correctamente!', icon: 'success' })
        limpiar()
        window.location.href = '/'
    } else {
        $swal.fire({ title: '¡A ocurrido un problema!', icon: 'error' })
    }
};

// Cuidades filtradas por departamento
const ciudades = computed(() => {
    return ubicacion.filter(data => data.departamento === formData.Paciente.departamento)[0].ciudades
}
);

// Autorellenar formulario al seleccionar Paciente
const pacienteExistente = () => {
    const paciente = pacientes.value.find(
        p => p.nombre.toLowerCase() === formData.Paciente.name.toLowerCase()
    )

    if (paciente) {
        formData.Paciente.type_doc = paciente.tipoDocumento
        formData.Paciente.nacimiento = paciente.fechaNacimiento
        formData.Paciente.No_document = paciente.documento
        formData.Paciente.id = paciente.id
        formData.Paciente.genero = paciente.genero
        formData.Paciente.departamento = paciente.departamento
        formData.Paciente.municipio = paciente.municipio
        formData.Paciente.zona = paciente.zona
        formData.Paciente.barrio = paciente.barrio
        formData.Paciente.direccion = paciente.direccion
        formData.Paciente.celular = paciente.celular
        formData.Paciente.telefono = paciente.telefono
        formData.Paciente.Regimen = paciente.Regimen
        formData.Paciente.poblacionVulnerable = paciente.poblacionVulnerable
        formData.Paciente.Tipo = paciente.Tipo
        formData.Paciente.Eps = paciente.eps

    }
};

const validarform = () => {
    if (!formComplete.value) {
        $swal.fire({
            position: "top-end",
            text: "Falta campos por llenar, por favor ingrese valores",
            showConfirmButton: false,
            timer: 1500,
            background: '#d33',
            color: '#fff'
        });
    }
};
</script>

<template>
    <div class="w-full h-full flex flex-col items-center">
        <Formulario class="mt-3" :datos="{
            titulo: 'Modificar informacion de ' + pacienteAModificar,
        }" tamaño="w-[90%] h-[97%]">

            <Section>
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-user text-blue-500"></i>
                    <Label forLabel="nombre" size="text-sm">Paciente</Label>
                </div>
            </Section>

            <Section class="md:flex-row flex-col">
                <Input v-model="formData.Paciente.name" type="text" id="nombre" name="nombre"
                    placeholder="Nombres y Apellidos" tamaño="md:w-4/5 w-full" list="nombreList" @blur="pacienteExistente" />
                <datalist id="nombreList" class="h-[300px]">
                    <option v-for="(paciente, id) in pacientes" :key="id" :value="paciente.nombre">
                        cedula: {{ paciente.documento }}
                    </option>
                </datalist>
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
                    :options="[{ text: 'Masculino', value: 'Masculino' }, { text: 'Femenino', value: 'Femenino' }, { text: 'Otro', value: 'otro' }]"
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
                    :options="[{ text: 'Rural', value: 'Rural' }, { text: 'Urbana', value: 'Urbana' }]"
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

            <div class="w-3/4 flex justify-center items-center gap-3 absolute bottom-[10px] left-auto right-auto">
                <nuxtLink to="/">
                    <ButtonForm color="bg-gray-500"
                        class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                        Cancelar
                    </ButtonForm>
                </nuxtLink>
                <ButtonForm color="bg-blue-500" @click="formComplete ? enviarModificarPaciente(formData) : validarform()"
                        class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                        Registrar
                </ButtonForm>
            </div>

        </Formulario>
    </div>
</template>
