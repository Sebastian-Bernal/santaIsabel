<script setup>
// Componentes
import FormLG from "~/components/organism/Forms/FormLG.vue";
// Data
import { FormularioBuilder } from "~/composables/Formulario/ClassFormulario";
import { CIE10 } from "~/data/CIE10.js";
import { useDatosEPSStore } from "~/stores/Formularios/empresa/EPS.js";
import { usePacientesStore } from "~/stores/Formularios/paciente/Paciente.js";
import { useNotificacionesStore } from "../../stores/notificaciones.js";
import { useVarView } from "../../stores/varview.js";
import { computed, ref } from "vue";

const varView = useVarView();
const storePaciente = usePacientesStore();
const nuevoPacienteStore = storePaciente.createForm("NuevoPaciente");
const notificacionesStore = useNotificacionesStore();
const epsStore = useDatosEPSStore();
const opcionesEPS = ref([])

const props = defineProps(['usuario'])
// Importar states y funciones del store
const {
    formData,
    traerDatos,
    guardarDatos,
    agregarItem,
    eliminarItem,
    limpiar,
    estado,
    mandarFormulario,
} = nuevoPacienteStore;

const { simple, mensaje, options } = notificacionesStore;

onMounted(async () => {
    if (props.usuario) {
        formData.User = props.usuario
        localStorage.removeItem('NuevoUsuario')
    }
    const EPS = await epsStore.listEPS
    console.log(EPS)
    opcionesEPS.value = await EPS.map(eps => ({
        text: eps.nombre,
        value: eps.nombre
    }));
})


// Enviar formulario -------------------
const enviarNuevoPaciente = async (formData) => {
    event.preventDefault();

    const estado = await mandarFormulario(formData);
    if (estado) {
        options.icono = "success";
        options.titulo = "¡Se ha enviado correctamente!";
        options.texto = "Nuevo Paciente Registrado";
        options.tiempo = 3000;
        const respuesta = await simple();
        if (respuesta.isConfirmed || respuesta.dismiss) {
            limpiar();
            varView.showNuevoPaciente = false;
            varView.showNuevoPacientePaso2 = false;
            varView.showNuevoUser = false;
            storePaciente.listPacientes
        }
    } else {
        options.icono = "error";
        options.titulo = "¡A ocurrido un problema!";
        options.texto = "No se pudo registrar Paciente";
        options.tiempo = 2000;
        simple();
    }
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
    varView.showNuevoPacientePaso2 = false;
    varView.showNuevoPaciente = true;
}

function cerrar() {
    limpiar()
    varView.showNuevoPaciente = false;
    varView.showNuevoPacientePaso2 = false;
};

function seleccionarCIE_10(item) {
    formData.Diagnosticos.push({
        id: '',
        CIE_10: item.description,
        codigo: item.code
        // id_paciente: !props.verPaciente ? formData.Paciente.id : null,
    });
}



const builder = new FormularioBuilder()

const propiedades = builder
    .setBotones([
        { text: 'Atrás', accion: cerrarModal, color: 'bg-gray-500' },
        { text: 'Guardar', accion: guardarDatos, color: 'bg-blue-500' },
    ])
    .setFormData(formData)
    .setValidarForm(validarform)
    .setFormComplete(varView.formComplete)
    .setFormularioTitulo('Datos del Paciente')
    .setFormularioTipo('Wizard')
    .setFormularioTituloFormulario('Nuevo Paciente')
    .setFormularioCerrar(cerrar)
    .setFormularioSecciones([
        { numPagina: 1, color: 'bg-[rgba(0,0,0,0.5)] text-white' },
        { numPagina: 2, color: 'bg-[rgba(0,0,0,0.5)] text-white' },
    ])
    .setContentModelValue(nuevoPacienteStore.formData)
    .setContentAgregarItem(agregarItem)
    .setContentEliminarItem(eliminarItem)
    .setContentTraerDatos(traerDatos)
    .setContentGuardarDatos(guardarDatos)
    .setContentFormulario('Paciente')

    // 📌 Sección: Paciente
    .addCampo({
        component: 'Label',
        text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Paciente',
        tamaño: 'w-full col-span-2',
        forLabel: 'nombre'
    })
    .addCampo({
        component: 'Select',
        placeholder: 'Sexo al Nacer',
        id: 'Sexo',
        name: 'Sexo',
        tamaño: 'w-full',
        options: [
            { text: 'Masculino', value: 'masculino' },
            { text: 'Femenino', value: 'femenino' },
        ],
        vmodel: 'Paciente.sexo',
    })
    .addCampo({
        component: 'Select',
        placeholder: 'Identidad de Género',
        id: 'genero',
        name: 'genero',
        tamaño: 'w-full',
        options: [
            { text: 'Masculino', value: 'masculino' },
            { text: 'Femenino', value: 'femenino' },
            { text: 'Neutro', value: 'neutro' },
            { text: 'No lo declara', value: 'no lo declara' },
            { text: 'Transgenero', value: 'transgenero' },
        ],
        vmodel: 'Paciente.genero',
    })

    // 📌 Sección: Datos adicionales
    .addCampo({
        component: 'Label',
        text: '<i class="fa-solid fa-file text-blue-500 mr-1"></i>Datos Adicionales',
        tamaño: 'w-full col-span-2',
        forLabel: 'eps'
    })
    .addCampo({
        component: 'Select',
        placeholder: 'EPS',
        id: 'eps',
        name: 'eps',
        tamaño: ' w-full',
        options: opcionesEPS.value,
        vmodel: 'Paciente.Eps',
    })
    .addCampo({
        component: 'Select',
        placeholder: 'Régimen',
        id: 'regimen',
        name: 'regimen',
        tamaño: ' w-full',
        options: [
            { text: 'Contributivo', value: 'Contributivo' },
            { text: 'Subsidiado', value: 'Subsidiado' },
            { text: 'Especial/Excepcion', value: 'Especial/Excepcion' },
        ],
        vmodel: 'Paciente.Regimen',
    })
    .addCampo({
        component: 'Select',
        placeholder: 'Población Vulnerable',
        id: 'poblacionVulnerable',
        name: 'poblacionVulnerable',
        tamaño: 'col-span-2 w-full',
        options: [
            { text: 'Ninguno', value: 'Ninguno' },
            { text: 'Adultos Mayores', value: 'Adultos Mayores' },
            { text: 'Discapacidad', value: 'Discapacidad' },
            { text: 'Victimas Conflicto Armado', value: 'Victimas Conflicto Armado' },
            { text: 'Habitantes de calle', value: 'Habitantes de calle' },
            { text: 'Poblacion LGBTIQ+', value: 'Poblacion LGBTIQ+' },
            { text: 'Grupos étnicos', value: 'Grupos étnicos' },
            { text: 'Personas privadas de la libertad', value: 'Personas privadas de la libertad' },
            { text: 'Desmovilizados', value: 'Desmovilizados' },
            { text: 'Migrantes colombianos repatriados', value: 'Migrantes colombianos repatriados' },
            { text: 'Madres comunitarias o sustitutas', value: 'Madres comunitarias o sustitutas' },
            { text: 'Voluntarios activos', value: 'Voluntarios activos' },
            { text: 'Personas con enfermedades huerfanas o catastroficas', value: 'Personas con enfermedades huerfanas o catastroficas' },
        ],
        vmodel: 'Paciente.poblacionVulnerable',
    })

    // 📌 Sección: Diagnósticos
    .addCampo({
        component: 'Label',
        text: '<i class="fa-solid fa-file text-blue-500 mr-1"></i>Diagnósticos (opcional)',
        tamaño: 'w-full col-span-2',
        forLabel: 'cie10'
    })
    .addCampo({
        component: 'SelectSearch',
        key: 'Diagnosticos',
        placeholder: 'CIE-10',
        id: 'cie10',
        name: 'cie10',
        tamaño: 'w-full col-span-2',
        vmodel: 'Diagnosticos',
        options: CIE10,
        opciones: [{ value: 'description' }, { text: 'Codigo', value: 'code' }],
        seleccionarItem: seleccionarCIE_10
    })

    // 📌 Sección: Antecedentes
    .addCampo({
        component: 'Label',
        text: '<i class="fa-solid fa-folder text-blue-500 mr-1"></i>Antecedentes (opcional)',
        tamaño: 'w-full col-span-2',
        forLabel: 'antecedentes'
    })
    //   .addCampo({
    //     component: 'DynamicList',
    //     key: 'Antecedentes',
    //     placeholder: 'Antecedentes',
    //     id: 'antecedentes',
    //     name: 'antecedentes',
    //     tamaño: 'w-full',
    //     vmodel: 'Antecedentes',
    //     campo: 'valor',
    //     extra: { tipos: ['personal', 'familiar'] }
    //   })

    .build()

</script>

<template>
    <!-- <ModalFormLG :cerrarModal="cerrarModal" :enviarFormulario="enviarNuevoPaciente"
        :formData="formData" :formComplete="varView.formComplete" :validarform="validarform" :botones="{ cancelar: 'Atras', enviar: 'Registrar' }">
        <FormularioWizard  :datos="{
            titulo: 'Datos del Paciente',
            tituloFormulario: 'Nuevo Paciente',
            cerrar: cerrar,
            secciones: [
                { numPagina: 1, color: 'bg-[rgba(0,0,0,0.5)] text-white' },
                { numPagina: 2, color: 'bg-[rgba(0,0,0,0.5)] text-white' },
            ]
        }">
            <DatosPacientes v-model:formData="nuevoPacienteStore.formData" :agregarItem="agregarItem"
                :eliminarItem="eliminarItem" :traerDatos="traerDatos" :guardarDatos="guardarDatos" />

        </FormularioWizard>
    </ModalFormLG> -->
    <FormLG :Propiedades="propiedades" v-model:formData="formData">

    </FormLG>
</template>
