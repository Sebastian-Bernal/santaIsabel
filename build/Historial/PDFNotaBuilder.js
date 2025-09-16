// builders/useFormularioCitaBuilder.js
import { PdfBuilder } from '../Constructores/PDFBuilder'

export function usePDFNotasBuilder({
    storePinia
}) {
    const builder = new PdfBuilder()

    builder
        .setElementId('Nota')
        .setDataPinia(storePinia)

        .addComponente('Titulo', {
            texto: 'Nota Medica'
        })
        .addComponente('Texto', {
            texto: 'Paciente: ',
            vmodel: 'Nota.name_paciente',
        })
        .addComponente('Tabla', {
            columnas: ['Fecha', 'Hora', 'Nota'],
            filas: [['16/09/2025', '5:30', 'Notaaaaaaaa'], ['16/09/2025', '5:30', 'Notaaaaaaaa']]
        })

    return builder.build()
}