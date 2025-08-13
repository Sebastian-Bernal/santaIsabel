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
import { useUsersStore } from "~/stores/Formularios/usuarios/Users.js";
import { watch, onMounted } from "vue";

const varView = useVarView();
const contraseñaSegura = ref(false);
const cambiarAdmin = ref(false)
const usuarioStore = useUsersStore();
const notificacionesStore = useNotificacionesStore();

const { simple, mensaje, options } = notificacionesStore;
const formData = defineModel('formData');

const props = defineProps([
    'traerDatos',
    'guardarDatos',
    'agregarItem',
    'eliminarItem',
    'noCambiar',
    'verUser',
    'formulario'
]);

const camposRequeridos = [
    'correo', 'rol',
];

// Guardar Datos en el localStorage
watch(
    formData.value,
    (newValue) => {
        props.guardarDatos(newValue);
        const User = newValue.User;

        if (formData.value.User.contraseña !== '' && !validarContraseña(formData.value.User.contraseña)) {
            contraseñaSegura.value = true
        } else {
            contraseñaSegura.value = false
        }

        // Validacion
        const camposValidos = camposRequeridos.every((campo) => User[campo] !== '');
        // Detectar inputs inválidos
        const hayCamposInvalidos = document.querySelectorAll('input:invalid').length > 0;
        // Validar si se digita una contraseña
        const debeValidarContraseña = props.formulario !== 'Paciente' && props.formulario !== 'Profesional' && formData.value.User.rol === 'Administrativo';
        varView.formComplete = false
        varView.formComplete = camposValidos && !hayCamposInvalidos && (debeValidarContraseña ? validarContraseña(formData.value.User.contraseña) : true);
    },
    { deep: true }
);

// Traer datos del localStorage
onMounted(() => {
    props.traerDatos();
    cambiarAdmin.value = sessionStorage.getItem('Rol') === 'Admin'
});

// Validar campo tipo de documento
watch(
    () => formData.value.InformacionUser.type_doc,
    (newValue) => {
        validarEdad(newValue, formData.value.InformacionUser.nacimiento);
    }
);

watch(() => formData.value.InformacionUser.nacimiento,
    () => {
        autocompletarTipo();
    }
)

function obtenerEdad(datoNacimiento) {
    const nacimiento = new Date(datoNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    const día = hoy.getDate() - nacimiento.getDate();

    if (mes < 0 || (mes === 0 && día < 0)) {
        edad--;
    }
    return edad
}

function autocompletarTipo() {
    const edad = obtenerEdad(formData.value.InformacionUser.nacimiento)

    if (edad >= 18) {
        formData.value.InformacionUser.type_doc = 'cedula'
    } else if (edad <= 18) {
        formData.value.InformacionUser.type_doc = 'Tarjeta de identidad'
    } else {
        formData.value.InformacionUser.type_doc = ''
    }
}

// Funcion Validar Edad
function validarEdad(type_doc, nacimientoStr) {
    const edad = obtenerEdad(nacimientoStr)

    if (type_doc === 'Tarjeta de identidad' && edad >= 18) {
        options.position = "top-end";
        options.texto = "Paciente Mayor de Edad, verifique la fecha de nacimiento.";
        options.tiempo = 1500;
        mensaje();
        formData.value.InformacionUser.type_doc = 'cedula';
        nextTick(() => {
            // Ya se ha renderizado correctamente
        });

    } else if (type_doc === 'cedula' && edad <= 18) {
        options.position = "top-end";
        options.texto = "Paciente Menor de Edad, verifique la fecha de nacimiento.";
        options.tiempo = 1500;
        mensaje();
        formData.value.InformacionUser.type_doc = 'Tarjeta de identidad';
        nextTick(() => {
            // Ya se ha renderizado correctamente
        });
    }
}

async function buscarUsuario() {
    const usuarios = await usuarioStore.listUsers

    const usuario = usuarios.filter((user) => {
        return user.No_document === formData.value.InformacionUser.No_document
    });

    if (usuario.length < 1) {
        options.position = "top-end";
        options.texto = "Usuario no registrado.";
        options.tiempo = 1500;
        mensaje();
        return
    };

    // Propiedades que van en User
    const userKeys = Object.keys(formData.value.User)
    userKeys.forEach(key => {
        if (usuario[0].hasOwnProperty(key)) {
            formData.value.User[key] = usuario[0][key]
        }
    })

    // Propiedades que van en paciente
    const infoUserKeys = Object.keys(formData.value.InformacionUser)
    infoUserKeys.forEach(key => {
        if (usuario[0].hasOwnProperty(key)) {
            formData.value.InformacionUser[key] = usuario[0][key]
        }
    })

    // Object.assign(formData.value.User, usuario[0]);

    if (props.formulario === 'Paciente') {
        formData.value.Paciente = { ...formData.value.Paciente, id_usuario: usuario[0].id }
    } else if (props.formulario === 'Profesional') {
        formData.value.Medico = { ...formData.value.Medico, id_usuario: usuario[0].id }
        if (formData.value.User.rol === 'Paciente') {
            formData.value.User.rol = 'Profesional'
        }
    };
}

// Cuidades filtradas por departamento
const ciudades = computed(() => {
    return municipios.departamentos.filter(
        (data) => data.nombre.toLowerCase() === formData.value.InformacionUser.departamento.toLowerCase()
    )[0]?.municipios;

});

const validarContraseña = (valor) => {
    // Al menos 3 letras (mayúsculas o minúsculas)
    const letras = valor?.match(/[a-zA-Z]/g) || [];
    // Al menos 2 números
    const numeros = valor?.match(/[0-9]/g) || [];
    // Al menos 1 símbolo (cualquier cosa que no sea letra o número)
    const simbolos = valor?.match(/[^a-zA-Z0-9]/g) || [];

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
        <Input v-if="!props.noCambiar" :disabled="props.verUser" v-model="formData.InformacionUser.No_document"
            type="number" id="documento" name="documento" placeholder="Número de documento" tamaño="w-full"
            max="10000000000" min="1000000" @keyup.enter="buscarUsuario" />
        <Select :disabled="props.verUser" v-model="formData.InformacionUser.type_doc" id="tipoDocumento"
            name="tipoDocumento" :options="[
                { text: 'Cedula de ciudadania', value: 'cedula' },
                { text: 'Tarjeta de identidad', value: 'Tarjeta de identidad' },
                { text: 'Cedula Extranjera', value: 'extranjera' },
                { text: 'RC', value: 'RC' },
            ]" placeholder="Tipo de Documento" tamaño="w-full"></Select>
    </Section>

    <Section styles="md:flex-row flex-col">
        <Input :disabled="props.verUser" v-model="formData.InformacionUser.name" type="text" id="nombre" name="nombre"
            placeholder="Nombres y Apellidos" tamaño="w-full" minlength="5" />
        <Input :disabled="props.verUser" v-model="formData.InformacionUser.nacimiento" type="date" id="nacimiento"
            name="nacimiento" placeholder="Nacimiento" tamaño="md:w-1/5 w-full text-gray-500" />
    </Section>

    <Section styles="mt-3">
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-location-dot text-blue-500"></i>
            <Label forLabel="departamento" size="text-sm">Ubicacion</Label>
        </div>
    </Section>

    <Section styles="md:flex-row flex-col">
        <Input :disabled="props.verUser" v-model="formData.InformacionUser.departamento" type="text" id="departamento"
            name="departamento" placeholder="Departamento" tamaño="md:w-1/3 w-full" list="listDepartamento" />
        <datalist id="listDepartamento" class="bg-white text-black">
            <option v-for="(data, id) in municipios.departamentos" :key="id" :value="data.nombre">
            </option>
        </datalist>
        <Input :disabled="props.verUser" v-model="formData.InformacionUser.municipio" type="text" id="municipio"
            name="municipio" placeholder="Municipio" tamaño="md:w-1/3 w-full" list="listMunicipio" />
        <datalist id="listMunicipio" v-if="formData.InformacionUser.departamento">
            <option v-for="(data, id) in ciudades" :key="id" :value="data.nombre">{{ data.id }}</option>
        </datalist>
        <Select :disabled="props.verUser" v-model="formData.InformacionUser.zona" id="zona" name="zona" :options="[
            { text: 'Rural', value: 'Rural' },
            { text: 'Urbana', value: 'Urbana' },
        ]" placeholder="Zona" tamaño="md:w-1/3 w-full"></Select>
    </Section>

    <Section styles="md:flex-row flex-col">
        <Input :disabled="props.verUser" v-model="formData.InformacionUser.barrio" type="text" id="barrio" name="barrio"
            placeholder="Barrio" tamaño="md:w-1/2 w-full" minlength="5" />
        <Input :disabled="props.verUser" v-model="formData.InformacionUser.direccion" type="text" id="direccion"
            name="direccion" placeholder="Direccion" tamaño="md:w-1/2 w-full" minlength="5" />
    </Section>

    <Section styles="mt-3">
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-phone text-blue-500"></i>
            <Label forLabel="departamento" size="text-sm">Contacto</Label>
        </div>
    </Section>
    <Section styles="md:flex-row flex-col">
        <Input :disabled="props.verUser" v-model="formData.InformacionUser.celular" type="number" id="celular"
            name="celular" placeholder="Celular" tamaño="md:w-1/2 w-full" max="1000000000000" min="1000000000" />
        <Input :disabled="props.verUser" v-model="formData.InformacionUser.telefono" type="number" id="telefono"
            name="telefono" placeholder="Telefono (opcional)" tamaño="md:w-1/2 w-full" max="100000000" min="100000" />
    </Section>

    <Section styles="mt-3">
        <div class="flex gap-3 items-center">
            <i class="fa-solid fa-user-secret text-blue-500"></i>
            <Label forLabel="departamento" size="text-sm">Usuario</Label>
        </div>
    </Section>
    <Section styles="md:flex-row flex-col">
        <Select v-if="!props.noCambiar && props.formulario !== 'Paciente' && props.formulario !== 'Profesional'"
            :disabled="props.verUser" v-model="formData.User.rol" placeholder="Rol" name="rol" id="rol" tamaño="w-1/2"
            :options="[{ text: 'Paciente', value: 'Paciente' }, { text: 'Profesional', value: 'Profesional' }, { text: 'Administrativo', value: 'Administrativo' },]"></Select>
        <Input :disabled="props.verUser" v-model="formData.User.correo" type="email" id="correo" name="correo"
            placeholder="Correo Electronico" tamaño="w-full" minlength="5" :mayuscula="false" />
        <div class="w-full "
            v-if="!props.noCambiar && props.formulario !== 'Paciente' && props.formulario !== 'Profesional' && formData.User.rol === 'Administrativo'">
            <Input :disabled="props.verUser" v-model="formData.User.contraseña" type="password" id="contraseña"
                name="contraseña" placeholder="Crea una contraseña" minlength="5" :mayuscula="false" />
            <p v-if="contraseñaSegura" class="text-red-500 text-sm">
                La contraseña debe contener al menos 3 letras, 2 números y 1 símbolo.
            </p>
        </div>
        <div v-if="props.noCambiar && !props.verUser"
            class="flex gap-2 items-center w-1/3 h-[37px] border border-gray-300 shadow p-2 mt-1 rounded-lg">
            <input v-model="formData.User.rol" type="radio" name="admin" id="admin" value="Administrativo" />
            <Label for="admin">Cambiar a Administrador</Label>
        </div>
    </Section>



</template>
