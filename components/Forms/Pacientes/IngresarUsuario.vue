<script setup>
// Componentes
import FormLG from "~/components/organism/Forms/FormLG.vue";
import FormularioWizard from "~/components/Forms/FormularioWizard.vue";
import DatosUsers from "~/components/Forms/Users/DatosUsers.vue"
// Data
import { useUsersStore } from "~/stores/Formularios/usuarios/Users.js";
import { usePacientesStore } from "~/stores/Formularios/paciente/Paciente.js";
import { useNotificacionesStore } from "~/stores/notificaciones.js";
import { useVarView } from "~/stores/varview.js";
import { FormularioBuilder } from "~/composables/Formulario/ClassFormulario";

const varView = useVarView();
const storePaciente = usePacientesStore();
const nuevoPacienteStore = storePaciente.createForm("NuevoPaciente");
const notificacionesStore = useNotificacionesStore();

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



const builder = new FormularioBuilder()

const propiedades = builder
  .setBotones([
    { text: 'Atras', accion: cerrarModal },
    { text: 'Siguiente', accion: enviarNuevoUser },
  ])
  .setFormData(formData)
  .setValidarForm(validarform)
  .setFormComplete(varView.formComplete)
  .setFormularioTitulo('Datos del Usuario')
  .setFormularioTipo('Wizard')
  .setFormularioTituloFormulario('Nuevo Paciente')
  .setFormularioCerrar(cerrar)
  .setFormularioSecciones([
    { numPagina: 1, color: 'bg-[rgba(0,0,0,0.5)] text-white' },
    { numPagina: 2, color: 'bg-gray-300' },
  ])
  .setContentModelValue(nuevoPacienteStore.formData)
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
    modelValue: formData.InformacionUser.No_document,
    max: '10000000000',
    min: '1000000',
    vmodel: 'InformacionUser.No_document',
  })
  .addCampo({
    component: 'Select',
    placeholder: 'Tipo de Documento',
    id: 'tipoDocumento',
    name: 'tipoDocumento',
    tamaño: 'w-full',
    modelValue: formData.InformacionUser.type_doc,
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
    minLength: '5',
    modelValue: formData.InformacionUser.name,
    vmodel: 'InformacionUser.name',
  })
  .addCampo({
    component: 'Input',
    type: 'date',
    placeholder: 'Nacimiento',
    id: 'nacimiento',
    name: 'nacimiento',
    tamaño: 'w-full text-gray-500',
    modelValue: formData.InformacionUser.nacimiento,
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
    component: 'Input',
    type: 'text',
    placeholder: 'Departamento',
    id: 'departamento',
    name: 'departamento',
    tamaño: 'md:w-full w-full',
    modelValue: formData.InformacionUser.departamento,
    vmodel: 'InformacionUser.departamento',
  })
  .addCampo({
    component: 'Input',
    type: 'text',
    placeholder: 'Municipio',
    id: 'municipio',
    name: 'municipio',
    tamaño: 'md:w-full w-full',
    modelValue: formData.InformacionUser.municipio,
    vmodel: 'InformacionUser.municipio',
  })
  .addCampo({
    component: 'Select',
    placeholder: 'Zona',
    id: 'zona',
    name: 'zona',
    tamaño: 'md:w-full w-full',
    modelValue: formData.InformacionUser.zona,
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
    modelValue: formData.InformacionUser.barrio,
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
    modelValue: formData.InformacionUser.direccion,
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
    modelValue: formData.InformacionUser.celular,
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
    modelValue: formData.InformacionUser.telefono,
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
    modelValue: formData.User.rol,
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
    modelValue: formData.User.correo,
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
    modelValue: formData.User.contraseña,
    vmodel: 'User.contraseña',
  })
  .build()

  console.log(propiedades)
</script>

<template>
    <FormLG :Propiedades="propiedades" v-model:formData="formData">
        <!-- <FormularioWizard :datos="{
            titulo: 'Datos del Usuario',
            tituloFormulario: 'Nuevo Paciente',
            cerrar: cerrar,
            secciones: [
                { numPagina: 1, color: 'bg-[rgba(0,0,0,0.5)] text-white' },
                { numPagina: 2, color: 'bg-gray-300' },
            ]
        }">
            <DatosUsers v-model:formData="nuevoPacienteStore.formData" :agregarItem="agregarItem"
                :eliminarItem="eliminarItem" :traerDatos="traerDatos" :guardarDatos="guardarDatos"
                formulario="Paciente" />

        </FormularioWizard> -->
    </FormLG>
</template>
