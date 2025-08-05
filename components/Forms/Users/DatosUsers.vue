<script setup>
// Componentes
import Label from "~/components/Labels/Label.vue";
import Input from "~/components/Inputs/Input.vue";
import Section from "~/components/Forms/Section.vue";
import Select from "~/components/Selects/Select.vue";
// Data
import { ubicacion } from "../../data/colombia.js";
import { municipios } from '~/data/municipios.js'
import { useVarView } from "../../stores/varview.js";
import { watch, onMounted } from "vue";

const varView = useVarView();
const contraseñaSegura = ref(false)

const props = defineProps([
    'formData',
    'traerDatos',
    'guardarDatos',
    'agregarItem',
    'eliminarItem',
    'noCambiar',
    'verUser'
]);
const formData = defineModel('formData');

const camposRequeridos = [
    'name', 'nacimiento', 'type_doc', 'No_document', 'sexo', 'genero',
    'direccion', 'departamento', 'municipio', 'zona', 'barrio',
    'celular', 'Eps', 'Regimen', 'poblacionVulnerable', 'correo', 'contraseña', 'rol'
];

// Guardar Datos en el localStorage
watch(
    props.formData,
    (newValue) => {
        props.guardarDatos(newValue);
        const User = newValue.User;

        if(props.formData.User.contraseña !== '' && !validarContraseña(props.formData.User.contraseña)){
            contraseñaSegura.value = true
        } else {
            contraseñaSegura.value = false
        }

        // Validacion
        const camposValidos = camposRequeridos.every((campo) => User[campo] !== '');
        // Detectar inputs inválidos
        const hayCamposInvalidos = document.querySelectorAll('input:invalid').length > 0;
        varView.formComplete = camposValidos && !hayCamposInvalidos && validarContraseña(props.formData.User.contraseña);
    },
    { deep: true }
);

// Traer datos del localStorage
onMounted(() => {
    props.traerDatos();
});

// Cuidades filtradas por departamento
const ciudades = computed(() => {
    return municipios.departamentos.filter(
        (data) => data.nombre.toLowerCase() === formData.value.User.departamento.toLowerCase()
    )[0]?.municipios;

});

const validarContraseña = (valor) => {
    // Al menos 3 letras (mayúsculas o minúsculas)
    const letras = valor.match(/[a-zA-Z]/g) || [];
    // Al menos 2 números
    const numeros = valor.match(/[0-9]/g) || [];
    // Al menos 1 símbolo (cualquier cosa que no sea letra o número)
    const simbolos = valor.match(/[^a-zA-Z0-9]/g) || [];

    return letras.length >= 3 && numeros.length >= 2 && simbolos.length >= 1;
}

</script>

<template>
    <Section>
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-user text-blue-500"></i>
            <Label forLabel="nombre" size="text-sm">Datos</Label>
        </div>
    </Section>

    <Section styles="md:flex-row flex-col">
        <Input :disabled="props.verUser" v-model="props.formData.User.name" type="text" id="nombre"
            name="nombre" placeholder="Nombres y Apellidos" tamaño="w-full" minlength="5" />
        <Input :disabled="props.verUser" v-model="formData.User.nacimiento" type="date" id="nacimiento"
            name="nacimiento" placeholder="Nacimiento" tamaño="md:w-1/5 w-full text-gray-500" />
    </Section>

    <Section styles="md:flex-row flex-col">
        <Select :disabled="props.verUser" v-model="formData.User.type_doc" id="tipoDocumento"
            name="tipoDocumento" :options="[
                { text: 'Cedula de ciudadania', value: 'cedula' },
                { text: 'Tarjeta de identidad', value: 'Tarjeta de identidad' },
                { text: 'Cedula Extranjera', value: 'extranjera' },
                { text: 'RC', value: 'RC' },
            ]" placeholder="Tipo de Documento" tamaño="w-full"></Select>
        <Input v-if="!props.noCambiar" :disabled="props.verUser" v-model="formData.User.No_document"
            type="number" id="documento" name="documento" placeholder="Número de documento" tamaño="w-full"
            max="10000000000" min="1000000" />
    </Section>

    <Section styles="mt-3">
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-location-dot text-blue-500"></i>
            <Label forLabel="departamento" size="text-sm">Ubicacion</Label>
        </div>
    </Section>

    <Section styles="md:flex-row flex-col">
        <Input :disabled="props.verUser" v-model="formData.User.departamento" type="text" id="departamento"
            name="departamento" placeholder="Departamento" tamaño="md:w-1/3 w-full" list="listDepartamento" />
        <datalist id="listDepartamento" class="bg-white text-black">
            <option v-for="(data, id) in municipios.departamentos" :key="id" :value="data.nombre">
            </option>
        </datalist>
        <Input :disabled="props.verUser" v-model="formData.User.municipio" type="text" id="municipio"
            name="municipio" placeholder="Municipio" tamaño="md:w-1/3 w-full" list="listMunicipio" />
        <datalist id="listMunicipio" v-if="formData.User.departamento">
            <option v-for="(data, id) in ciudades" :key="id" :value="data.nombre">{{ data.id }}</option>
        </datalist>
        <Select :disabled="props.verUser" v-model="formData.User.zona" id="zona" name="zona" :options="[
            { text: 'Rural', value: 'Rural' },
            { text: 'Urbana', value: 'Urbana' },
        ]" placeholder="Zona" tamaño="md:w-1/3 w-full"></Select>
    </Section>

    <Section styles="md:flex-row flex-col">
        <Input :disabled="props.verUser" v-model="formData.User.barrio" type="text" id="barrio" name="barrio"
            placeholder="Barrio" tamaño="md:w-1/2 w-full" minlength="5" />
        <Input :disabled="props.verUser" v-model="formData.User.direccion" type="text" id="direccion"
            name="direccion" placeholder="Direccion" tamaño="md:w-1/2 w-full" minlength="5" />
    </Section>

    <Section styles="mt-3">
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-phone text-blue-500"></i>
            <Label forLabel="departamento" size="text-sm">Contacto</Label>
        </div>
    </Section>
    <Section styles="md:flex-row flex-col">
        <Input :disabled="props.verUser" v-model="props.formData.User.celular" type="number"
            id="celular" name="celular" placeholder="Celular" tamaño="md:w-1/2 w-full" max="1000000000000"
            min="1000000000" />
        <Input :disabled="props.verUser" v-model="props.formData.User.telefono" type="number"
            id="telefono" name="telefono" placeholder="Telefono" tamaño="md:w-1/2 w-full" max="100000000"
            min="100000" />
    </Section>

    <Section styles="mt-3">
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-user-secret text-blue-500"></i>
            <Label forLabel="departamento" size="text-sm">Usuario</Label>
        </div>
    </Section>
    <Section styles="md:flex-row flex-col">
        <Select :disabled="props.verUser" v-model="props.formData.User.rol" placeholder="Rol" name="rol" id="rol" tamaño="w-1/2" :options="[{text: 'Paciente', value: 'Paciente'}, {text: 'Profesional', value: 'Profesional'}, {text: 'Administrativo', value: 'Administrativo'},]"></Select>
        <Input :disabled="props.verUser" v-model="props.formData.User.correo" type="email"
            id="correo" name="correo" placeholder="Correo Electronico" tamaño="w-full" minlength="5"
            :mayuscula="false" />
        <div class="w-full " v-if="!props.noCambiar">
            <Input :disabled="props.verUser"
                v-model="props.formData.User.contraseña" type="password" id="contraseña" name="contraseña"
                placeholder="Crea una contraseña" minlength="5" :mayuscula="false" />
            <p v-if="contraseñaSegura" class="text-red-500 text-sm">
                La contraseña debe contener al menos 3 letras, 2 números y 1 símbolo.
            </p>
        </div>
    </Section>



</template>
