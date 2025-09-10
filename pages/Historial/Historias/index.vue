<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import VerHistoria from '~/components/Forms/Historia/VerHistoria.vue';

import { ref, onMounted } from 'vue';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia.js';
import { useHistoriaBuilder } from '~/build/Historial/useHistoriaBuilder';
import { useVarView } from "~/stores/varview.js";
import { ComponenteBuilder } from '~/build/Constructores/ClassFormulario';
import { TablaBuilder } from '~/build/Constructores/ClassTablas';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente';
import { CIE10 } from '~/data/CIE10';

const varView = useVarView();
const historiasStore = useHistoriasStore();

const historiasList = ref([]);
const historia = ref([]);
const refresh = ref(1);
const onlyWatch = ref(true);
const show = ref(false);
const pacientesStore = usePacientesStore();
const pacientesList = ref([])

async function llamadatos() {
    const datos = await historiasStore.datosHistoria
    historiasList.value = datos
}

watch(() => varView.showPaso4, async () => {
    await llamadatos()
    refresh.value++
})

// Cargar los pacientes desde el store
onMounted(async () => {
    varView.cargando = true
    pacientesList.value = await pacientesStore.listPacientes;
    const permisosStore = JSON.parse(sessionStorage.getItem("Permisos")) || [];
    onlyWatch.value = permisosStore.includes('Historia')
    await llamadatos()
    varView.cargando = false
});

// funcion para controlar la visibilidad del formulario de nueva historia clinica
const agregarHistoria = () => {
    show.value = true
    // varView.showNuevaHistoria = true
};


const verHistoria = (his) => {
    historia.value = his;
    varView.showVerHistoria = true
};

function cerrar() {
    show.value = false
}

function seleccionarPaciente(paciente) {
    historiasStore.Formulario.HistoriaClinica.type_doc_paciente = paciente.type_doc
    historiasStore.Formulario.HistoriaClinica.No_document_paciente = paciente.No_document
}

function seleccionarCIE_10(code) {
    historiasStore.Formulario.Diagnosticos.at(-1).descripcion = code.description
    historiasStore.Formulario.Diagnosticos.at(-1).code = code.code
    console.log(code)
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

const propiedadesForm = useHistoriaBuilder({
    storeId: 'RegistrarHistoria',
    storePinia: 'Historias',
    cerrarModal: cerrar,
    show: show,
    tipoFormulario: 'Wizard',
    PacientesList: pacientesList,
    seleccionarPaciente: seleccionarPaciente,
    CIE10: CIE10,
    validarCampo,
    seleccionarCIE_10: seleccionarCIE_10
});

// const builderCitas = new CitasBuilder()
const tablaBuilder = new TablaBuilder()
const pagina = new ComponenteBuilder()

const propiedades = pagina
    .setFondo('FondoDefault')
    .setEstilos('')
    .setContenedor('w-full')
    .addComponente('Tabla', tablaBuilder
        .setColumnas([
            { titulo: 'cedula', value: 'Cédula', tamaño: 100, ordenar: true },
            { titulo: 'paciente', value: 'Paciente', tamaño: 250, ordenar: true },
            { titulo: 'estado', value: 'Estado', tamaño: 150 },
        ])
        .setHeaderTabla({ titulo: 'Gestion de Historias Clinicas', descripcion: 'Administra y consulta información sobre historias clinicas', color: 'bg-[var(--color-default)] text-white', accionAgregar: agregarHistoria })
        .setAcciones({ icons: [{ icon: 'ver', action: agregarHistoria }], botones: true, })
        .setDatos(historiasList)
    )
    .addComponente('Form', propiedadesForm)
    .build()
// console.log(propiedades)

</script>

<template>
    <Pagina :Propiedades="propiedades" />
    <!-- <VerHistoria v-if="varView.showVerHistoria" :historia="historia" /> -->
</template>