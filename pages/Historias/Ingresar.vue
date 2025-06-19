<script setup>
import FormularioWizard from '~/components/Forms/FormularioWizard.vue';
import Input from '../../components/Inputs/Input.vue';
import Select from '~/components/Selects/Select.vue';
import Label from '~/components/Labels/Label.vue';
import Button from '~/components/Buttons/Button.vue';
import Section from '~/components/Forms/Section.vue';
import { ref, onMounted } from "vue";
import { pacientes } from '../data/pacientes.js';
import { useHistoriaClinicaStore } from '~/composables/Formulario/HistoriaClinica';

const historiaClinicaStore = useHistoriaClinicaStore();

const {
    formData,
    traerDatos,
    guardarDatos,
    agregarItem,
    eliminarItem
} = historiaClinicaStore;


// Delcaracionde variables y funciones
const { $swal } = useNuxtApp();
const fechaModificacion = ref('');
const formComplete = ref(false);

// Guardar los datos en localStorage
watch(formData, (newValue) => {
    guardarDatos(newValue);

    if (formData.Paciente.name !== "" && formData.Paciente.type_doc !== "" && formData.Paciente.No_document !== "") {
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
            confirmButtonText: '<a href="/Pacientes/Ingresar">Registrar</a>',
            cancelButton: 'Cancelar',
            cancelButtonColor: '#d33',
            showCancelButton: true
        })
    }
};

</script>

<template>
    <div class="w-full h-full flex flex-col items-center">
        <FormularioWizard class="mt-3" :datos="{
            titulo: 'Datos del paciente',
            tituloFormulario: 'Nueva Historia Clinica',
            botones: [
                { texto: 'Salir', ruta: '/', color: 'bg-gray-500' },
                { texto: 'Siguiente', ruta: formComplete ? '/Historias/Paso2' : '', color: 'bg-blue-500' }
            ],
            formData: formData.value,
            secciones: [
                { numPagina: 1, ruta: '/Historias/Ingresar', color: 'bg-[rgba(0,0,0,0.5)] text-white' },
                { numPagina: 2, ruta: '/Historias/Paso2', color: 'bg-gray-300' },
                { numPagina: 3, ruta: '/Historias/Paso3', color: 'bg-gray-300' }
            ]
        }" tamaño="w-[90%] h-[97%]">

            <Section>
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-user text-blue-500"></i>
                    <Label forLabel="nombre" size="text-sm">Paciente</Label>
                </div>
                <div class="flex gap-2 items-center">
                    <p class="text-xs">{{ fechaModificacion }}</p>
                    <a href="/Pacientes/Modificar" v-if="fechaModificacion">
                        <Button color="bg-[var(--color-green)]"><i class="fa-solid fa-pencil"></i></Button>
                    </a>
                    <a href="/Pacientes/Ingresar">
                        <Button color="bg-blue-500"><i class="fa-solid fa-plus"></i></Button>
                    </a>
                </div>
            </Section>
            <Section>
                <Input v-model="formData.Paciente.name" type="text" id="nombre" name="nombre" list="nombreList"
                    @blur="pacienteExistente" placeholder="Nombre del paciente" tamaño="w-full" />
                <datalist id="nombreList" class="h-[300px]">
                    <option v-for="(paciente, id) in pacientes" :key="id" :value="paciente.nombre">
                        cedula: {{ paciente.documento }}
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
                    :options="[{ text: 'Cedula de ciudadania', value: 'cedula' }, { text: 'Cedula Extranjera', value: 'extranjera' }, { text: 'Tarjeta de Identidad', value: 'TarjetaIdentidad' }]"
                    placeholder="Tipo de documento" tamaño="w-full"></Select>
            </Section>


            <Section styles="mt-3">
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-users text-blue-500"></i>
                    <Label forLabel="tipo" size="text-sm">Acompañante (Opcional)</Label>
                </div>
            </Section>

            <Section>
                <Input v-model="formData.nombreAcompañante" type="text" id="nombreAcompañante" name="nombreAcompañante"
                    placeholder="Nombre completo del acompañante" tamaño="w-full" />
                <Select v-model="formData.parentesco" id="parentesco" name="parentesco"
                    :options="[{ text: 'Padre', value: 'Padre' }, { text: 'Madre', value: 'Madre' }, {text: 'Hijo', value: 'Hijo'}, {text: 'Conyuge', value: 'Conyuge'}, {text: 'Hermano/a', value: 'Hermano/a'}]"
                    placeholder="Seleccione el parentesco" tamaño="w-full"></Select>
            </Section>

        </FormularioWizard>
    </div>
</template>