<script setup>
import Pagina from '~/components/organism/Pagina/Pagina.vue';
import Formularios from '~/components/Formularios.vue';

import { ref, onMounted } from 'vue';
import { useHistoriasStore } from '~/stores/Formularios/historias/Historia.js';
import { useHistoriaBuilder } from '~/build/Historial/useHistoriaBuilder';
import { useVerHistoriaBuilder } from '~/build/Historial/useVerHistoriaBuilder';
import { useVarView } from "~/stores/varview.js";
import { ComponenteBuilder } from '~/build/Constructores/ClassFormulario';
import { TablaBuilder } from '~/build/Constructores/ClassTablas';
import { ModalBuilder } from '~/build/Constructores/ModalBuilder';
import { CardBuilder } from '~/build/Constructores/CardBuilder';
import { usePacientesStore } from '~/stores/Formularios/paciente/Paciente';
import { mapCamposLimpios, mapCampos } from '~/components/organism/Forms/useFormulario';
import { CIE10 } from '~/data/CIE10';
import { useNotasBuilder } from '~/build/Historial/useNotasBuilder';

const varView = useVarView();
const historiasStore = useHistoriasStore();
const notificaciones = useNotificacionesStore();

const historiasList = ref([]);

const analisis = ref([])
const notas = ref([])
const tratamientos = ref([])
const medicinas = ref([]);

const refresh = ref(1);
const onlyWatch = ref(true);
const show = ref(false);
const showItem = ref(false)
const showNota = ref(false)

const pacientesStore = usePacientesStore();
const pacientesList = ref([])
const id_paciente = ref(null)
const showVerHistorial = ref(false)
const showNuevoPaciente = ref(false)
const formularioItem = ref('')

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
};


const verHistoria = async (his) => {
    await cargaHistorial(his.id)
    historiasStore.Formulario.HistoriaClinica.name_paciente = his.paciente
    historiasStore.Formulario.HistoriaClinica.No_document_paciente = his.cedula
    showVerHistorial.value = true
};

async function cargaHistorial(id) {

    // Consultas
    analisis.value = []
    const historia = await pacientesStore.listDatos(id, 'HistoriaClinica')
    // Cambiar id por id_historia
    if (Array.isArray(historia) && historia.length > 0 && historia[0].id_temporal) {
        analisis.value = await historiasStore.listDatos(historia[0].id_temporal, 'Analisis', 'id') || []
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

function cerrarModalVer() {
    showItem.value = false
}

function verItemMedicamentoHistoria(item) {
    formularioItem.value = 'Medicamento'
    mapCampos(item, historiasStore.Formulario)
    historiasStore.Formulario.Plan_manejo_medicamentos.nombre = item.nombre
    historiasStore.Formulario.Plan_manejo_medicamentos.presentacion = item.presentacion
    historiasStore.Formulario.Plan_manejo_medicamentos.cantidad = item.cantidad
    showItem.value = true
}

function verItemTratamientoHistoria(item) {
    formularioItem.value = 'Tratamientos'
    mapCampos(item, historiasStore.Formulario)
    historiasStore.Formulario.Plan_manejo_procedimientos.descripcion = item.descripcion
    historiasStore.Formulario.Plan_manejo_procedimientos.mes = item.mes
    historiasStore.Formulario.Plan_manejo_procedimientos.cantidad = item.cantidad
    showItem.value = true
}

function verItemConsultasHistoria(item) {
    formularioItem.value = 'Consulta'
    mapCampos(item, historiasStore.Formulario)
    showItem.value = true
}

function nuevaNota() {
    showNota.value = true
}

function cerrarNota() {
    showNota.value = false
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

function estadoSemaforo(fila) {
    if (fila.tipoAnalisis === 'Estado clinico sin cambios') {
        return 'Verde'
    } else if (fila.tipoAnalisis === 'Recomendaciones Adicionales') {
        return 'Naranja'
    } else {
        return 'Rojo'
    }
}

function cerrarModal() {
    mapCamposLimpios(historiasStore.Formulario)
    showVerHistorial.value = false
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
            showNuevoPaciente.value = true
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
    seleccionarCIE_10: seleccionarCIE_10,
    pacienteExiste,
    id_paciente: id_paciente,
});

    const propiedadesNota = useNotasBuilder({
        storeId: 'NuevaNota',
        storePinia: 'Notas',
        cerrarModal: cerrarNota,
        show: showNota,
    })

// const builderCitas = new CitasBuilder()
const tablaBuilder = new TablaBuilder()

const consultasCard = new CardBuilder()
const evolucionesCard = new CardBuilder()
const notasCard = new CardBuilder()
const tratamientosCard = new CardBuilder()
const medicacionCard = new CardBuilder()

const propiedades = computed(() => {
    const pagina = new ComponenteBuilder()
    const modal = new ModalBuilder()

    const tablaConsultas = new TablaBuilder()
    const tablaEvoluciones = new TablaBuilder()
    const tablaNotas = new TablaBuilder()
    const tablaTratamientos = new TablaBuilder()
    const tablaMedicacion = new TablaBuilder()

    const propiedadesItemHistoria = useVerHistoriaBuilder({
        storeId: 'Verhistoria',
        storePinia: 'Historias',
        cerrarModal: cerrarModalVer,
        formularioItem,
        show: showItem,
    })

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
            .setContenedor('flex flex-col gap-3 w-full h-full py-5 px-8')
            .setHeaderModal({
                titulo: 'Historial Medico', html: `
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
                .setheaderTitle('Consulta por las diferentes secciones del Historial')
                .setheaderSubTitle('')
                .setcontenedorCards('w-full flex justify-center')
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
                .setcontenedorCards('w-full flex justify-center')
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
                .setcontenedorCards('w-full flex justify-center')
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
                .setcontenedorCards('w-full flex justify-center')
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
                .setcontenedorCards('w-full flex justify-center')
                .setTamaño('flex flex-row justify-between items-center rounded-lg bg-[var(--color-default-700)]! hover:bg-[var(--color-default-300)]! cursor-pointer text-white! w-[50vh]!')
                .build()
            )
            .nuevaSeccion('Consultas')
            .addComponente('Tabla', tablaConsultas
                .setColumnas([
                    { titulo: 'motivo', value: 'Motivo', tamaño: 250, ordenar: true },
                    { titulo: 'observacion', value: 'Observacion', tamaño: 250, ordenar: true },
                    { titulo: 'tipoAnalisis', value: 'Estado', tamaño: 250 },
                ])
                .setHeaderTabla({ titulo: 'Consultas y Analisis', color: 'bg-[var(--color-default-600)] text-white', })
                .setDatos(analisis)
                .setAcciones({ icons: [{ icon: estadoSemaforo, action: () => { } }, { icon: 'ver', action: verItemConsultasHistoria }], botones: true, })
            )
            .addComponente('Form', propiedadesItemHistoria)
            .nuevaSeccion('evoluciones')
            .addComponente('Tabla', tablaEvoluciones
                .setColumnas([
                    { titulo: 'id', value: 'Cédula', tamaño: 100, ordenar: true },
                    { titulo: 'paciente', value: 'Paciente', tamaño: 250, ordenar: true },
                    { titulo: 'estado', value: 'Estado', tamaño: 150 },
                ])
                .setHeaderTabla({ titulo: 'Evoluciones', color: 'bg-[var(--color-default-600)] text-white', })
            )
            .nuevaSeccion('notas')
            .addComponente('Tabla', tablaNotas
                .setColumnas([
                    { titulo: 'id', value: 'Cédula', tamaño: 100, ordenar: true },
                    { titulo: 'paciente', value: 'Paciente', tamaño: 250, ordenar: true },
                    { titulo: 'estado', value: 'Estado', tamaño: 150 },
                ])
                .setDatos(notas)
                .setHeaderTabla({ titulo: 'Notas Medicas', color: 'bg-[var(--color-default-600)] text-white', accionAgregar: nuevaNota })
            )
            .addComponente('Form', propiedadesNota)
            .nuevaSeccion('tratamientos')
            .addComponente('Tabla', tablaTratamientos
                .setColumnas([
                    { titulo: 'descripcion', value: 'Descripcion', tamaño: 300, ordenar: true },
                    { titulo: 'mes', value: 'Mes', tamaño: 250, ordenar: true },
                    { titulo: 'tipoAnalisis', value: 'Estado', tamaño: 250 },
                ])
                .setDatos(tratamientos)
                .setAcciones({ icons: [{ icon: estadoSemaforo, action: () => { } }, { icon: 'ver', action: verItemTratamientoHistoria }], botones: true, })
                .setHeaderTabla({ titulo: 'Tratamientos', color: 'bg-[var(--color-default-600)] text-white', })
            )
            .addComponente('Form', propiedadesItemHistoria)
            .nuevaSeccion('medicinas')
            .addComponente('Tabla', tablaMedicacion
                .setColumnas([
                    { titulo: 'nombre', value: 'Medicamento', tamaño: 200, ordenar: true },
                    { titulo: 'presentacion', value: 'Presentacion', tamaño: 200, ordenar: true },
                    { titulo: 'cantidad', value: 'Cantidad', tamaño: 150 },
                    { titulo: 'tipoAnalisis', value: 'Estado', tamaño: 250 },
                ])
                .setDatos(medicinas)
                .setAcciones({ icons: [{ icon: estadoSemaforo, action: () => { } }, { icon: 'ver', action: verItemMedicamentoHistoria }], botones: true, })
                .setHeaderTabla({ titulo: 'Medicinas', color: 'bg-[var(--color-default-600)] text-white', })
            )
            .addComponente('Form', propiedadesItemHistoria)
        )

    return pagina.build()
})
// console.log(propiedades)

</script>

<template>
    <Pagina :Propiedades="propiedades" />
    <Formularios v-if="showNuevoPaciente" :showPaciente="showNuevoPaciente" @ocultar="showNuevoPaciente = false" />
</template>