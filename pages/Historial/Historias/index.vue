<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';

import { ref, onMounted } from 'vue';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia.js';
import { useHistoriaBuilder } from '~/build/Historial/useHistoriaBuilder';
import { useVarView } from "~/stores/varview.js";
import { ComponenteBuilder } from '~/build/Constructores/ClassFormulario';
import { TablaBuilder } from '~/build/Constructores/ClassTablas';
import { ModalBuilder } from '~/build/Constructores/ModalBuilder';
import { CardBuilder } from '~/build/Constructores/CardBuilder';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente';
import { mapCamposLimpios } from '~/components/organism/Forms/useFormulario';
import { CIE10 } from '~/data/CIE10';

const varView = useVarView();
const historiasStore = useHistoriasStore();

const historiasList = ref([]);

const analisis = ref([])
const notas = ref([])
const tratamientos = ref([])
const medicinas = ref([]);

const refresh = ref(1);
const onlyWatch = ref(true);
const show = ref(false);

const pacientesStore = usePacientesStore();
const pacientesList = ref([])
const showVerHistorial = ref(false)

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


const verHistoria = async(his) => {
    console.log(his)
    await cargaHistorial(his.id)
    historiasStore.Formulario.HistoriaClinica.name_paciente = his.paciente
    historiasStore.Formulario.HistoriaClinica.No_document_paciente = his.cedula
    showVerHistorial.value = true
};

async function cargaHistorial(id) {

    // consultas
    analisis.value = []
    const historia = await pacientesStore.listDatos(id, 'HistoriaClinica')

    if (Array.isArray(historia) && historia.length > 0 && historia[0].id_temporal) {
        analisis.value = await historiasStore.listDatos(historia[0].id_temporal, 'Analisis') || []
    } else {
        analisis.value = []
    }


    // Evoluciones


    // Notas
        notas.value = await pacientesStore.listDatos(id, 'Nota') || []


    // Tratamientos
        tratamientos.value = await pacientesStore.listDatos(id, 'Plan_manejo_procedimientos') || []

        const tratamientosConAnalisis = await Promise.all(
            tratamientos.value.map(async (tratamiento) => {
                const analisisTratamiento = await historiasStore.listDatos(tratamiento.id_temporal, 'Analisis', 'id')
                // Aquí puedes agregar más valores del análisis si existen
                return {
                    ...tratamiento,
                    ...analisisTratamiento[0],
                }
            })
        )
        
        tratamientos.value = tratamientosConAnalisis   


    // Medicinas
        medicinas.value = await pacientesStore.listDatos(id, 'Plan_manejo_medicamentos') || []

        const medicinasConAnalisis = await Promise.all(
            medicinas.value.map(async (medicina) => {
                const analisisMedicina = await historiasStore.listDatos(medicina.id_temporal, 'Analisis', 'id')
                // Aquí puedes agregar más valores del análisis si existen
                return {
                    ...medicina,
                    ...analisisMedicina[0],
                }
            })
        )
    
        medicinas.value = medicinasConAnalisis

        console.log(analisis.value, notas.value, tratamientos.value, medicinas.value)
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
    historiasStore.Formulario.Diagnosticos.at(-1).CIE_10 = code.code
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

function cerrarModal () {
    mapCamposLimpios(historiasStore.Formulario)
    showVerHistorial.value = false
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
const modal = new ModalBuilder()

const consultasCard = new CardBuilder()
const evolucionesCard = new CardBuilder()
const notasCard = new CardBuilder()
const tratamientosCard = new CardBuilder()
const medicacionCard = new CardBuilder()

const tablaConsultas = new TablaBuilder()
const tablaEvoluciones = new TablaBuilder()
const tablaNotas = new TablaBuilder()
const tablaTratamientos = new TablaBuilder()
const tablaMedicacion = new TablaBuilder()

const propiedades = computed(() => {
    const pagina = new ComponenteBuilder()

    pagina
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
        .setAcciones({ icons: [{ icon: 'ver', action: verHistoria }], botones: true, })
        .setDatos(historiasList)
    )
    .addComponente('Form', propiedadesForm)
    .addComponente('Modal', modal
        .setFondo('FondoBlur')
        .setShowModal(showVerHistorial)
        .setCerrarModal(cerrarModal)
        .setTamaño('LG')
        .setContenedor('flex flex-col justify-center items-center gap-3 w-full pt-8')
        .setHeaderModal({titulo: 'Historial Medico', html: `
            <div class="flex gap-2">
                <p>Paciente: ${historiasStore.Formulario.HistoriaClinica.name_paciente}</p> 
                <p>CC: ${historiasStore.Formulario.HistoriaClinica.No_document_paciente}</p>
            </div>`})
        .nuevaSeccion('Botones')
            .addComponente('Card', consultasCard
                .setCards([
                    {
                        header: {
                            icon: 'fa-solid fa-hospital text-white',
                            iconBg: 'bg-inherit',
                            title: 'Consultas y Analisis',
                            subtitle: 'Registro de consultas del paciente',
                            titleClass: 'text-white',
                            subtitleClass: 'text-gray-300!'
                        },
                    },
                ])
                .setContenedor('')
                .setcontenedorCards('')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-300)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white! w-[50vh]!')
                .build()
            )
            .addComponente('Card', evolucionesCard
                .setCards([
                    {
                        header: {
                            icon: 'fa-solid fa-file text-white',
                            iconBg: 'bg-inherit',
                            title: 'Evoluciones',
                            subtitle: 'Evoluciones de Historias',
                            titleClass: 'text-white',
                            subtitleClass: 'text-gray-300!'
                        },
                    },
                ])
                .setContenedor('')
                .setcontenedorCards('flex flex-col gap-1')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-400)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white! w-[50vh]!')
                .build()
            )
            .addComponente('Card', notasCard
                .setCards([
                    {
                        header: {
                            icon: 'fa-solid fa-notes-medical text-white',
                            iconBg: 'bg-inherit',
                            title: 'Notas',
                            subtitle: 'Registro de notas medicas',
                            titleClass: 'text-white',
                            subtitleClass: 'text-gray-300!'
                        },
                    },
                ])
                .setContenedor('')
                .setcontenedorCards('flex flex-col gap-1')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-500)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white! w-[50vh]!')
                .build()
            )
            .addComponente('Card', tratamientosCard
                .setCards([
                    {
                        header: {
                            icon: 'fa-solid fa-kit-medical text-white',
                            iconBg: 'bg-inherit',
                            title: 'Tratamientos del paciente',
                            subtitle: 'Tratamientos del paciente',
                            titleClass: 'text-white',
                            subtitleClass: 'text-gray-300!'
                        },
                    },
                ])
                .setContenedor('')
                .setcontenedorCards('flex flex-col gap-1')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-600)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white! w-[50vh]!')
                .build()
            )
            .addComponente('Card', medicacionCard
                .setCards([
                    {
                        header: {
                            icon: 'fa-solid fa-prescription-bottle-medical text-white',
                            iconBg: 'bg-inherit',
                            title: 'Medicacion',
                            subtitle: 'Medicacion del paciente',
                            titleClass: 'text-white',
                            subtitleClass: 'text-gray-300!'
                        },
                    },
                ])
                .setContenedor('')
                .setcontenedorCards('flex flex-col gap-1')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-700)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white! w-[50vh]!')
                .build()
            )
        .nuevaSeccion('Consultas')
            .addComponente('Tabla', tablaConsultas
                .setColumnas([
                    { titulo: 'id', value: 'Cédula', tamaño: 100, ordenar: true },
                    { titulo: 'paciente', value: 'Paciente', tamaño: 250, ordenar: true },
                    { titulo: 'estado', value: 'Estado', tamaño: 150 },
                ])
                .setHeaderTabla({ titulo: 'Consultas y Analisis', descripcion: 'Administra y consulta información sobre historias clinicas', color: 'bg-[var(--color-default)] text-white',})
                .setDatos(analisis)
            )  
        .nuevaSeccion('evoluciones')
            .addComponente('Tabla', tablaEvoluciones
                .setColumnas([
                    { titulo: 'id', value: 'Cédula', tamaño: 100, ordenar: true },
                    { titulo: 'paciente', value: 'Paciente', tamaño: 250, ordenar: true },
                    { titulo: 'estado', value: 'Estado', tamaño: 150 },
                ])
                .setHeaderTabla({ titulo: 'Evoluciones', descripcion: 'Administra y consulta información sobre historias clinicas', color: 'bg-[var(--color-default)] text-white',})
            )    
        .nuevaSeccion('notas')
            .addComponente('Tabla', tablaNotas
                .setColumnas([
                    { titulo: 'id', value: 'Cédula', tamaño: 100, ordenar: true },
                    { titulo: 'paciente', value: 'Paciente', tamaño: 250, ordenar: true },
                    { titulo: 'estado', value: 'Estado', tamaño: 150 },
                ])
                .setDatos(notas)
                .setHeaderTabla({ titulo: 'Notas Medicas', descripcion: 'Administra y consulta información sobre historias clinicas', color: 'bg-[var(--color-default)] text-white',})
            ) 
        .nuevaSeccion('tratamientos')
            .addComponente('Tabla', tablaTratamientos
                .setColumnas([
                    { titulo: 'id', value: 'Cédula', tamaño: 100, ordenar: true },
                    { titulo: 'paciente', value: 'Paciente', tamaño: 250, ordenar: true },
                    { titulo: 'estado', value: 'Estado', tamaño: 150 },
                ])
                .setDatos(tratamientos)
                .setHeaderTabla({ titulo: 'Tratamientos', descripcion: 'Administra y consulta información sobre historias clinicas', color: 'bg-[var(--color-default)] text-white',})
            ) 
        .nuevaSeccion('medicinas')
            .addComponente('Tabla', tablaMedicacion
                .setColumnas([
                    { titulo: 'id', value: 'Cédula', tamaño: 100, ordenar: true },
                    { titulo: 'paciente', value: 'Paciente', tamaño: 250, ordenar: true },
                    { titulo: 'estado', value: 'Estado', tamaño: 150 },
                ])
                .setDatos(medicinas)
                .setHeaderTabla({ titulo: 'Medicinas', descripcion: 'Administra y consulta información sobre historias clinicas', color: 'bg-[var(--color-default)] text-white',})
            )   
    )
    
    return pagina .build()
})
// console.log(propiedades)

</script>

<template>
    <Pagina :Propiedades="propiedades" />
</template>