<script setup>
// Componentes
import Form from "~/components/organism/Forms/Form.vue";
// Data
import { useUsersStore } from "~/stores/Formularios/usuarios/Users.js";
import { usePacientesStore } from "~/stores/Formularios/paciente/Paciente.js";
import { useNotificacionesStore } from "~/stores/notificaciones.js";
import { useVarView } from "~/stores/varview.js";
import { FormularioBuilder } from "~/composables/Formulario/ClassFormulario";
import { municipios } from '~/data/municipios.js'

const varView = useVarView();
const storePaciente = usePacientesStore();
const nuevoPacienteStore = storePaciente.createForm("NuevoPaciente");
const notificacionesStore = useNotificacionesStore();
const usuarioStore = useUsersStore()

// Importar states y funciones del store
const {
    formData,
    traerDatos,
    guardarDatos,
    agregarItem,
    eliminarItem,
    limpiar,
    estado,
} = nuevoPacienteStore;

const { simple, mensaje, options } = notificacionesStore;

// Enviar formulario -------------------
const enviarNuevoUser = () => {
    event.preventDefault();

    varView.showNuevoPaciente = false;
    varView.showNuevoPacientePaso2 = true;
};

const validarform = () => {
    if (!varView.formComplete) {
        options.position = "top-end";
        options.texto = "Falta campos por llenar, por favor ingrese valores";
        options.tiempo = 1500;
        mensaje();
    }
};

function cerrarModal() {
    limpiar()
    varView.showNuevoPaciente = false;
};

function cerrar() {
    limpiar()
    varView.showNuevoPaciente = false;
    varView.showNuevoPacientePaso2 = false;
};

function seleccionarDepartamento (item) {
    formData.InformacionUser.departamento = item.nombre;
}

function buscarUsuario() {
  console.log('hola')
    // const usuarios = await usuarioStore.listUsers

    // const usuario = usuarios.filter((user) => {
    //     return user.No_document === formData.value.InformacionUser.No_document
    // });

    // if (usuario.length < 1) {
    //     options.position = "top-end";
    //     options.texto = "Usuario no registrado.";
    //     options.tiempo = 1500;
    //     mensaje();
    //     return
    // };

    // // Propiedades que van en User
    // const userKeys = Object.keys(formData.value.User)
    // userKeys.forEach(key => {
    //     if (usuario[0].hasOwnProperty(key)) {
    //         formData.value.User[key] = usuario[0][key]
    //     }
    // })

    // // Propiedades que van en paciente
    // const infoUserKeys = Object.keys(formData.value.InformacionUser)
    // infoUserKeys.forEach(key => {
    //     if (usuario[0].hasOwnProperty(key)) {
    //         formData.value.InformacionUser[key] = usuario[0][key]
    //     }
    // })

    // Object.assign(formData.value.User, usuario[0]);

    // if (props.formulario === 'Paciente') {
    //     formData.value.Paciente = { ...formData.value.Paciente, id_usuario: usuario[0].id }
    // } else if (props.formulario === 'Profesional') {
    //     formData.value.Medico = { ...formData.value.Medico, id_usuario: usuario[0].id }
    //     if (formData.value.User.rol === 'Paciente') {
    //         formData.value.User.rol = 'Profesional'
    //     }
    // };
}



const builder = new FormularioBuilder()

const propiedades = builder
  .setBotones([
    { text: 'Atras', accion: cerrarModal, color: 'bg-gray-500' },
    { text: 'Siguiente', accion: enviarNuevoUser, color: 'bg-blue-500' },
  ])
  .setValidarForm(validarform)
  .setFormularioTipo('Wizard')
  .setFormularioTituloFormulario('Nuevo Paciente')
  .setFormularioCerrar(cerrar)
  .setFormularioSecciones([
    { numPagina: 1, color: 'bg-[rgba(0,0,0,0.5)] text-white' },
    { numPagina: 2, color: 'bg-gray-300 dark:bg-gray-500 dark:text-gray-200 text-dark font-bold' },
  ])
  .setContentAgregarItem(agregarItem)
  .setContentEliminarItem(eliminarItem)
  .setContentTraerDatos(traerDatos)
  .setContentGuardarDatos(guardarDatos)
  .setContentFormulario('Paciente')

  // 📌 Sección: Datos
  .addCampo({
    component: 'Label',
    text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Datos usuario',
    tamaño: 'w-full col-span-2',
    forLabel: 'documento'
  })
  .addCampo({
    component: 'Input',
    type: 'number',
    placeholder: 'Número de documento',
    id: 'documento',
    name: 'documento',
    tamaño: 'w-full',
    max: '10000000000',
    min: '1000000',
    vmodel: 'InformacionUser.No_document',
    events: {
      onClick : buscarUsuario
    }
  })
  .addCampo({
    component: 'Select',
    placeholder: 'Tipo de Documento',
    id: 'tipoDocumento',
    name: 'tipoDocumento',
    tamaño: 'w-full',
    options: [
      { text: 'Cédula de ciudadanía', value: 'cedula' },
      { text: 'Tarjeta de identidad', value: 'Tarjeta de identidad' },
      { text: 'Cédula Extranjera', value: 'extranjera' },
      { text: 'RC', value: 'RC' },
    ],
    vmodel: 'InformacionUser.type_doc',
  })
  .addCampo({
    component: 'Input',
    type: 'text',
    placeholder: 'Nombres y Apellidos',
    id: 'nombre',
    name: 'nombre',
    tamaño: 'w-full',
    upperCase: true,
    vmodel: 'InformacionUser.name',
    minlength: 5
  })
  .addCampo({
    component: 'Input',
    type: 'date',
    placeholder: 'Nacimiento',
    id: 'nacimiento',
    name: 'nacimiento',
    tamaño: 'w-full text-gray-500',
    vmodel: 'InformacionUser.nacimiento',
  })

  // 📌 Sección: Ubicación
.addCampo({
    component: 'Label',
    text: '<i class="fa-solid fa-location-dot text-blue-500 mr-1"></i>Ubicacion',
    tamaño: 'w-full col-span-2',
    forLabel: 'documento'
  })
  .addCampo({
    component: 'SelectSearch',
    options: municipios.departamentos,
    opciones: [{ value: "nombre" },{text: 'nombre', value: 'nombre'}],
    seleccionarItem: seleccionarDepartamento,
    placeholder: 'Departamento',
    id: 'departamento',
    name: 'departamento',
    tamaño: 'md:w-full w-full',
    vmodel: 'InformacionUser.departamento',
  })
  .addCampo({
    component: 'Input',
    type: 'text',
    placeholder: 'Municipio',
    id: 'municipio',
    name: 'municipio',
    tamaño: 'md:w-full w-full',
    vmodel: 'InformacionUser.municipio',
  })
  .addCampo({
    component: 'Select',
    placeholder: 'Zona',
    id: 'zona',
    name: 'zona',
    tamaño: 'md:w-full w-full',
    options: [
      { text: 'Rural', value: 'Rural' },
      { text: 'Urbana', value: 'Urbana' },
    ],
    vmodel: 'InformacionUser.zona',
  })
  .addCampo({
    component: 'Input',
    type: 'text',
    placeholder: 'Barrio',
    id: 'barrio',
    name: 'barrio',
    tamaño: 'md:w-full w-full',
    minLength: '5',
    vmodel: 'InformacionUser.barrio',
  })
  .addCampo({
    component: 'Input',
    type: 'text',
    placeholder: 'Dirección',
    id: 'direccion',
    name: 'direccion',
    tamaño: 'md:w-full w-full',
    minLength: '5',
    vmodel: 'InformacionUser.direccion',
  })

  // 📌 Sección: Contacto
  .addCampo({
    component: 'Label',
    text: '<i class="fa-solid fa-phone text-blue-500 mr-1"></i>Datos usuario',
    tamaño: 'w-full col-span-2',
    forLabel: 'documento'
  })
  .addCampo({
    component: 'Input',
    type: 'number',
    placeholder: 'Celular',
    id: 'celular',
    name: 'celular',
    tamaño: 'md:w-full w-full',
    max: '1000000000000',
    min: '1000000000',
    vmodel: 'InformacionUser.celular',
  })
  .addCampo({
    component: 'Input',
    type: 'number',
    placeholder: 'Teléfono (opcional)',
    id: 'telefono',
    name: 'telefono',
    tamaño: 'md:w-full w-full',
    max: '100000000',
    min: '100000',
    vmodel: 'InformacionUser.telefono',
  })

  // 📌 Sección: Usuario
  .addCampo({
    component: 'Label',
    text: '<i class="fa-solid fa-user-secret text-blue-500 mr-1"></i>Datos usuario',
    tamaño: 'w-full col-span-2',
    forLabel: 'documento'
  })
  .addCampo({
    component: 'Select',
    placeholder: 'Rol',
    id: 'rol',
    name: 'rol',
    tamaño: 'w-full',
    options: [
      { text: 'Paciente', value: 'Paciente' },
      { text: 'Profesional', value: 'Profesional' },
      { text: 'Administrativo', value: 'Administrativo' },
    ],
    vmodel: 'User.rol',
  })
  .addCampo({
    component: 'Input',
    type: 'email',
    placeholder: 'Correo Electrónico',
    id: 'correo',
    name: 'correo',
    tamaño: 'w-full',
    minLength: '5',
    mayuscula: false,
    vmodel: 'User.correo',
  })
  .addCampo({
    component: 'Input',
    type: 'password',
    placeholder: 'Crea una contraseña',
    id: 'contraseña',
    name: 'contraseña',
    minLength: '5',
    mayuscula: false,
    vmodel: 'User.contraseña',
  })
  .build()

</script>

<template>
    <Form :Propiedades="propiedades" />
</template>
