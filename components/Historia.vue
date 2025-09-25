<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
import Formularios from '~/components/Paciente.vue';

import { ref, onMounted } from 'vue';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia.js';
import { useHistoriaBuilder } from '~/build/Historial/useHistoriaBuilder';
import { useVarView } from "~/stores/varview.js";
import { ComponenteBuilder } from '~/build/Constructores/ClassFormulario';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente';
import { CIE10 } from '~/data/CIE10';
import { CUPS } from '~/data/CUPS';

const varView = useVarView();
const historiasStore = useHistoriasStore();
const notificaciones = useNotificacionesStore();

const historiasList = ref([]);
const onlyWatch = ref(true);

const pacientesStore = usePacientesStore();
const pacientesList = ref([])
const id_paciente = ref(null)

async function llamadatos() {
    const datos = await historiasStore.datosHistoria
    historiasList.value = datos
}

// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true
    pacientesList.value = await pacientesStore.listPacientes;
    const permisosStore = JSON.parse(sessionStorage.getItem("Permisos")) || [];
    onlyWatch.value = permisosStore.includes('Historia')
    await llamadatos()
    varView.cargando = false
});

function cerrar() {
    varView.showNuevaHistoria = false
}

function seleccionarPaciente(paciente) {
    historiasStore.Formulario.HistoriaClinica.type_doc_paciente = paciente.type_doc
    historiasStore.Formulario.HistoriaClinica.No_document_paciente = paciente.No_document
    historiasStore.Formulario.HistoriaClinica.id_paciente = paciente.id_paciente
    id_paciente.value = paciente.id_paciente
}

function seleccionarCIE_10(code) {
    historiasStore.Formulario.Diagnosticos.at(-1).descripcion = code.description
    historiasStore.Formulario.Diagnosticos.at(-1).CIE_10 = code.code
}

function validarCampo(event) {
    const { name, value } = event.target;
    let mensajeError = '';

    switch (name) {
        case 'ta': // Presión arterial (TA)
            // Se espera formato tipo "120/80"
            if (!/^\d{2,3}\/\d{2,3}$/.test(value)) {
                mensajeError = 'TA debe tener el formato "120/80"';
            }
            break;

        case 'fc': // Frecuencia cardíaca
            const fc = parseInt(value);
            if (isNaN(fc) || fc < 30 || fc > 100) {
                mensajeError = 'FC debe estar entre 30 y 100';
            }
            break;

        case 'fr': // Frecuencia respiratoria
            const fr = parseInt(value);
            if (isNaN(fr) || fr < 10 || fr > 250) {
                mensajeError = 'FR debe estar entre 10 y 250';
            }
            break;

        case 't': // Temperatura
            const t = parseFloat(value);
            if (isNaN(t) || t < 30 || t > 45) {
                mensajeError = 'Temperatura debe estar entre 30º y 45º';
            }
            break;

        case 'sat': // Saturación de oxígeno
            const sat = parseInt(value);
            if (isNaN(sat) || sat < 70 || sat > 100) {
                mensajeError = 'Sat O2 debe estar entre 70% y 100%';
            }
            break;

        default:
            console.warn(`No hay validación definida para el campo: ${name}`);
    }

    const errorDiv = document.getElementById(`error-${name}`);
    if (errorDiv) {
        if (mensajeError) {
            errorDiv.innerHTML = `<p>${mensajeError}</p>`;
        } else {
            errorDiv.innerHTML = ''; // Limpia el mensaje si no hay error
        }
    }
}

async function pacienteExiste(event) {
    const nombre = event.target.value

    const paciente = pacientesList.value.filter((pacient) => {
        return pacient.name === nombre
    });

    if (paciente.length < 1) {
        notificaciones.options.icono = 'warning'
        notificaciones.options.title = 'Paciente no registrado'
        notificaciones.options.html = '¿Deseas registrar <strong>Paciente</strong>?'
        notificaciones.options.confirmtext = 'Si'
        notificaciones.options.canceltext = 'No, continuar'
        let resp = await notificaciones.alertRespuesta();
        if (resp === 'confirmado') {
            varView.showNuevoPaciente = true
        }
    }
}

const propiedades = computed(() => {
    const pagina = new ComponenteBuilder()

    const propiedadesForm = useHistoriaBuilder({
        storeId: 'RegistrarHistoria',
        storePinia: 'Historias',
        cerrarModal: cerrar,
        show: varView.showNuevaHistoria,
        tipoFormulario: 'Wizard',
        PacientesList: pacientesList,
        seleccionarPaciente: seleccionarPaciente,
        CIE10: CIE10,
        validarCampo,
        seleccionarCIE_10: seleccionarCIE_10,
        pacienteExiste,
        id_paciente: id_paciente,
    });
    pagina
        .setFondo('FondoDefault')
        .addComponente('Form', propiedadesForm)
    return pagina.build()
})
// console.log(propiedades)

</script>

<template>
    <Pagina :Propiedades="propiedades" />
    <Formularios v-if="varView.showNuevoPaciente" />
</template>