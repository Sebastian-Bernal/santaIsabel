// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/composables/Formulario/ClassFormulario'

export function useUserProfesionalBuilder({
    validarform,
    traerDatos,
    guardarDatos,
    cerrarModal,
    tipoFormulario,
    buscarUsuario,
    departamentos,
    seleccionarDepartamento,
    show,
    opcionesProfesion,
}) {
    const builder = new FormularioBuilder()

    return builder
        .setFormulariotamaño('LG')
        .setFormularioTitulo('Datos Usuario')
        .setFormularioTituloFormulario('Nuevo Paciente')
        .setFormularioShow(show)
        .setFormularioTipo(tipoFormulario)
        .setValidarForm(validarform)
        .setContentTraerDatos(traerDatos)
        .setContentGuardarDatos(guardarDatos)
        .setFormularioCerrar(cerrarModal)
        .setBotones([
            { text: 'Atrás', accion: cerrarModal, color: 'bg-gray-500' },
            { text: 'Siguiente', color: 'bg-blue-500' },
        ])
        // 📌 Sección: Datos
        .nuevaSeccion('Datos usuarios')
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
                    onClick: buscarUsuario
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
                options: departamentos,
                opciones: [{ value: "nombre" }, { text: 'nombre', value: 'nombre' }],
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

        .nuevaSeccion('Datos Profesional')
            // 📌 Sección: Médico
            .addCampo({
                component: 'Label',
                text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Medico',
                tamaño: 'w-full col-span-2',
            })
            .addCampo({
                component: 'Select',
                placeholder: 'Profesión',
                id: 'profesion',
                name: 'profesion',
                tamaño: 'w-full col-span-2',
                options: opcionesProfesion,
                vmodel: 'Medico.profesion',
                disabled: 'props.verMedico',
                required: true
            })

            // 📌 Sección: Ubicación Laboral
            .addCampo({
                component: 'Label',
                text: '<i class="fa-solid fa-location-dot text-blue-500 mr-1"></i>Ubicación Laboral',
                tamaño: 'w-full col-span-2',
                forLabel: 'departamento'
            })
            .addCampo({
                component: 'SelectSearch',
                placeholder: 'Departamentos',
                id: 'departamentoLaboral',
                name: 'departamentoLaboral',
                tamaño: 'w-full',
                vmodel: 'Medico.departamentoLaboral',
                disabled: 'props.verMedico',
                options: departamentos,
                opciones: [{ value: "nombre" }, { text: 'nombre', value: 'nombre' }],
                seleccionarItem: seleccionarDepartamento,
            })
            .addCampo({
                component: 'Input',
                type: 'text',
                placeholder: 'Municipio',
                id: 'municipioLaboral',
                name: 'municipioLaboral',
                tamaño: ' w-full',
                list: 'listMunicipio',
                vmodel: 'Medico.municipioLaboral',
                disabled: 'props.verMedico'
            })
            .addCampo({
                component: 'Select',
                placeholder: 'Zona',
                id: 'zonaLaboral',
                name: 'zonaLaboral',
                tamaño: ' w-full',
                options: [
                    { text: 'Rural', value: 'Rural' },
                    { text: 'Urbana', value: 'Urbana' }
                ],
                vmodel: 'Medico.zonaLaboral',
                disabled: 'props.verMedico'
            })
        .build()
}