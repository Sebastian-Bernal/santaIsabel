<script setup>
import Formulario from '~/components/Forms/Formulario.vue';
import Label from '~/components/Labels/Label.vue';
import Input from '~/components/Inputs/Input.vue';
import Section from '~/components/Forms/Section.vue';
import Select from '~/components/Selects/Select.vue';
import ButtonForm from '~/components/Buttons/ButtonForm.vue';
import { ubicacion } from '../../../data/colombia.js'
import { ref, computed, watch, onMounted } from 'vue'
import { useNuevoMedicoStore } from '~/stores/Formularios/NuevoMedico.js';

const nuevoMedicoStore = useNuevoMedicoStore(); // Se instancia aquí

// Administrar formulario en localStorage -----------------
const {
    formData,
    traerDatos,
    guardarDatos,
    limpiar,
    estado,
    mandarFormulario
} = nuevoMedicoStore;

const formComplete = ref(false);
const { $swal } = useNuxtApp();

watch(formData, (newValue) => {
    guardarDatos(newValue);

    if (formData.Medico.name !== '' && formData.Medico.No_document !== '') {
        formComplete.value = true
    } else {
        formComplete.value = false
    }
}, { deep: true });

onMounted(() => {
    traerDatos();
});


// Enviar formulario -------------------
const enviarNuevoMedico = async (formData) => {
    event.preventDefault()

    await mandarFormulario(formData)

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
    return ubicacion.filter(data => data.departamento === formData.Medico.departamento)[0].ciudades
}
);

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
            titulo: 'Nuevo Profesional de Medicina',
            botones: [
                { texto: 'Salir', ruta: '/', color: 'bg-gray-500' },
                { texto: 'Registrar', ruta: '', color: 'bg-blue-500', submit: formComplete ? true : false }
            ],
            formStore: 'NuevoMedico',
            action: 'validarYEnviarNuevoMedico'
        }" tamaño="w-[90%] h-[97%]">

            <Section>
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-user text-blue-500"></i>
                    <Label forLabel="nombre" size="text-sm">Medico</Label>
                </div>
            </Section>

            <Section class="md:flex-row flex-col">
                <Input v-model="formData.Medico.name" type="text" id="nombre" name="nombre"
                    placeholder="Nombres y Apellidos" tamaño="md:w-4/5 w-full" />
                <Input v-model="formData.Medico.nacimiento" type="date" id="nacimiento" name="nacimiento"
                    placeholder="Nacimiento" tamaño="md:w-1/5 w-full text-gray-500" />
            </Section>



            <Section class="md:flex-row flex-col">
                <Select v-model="formData.Medico.type_doc" id="tipoDocumento" name="tipoDocumento"
                    :options="[{ text: 'Cedula de ciudadania', value: 'cedula' }, { text: 'Tarjeta de identidad', value: 'ti' }, { text: 'Cedula Extranjera', value: 'extranjera' }, { text: 'RC', value: 'RC' }]"
                    placeholder="Tipo de documento" tamaño="w-full"></Select>
                <Input v-model="formData.Medico.No_document" type="number" id="documento" name="documento"
                    placeholder="Número de documento" tamaño="w-full" />
                <Select v-model="formData.Medico.profesion" id="genero" name="genero"
                    :options="[{ text: 'Medico', value: 'Medico' }, { text: 'Psicologo/a', value: 'Psicologo/a' }, { text: 'Otro', value: 'otro' }]"
                    placeholder="Profesion" tamaño="w-full"></Select>
            </Section>

            <Section styles="mt-3">
                <div class="flex gap-3 items-center">
                    <i class="fa-solid fa-location-dot text-blue-500"></i>
                    <Label forLabel="departamento" size="text-sm">Ubicacion y Contacto</Label>
                </div>
            </Section>
            <Section>
                <Input v-model="formData.Medico.departamento" type="text" id="departamento" name="departamento"
                    placeholder="Departamento" tamaño="md:w-1/3 w-full" list="listDepartamento" />
                <datalist id="listDepartamento" class="bg-white text-black">
                    <option v-for="(data, id) in ubicacion" :key="id" :value="data.departamento">
                        codigo: {{ 0 }}
                    </option>
                </datalist>
                <Input v-model="formData.Medico.municipio" type="text" id="municipio" name="municipio"
                    placeholder="Municipio" tamaño="md:w-1/3 w-full" list="listMunicipio" />
                <datalist id="listMunicipio" v-if="formData.Medico.departamento">
                    <option v-for="(data, id) in ciudades" :key="id" :value="data">
                    </option>
                </datalist>
                <Select v-model="formData.Medico.zona" id="zona" name="zona"
                    :options="[{ text: 'Rural', value: 'rural' }, { text: 'Urbana', value: 'urbana' }]"
                    placeholder="Zona" tamaño="md:w-1/3 w-full"></Select>
            </Section>





            <Section>
                <Input v-model="formData.Medico.celular" type="number" id="celular" name="celular"
                    placeholder="Celular" tamaño="w-1/2" />
                <Input v-model="formData.Medico.telefono" type="number" id="telefono" name="telefono"
                    placeholder="Telefono" tamaño="w-1/2" />
            </Section>

            <div class="w-3/4 flex justify-center items-center gap-3 absolute bottom-[10px] left-auto right-auto">
                <nuxtLink to="/">
                    <ButtonForm color="bg-gray-500"
                        class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                        Cancelar
                    </ButtonForm>
                </nuxtLink>
                <ButtonForm color="bg-blue-500" @click="formComplete ? enviarNuevoMedico(formData) : validarform()"
                        class="md:w-[200px] text-white font-semibold mt-2 py-2 px-4 rounded transition duration-200 cursor-pointer">
                        Registrar
                </ButtonForm>
            </div>

        </Formulario>
    </div>
</template>