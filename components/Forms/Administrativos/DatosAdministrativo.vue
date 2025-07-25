<script setup>
// Componentes
import Label from "~/components/Labels/Label.vue";
import Input from "~/components/Inputs/Input.vue";
import Section from "~/components/Forms/Section.vue";
import Select from "~/components/Selects/Select.vue";
// Data
import { useVarView } from "../../stores/varview.js";
import { watch, onMounted } from "vue";

const varView = useVarView();

const props = defineProps([
    'formData',
    'traerDatos',
    'guardarDatos',
    'agregarItem',
    'eliminarItem',
    'noCambiar',
    'verAdministrativo'
]);

const camposRequeridos = [
        'name',
        'No_document',
        'celular',
        'Tipo',
];

// Guardar Datos en el localStorage
watch(
    props.formData,
    (newValue) => {
        props.guardarDatos(newValue);
        const Administrativo = newValue.Administrativo;
        // Validacion
        const camposValidos = camposRequeridos.every((campo) => Administrativo[campo] !== '');
        // Detectar inputs inválidos
        const hayCamposInvalidos = document.querySelectorAll('input:invalid').length > 0;
        varView.formComplete = camposValidos && !hayCamposInvalidos;
    },
    { deep: true }
);

// Traer datos del localStorage
onMounted(() => {
    props.traerDatos();
});
</script>

<template>
    <Section>
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-user text-blue-500"></i>
            <Label forLabel="nombre" size="text-sm">Administrativo</Label>
        </div>
    </Section>

    <Section styles="md:flex-row flex-col">
        <Input :disabled="props.verAdministrativo" v-model="props.formData.Administrativo.name" type="text" id="nombre"
            name="nombre" placeholder="Nombres y Apellidos" tamaño="w-full" minlength="5" />
    </Section>

    <Section styles="md:flex-row flex-col">
        <Select :disabled="props.verAdministrativo" v-model="props.formData.Administrativo.Tipo" id="tipo"
            name="tipo" :options="[
                { text: 'Caja', value: 'Caja' },
                { text: 'Gerente', value: 'Gerente' },
            ]" placeholder="Tipo" tamaño="w-full"></Select>
        <Input v-if="!props.noCambiar" :disabled="props.verAdministrativo" v-model="props.formData.Administrativo.No_document"
            type="number" id="documento" name="documento" placeholder="Número de documento" tamaño="w-full" max="10000000000" min="1000000" />
    </Section>

    <Section styles="mt-3">
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-phone text-blue-500"></i>
            <Label forLabel="departamento" size="text-sm">Contacto</Label>
        </div>
    </Section>


    <Section styles="md:flex-row flex-col">
        <Input :disabled="props.verAdministrativo" v-model="props.formData.Administrativo.celular" type="number" id="celular"
            name="celular" placeholder="Celular" tamaño="md:w-1/2 w-full" max="1000000000000" min="1000000000"/>
        <Input :disabled="props.verAdministrativo" v-model="props.formData.Administrativo.telefono" type="number" id="telefono"
            name="telefono" placeholder="Telefono" tamaño="md:w-1/2 w-full" max="100000000" min="100000" />
    </Section>

    <Section styles="md:flex-row flex-col">
        <Input :disabled="props.verAdministrativo" v-model="props.formData.Administrativo.correo" type="correo" id="correo"
            name="correo" placeholder="Correo Electronico" tamaño="w-full" minlength="5"/>
        <Input v-if="!props.noCambiar" :disabled="props.verAdministrativo" v-model="props.formData.Administrativo.contraseña" type="password" id="contraseña"
            name="contraseña" placeholder="Genera una contraseña" tamaño="w-full" minlength="5" />
    </Section>

</template>
