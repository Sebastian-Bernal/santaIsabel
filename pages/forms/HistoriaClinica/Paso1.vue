<script setup>
import Formulario from '../../components/Forms/Formulario.vue';
import Input from '../../components/Inputs/Input.vue';
import Select from '~/components/Selects/Select.vue';
import Label from '~/components/Labels/Label.vue';
import Button from '~/components/Buttons/Button.vue';
import Section from '~/components/Forms/Section.vue';
import Fondo from '~/components/Fondo.vue'
import { ref, onMounted } from "vue";
import Wizard from '../components/Forms/Wizard.vue';
import { pacientes } from '../data/pacientes.js';
// definePageMeta({
//     layout: 'authentication'
// });

const { formData, traerDatos, guardarDatos, agregarItem, eliminarItem } = useFormData();

// Delcaracionde variables y funciones
const { $swal } = useNuxtApp();
const fechaModificacion = ref('');
const formComplete = ref(false);


// Guardar los datos en localStorage
watch(formData, (newValue) => {
    guardarDatos(newValue);

    if (formData.Paciente.name !== "" && formData.Paciente.type_doc !== "" && formData.Paciente.No_document !== "" && formData.Diagnosticos.at(-1).tipo !== "") {
        formComplete.value = true
    } else {
        formComplete.value = false
    }
}, { deep: true });

onMounted(() => {
    traerDatos();
});


// Funcion para autocompletar el paciente
const pacienteExistente = () => {
    const paciente = pacientes.value.find(
        p => p.nombre.toLowerCase() === formData.Paciente.name.toLowerCase()
    )

    if (paciente) {
        formData.Paciente.type_doc = paciente.tipoDocumento
        formData.Paciente.No_document = paciente.documento
        formData.Paciente.id = paciente.id
        fechaModificacion.value = paciente.fechaModificacion

    } else if (!paciente && formData.Paciente.name !== '') {
        $swal.fire({
            icon: 'warning',
            title: 'Paciente no encontrado',
            text: 'El paciente ingresado no está registrado.',
            confirmButtonColor: '#3085d6',
            confirmButtonText: '<a href="/forms/DatosPacienteNuevo">Registrar</a>',
            cancelButton: 'Cancelar',
            cancelButtonColor: '#d33',
            showCancelButton: true
        })
    }
};

</script>

<template>
    <Fondo>
    <Wizard :secciones="[
        { numPagina: 1, ruta: '/forms/HistoriaClinica/Paso1', color: 'bg-sky-700 text-white' },
        { numPagina: 2, ruta: '/forms/HistoriaClinica/Paso2', color: 'bg-gray-300' },
        { numPagina: 3, ruta: '/forms/HistoriaClinica/Paso3', color: 'bg-gray-300' }
    ]"></Wizard>
    <Formulario :datos="{
        titulo: 'Datos del paciente',
        botones: [
            { texto: 'Salir', ruta: '/', color: 'bg-gray-500' },
            { texto: 'Siguiente', ruta: formComplete ? '/forms/HistoriaClinica/Paso2' : '', color: 'bg-[var(--color-primary)]' }
        ],
        formData: formData.value
    }">

        <Section>
            <Label forLabel="nombre" size="text-sm">Paciente</Label>
            <div class="flex gap-2 items-center">
                <p class="text-xs">{{ fechaModificacion }}</p>
                <nuxt-link to="" v-if="fechaModificacion">
                    <Button color="bg-[var(--color-green)]"><i class="fa-solid fa-pencil"></i></Button>
                </nuxt-link>
                <nuxt-link to="/forms/DatosPacienteNuevo">
                    <Button color="bg-blue-500"><i class="fa-solid fa-plus"></i></Button>
                </nuxt-link>
            </div>
        </Section>
        <Section>
            <Input v-model="formData.Paciente.name" type="text" id="nombre" name="nombre" list="nombreList"
                @blur="pacienteExistente" placeholder="Nombre del paciente" tamaño="w-full" />
            <datalist id="nombreList">
                <option v-for="(paciente, id) in pacientes" :key="id" :value="paciente.nombre">
                </option>
            </datalist>
        </Section>



        <Section styles="flex-col md:flex-row">
            <Input v-model="formData.Paciente.No_document" type="number" id="documentoList" name="documento"
                placeholder="Número de documento" tamaño="w-full" />
            <datalist id="documentoList">
                <option v-for="(paciente, id) in pacientes" :key="id" :value="paciente.documento"></option>
            </datalist>
            <Select v-model="formData.Paciente.type_doc" id="tipoDocumento" name="tipoDocumento"
                :options="[{ text: 'Cedula de ciudadania', value: 'cedula' }, { text: 'Cedula Extranjera', value: 'extranjera' }]"
                placeholder="Tipo de documento" tamaño="w-full"></Select>
        </Section>



        <Section styles="mb-2">
            <Label forLabel="tipo" size="text-sm">Diagnosticos</Label>
            <Button color="bg-blue-500"
                @click="agregarItem('Diagnosticos', { id: '', tipo: '', CIE_10: '', id_paciente: '', rol_attention: '', }, 'tipo')">
                <i class="fa-solid fa-plus"></i>
            </Button>
        </Section>

        <Section styles="flex-col max-h-[100px] overflow-y-auto">
            <div class="w-full flex gap-3 items-center" v-for="(diagnostico, i) in formData.Diagnosticos">
                <Input v-model="diagnostico.tipo" type="text" id="tipo" name="tipo" placeholder="Tipo" tamaño="w-4/5" />
                <Input v-model="diagnostico.CIE_10" type="text" id="cie10" name="cie10" placeholder="CIE-10"
                    tamaño="w-1/5" />
                <i v-if="i > 0" class="fa-solid fa-close text-gray-500" @click="eliminarItem('Diagnosticos', i)"></i>
            </div>
        </Section>

    </Formulario>
    </Fondo>
</template>