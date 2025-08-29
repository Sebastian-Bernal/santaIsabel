// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/composables/Formulario/ClassFormulario'

export function useHistoriaBuilder({
    storeId,
    cerrarModal,
    tipoFormulario,
    show,
}) {
    const builder = new FormularioBuilder()

    builder
        .setStoreId(storeId)
        // .setCamposRequeridos(['InformacionUser.No_document', 'InformacionUser.name', 'Paciente.Regimen', 'Paciente.genero', 'Paciente.poblacionVulnerable', 'Paciente.sexo'])
        .setFormulariotamaño('LG')
        .setFormularioTituloFormulario('Registrar Consulta')
        .setFormularioShow(show)
        .setFormularioTipo(tipoFormulario)
        .setBotones([
            { text: 'Atrás', accion: cerrarModal, color: 'bg-gray-500', type: 'cerrar' },
            { text: 'Siguiente', color: 'bg-blue-500', type: 'enviar' },
        ])
        // 📌 Sección: Datos
        .nuevaSeccion('Datos usuarios')
        .addCampo({
            component: 'Label',
            forLabel: 'nombre',
            size: 'text-sm',
            text: 'Paciente'
        })

        // --- Nombre Paciente ---
        .addCampo({
            component: 'SelectSearch',
            vmodel: 'HistoriaClinica.name_paciente',
            id: 'nombre',
            name: 'nombre',
            placeholder: 'Nombre del paciente',
            options: 'PacientesList',
            seleccionarItem: 'seleccionarPaciente',
            opciones: [
                { value: 'name' },
                { text: 'Cedula', value: 'No_document' }
            ]
        })

        // --- Numero de documento ---
        .addCampo({
            component: 'SelectSearch',
            vmodel: 'HistoriaClinica.No_document_paciente',
            id: 'documento',
            name: 'documento',
            placeholder: 'Numero de documento',
            options: 'PacientesList',
            seleccionarItem: 'seleccionarPaciente',
            opciones: [{ value: 'No_document' }]
        })

        // --- Tipo de documento ---
        .addCampo({
            component: 'Select',
            vmodel: 'HistoriaClinica.type_doc_paciente',
            id: 'tipoDocumento',
            name: 'tipoDocumento',
            placeholder: 'Tipo de documento',
            tamaño: 'w-full',
            options: [
                { text: 'Cedula de ciudadania', value: 'cedula' },
                { text: 'Cedula Extranjera', value: 'extranjera' },
                { text: 'Tarjeta de Identidad', value: 'TarjetaIdentidad' }
            ]
        })

        // --- Label Acompañante ---
        .addCampo({
            component: 'Label',
            forLabel: 'tipo',
            size: 'text-sm',
            text: 'Acompañante (Opcional)'
        })

        // --- Nombre Acompañante ---
        .addCampo({
            component: 'Input',
            vmodel: 'item.nombre',
            type: 'text',
            id: 'nombreAcompañante',
            name: 'nombreAcompañante',
            placeholder: 'Nombre completo del acompañante',
            tamaño: 'w-full'
        })

        // --- Parentesco Acompañante ---
        .addCampo({
            component: 'Select',
            vmodel: 'item.parentesco',
            id: 'parentesco',
            name: 'parentesco',
            placeholder: 'Seleccione el parentesco',
            tamaño: 'w-full',
            options: [
                { text: 'Padre', value: 'Padre' },
                { text: 'Madre', value: 'Madre' },
                { text: 'Hijo', value: 'Hijo' },
                { text: 'Conyuge', value: 'Conyuge' },
                { text: 'Hermano/a', value: 'Hermano/a' }
            ]
        })

    return builder.build()
}