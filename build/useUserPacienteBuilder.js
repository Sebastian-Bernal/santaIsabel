// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/composables/Formulario/ClassFormulario'

export function useUserBuilder({
    storeId,
    cerrarModal,
    tipoFormulario,
    buscarUsuario,
    departamentos,
    seleccionarDepartamento,
    CIE10,
    seleccionarCIE_10,
    EPS,
    show,
}) {
    const builder = new FormularioBuilder()

    return builder
        .setStoreId(storeId)
        .setFormulariotamaño('LG')
        .setFormularioTitulo('Datos Usuario')
        .setFormularioTituloFormulario('Nuevo Paciente')
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
        .nuevaSeccion('Datos Paciente')
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
                options: EPS,
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
                component: 'GroupCampos',
                type: 'SelectSearch',
                key: 'Diagnosticos',
                label: 'Diagnosticos',
                buttons: [{icon: 'fa-solid fa-plus', color: 'bg-blue-500'}],
                placeholder: 'CIE-10',
                id: 'cie10',
                name: 'cie10',
                tamaño: 'w-full col-span-2',
                vmodel: 'Diagnosticos',
                tipoDato: 'array',
                options: CIE10,
                opciones: [{ value: 'description' }, { text: 'Codigo', value: 'code' }],
                seleccionarItem: seleccionarCIE_10
            })

            // 📌 Sección: Antecedentes
            .addCampo({
                component: 'GroupCampos',
                type: 'Input',
                key: 'antecedentes',
                label: 'Antecedentes',
                buttons: [{icon: 'fa-solid fa-plus', color: 'bg-blue-500'}],
                placeholder: 'Antecedente',
                id: 'antecedente',
                name: 'antecedente',
                tamaño: 'w-full col-span-2',
                vmodel: 'Antecedentes',
                tipoDato: 'array',
            })

        // .nuevaSeccion('Datos Profesional')
            // 📌 Sección: Médico
            // .addCampo({
            //     component: 'Label',
            //     text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Medico',
            //     tamaño: 'w-full col-span-2',
            //     forLabel: 'nombre'
            // })
            // .addCampo({
            //     component: 'Select',
            //     placeholder: 'Profesión',
            //     id: 'profesion',
            //     name: 'profesion',
            //     tamaño: 'w-full',
            //     options: opcionesProfesion,
            //     vmodel: 'formData.Medico.profesion',
            //     disabled: 'props.verMedico',
            //     required: true
            // })

            // // 📌 Sección: Ubicación Laboral
            // .addCampo({
            //     component: 'Label',
            //     text: '<i class="fa-solid fa-location-dot text-blue-500 mr-1"></i>Ubicación Laboral',
            //     tamaño: 'w-full col-span-2',
            //     forLabel: 'departamento'
            // })
            // .addCampo({
            //     component: 'Input',
            //     type: 'text',
            //     placeholder: 'Departamento',
            //     id: 'departamentoLaboral',
            //     name: 'departamentoLaboral',
            //     tamaño: 'md:w-1/3 w-full',
            //     list: 'listDepartamento',
            //     vmodel: 'formData.Medico.departamentoLaboral',
            //     disabled: 'props.verMedico'
            // })
            // .addCampo({
            //     component: 'Datalist',
            //     id: 'listDepartamento',
            //     options: ubicacion,
            //     opciones: [{ value: 'departamento' }],
            // })
            // .addCampo({
            //     component: 'Input',
            //     type: 'text',
            //     placeholder: 'Municipio',
            //     id: 'municipioLaboral',
            //     name: 'municipioLaboral',
            //     tamaño: 'md:w-1/3 w-full',
            //     list: 'listMunicipio',
            //     vmodel: 'formData.Medico.municipioLaboral',
            //     disabled: 'props.verMedico'
            // })
            // .addCampo({
            //     component: 'Input',
            //     id: 'listMunicipio',
            //     options: ciudades,
            // })
            // .addCampo({
            //     component: 'Select',
            //     placeholder: 'Zona',
            //     id: 'zonaLaboral',
            //     name: 'zonaLaboral',
            //     tamaño: 'md:w-1/3 w-full',
            //     options: [
            //         { text: 'Rural', value: 'Rural' },
            //         { text: 'Urbana', value: 'Urbana' }
            //     ],
            //     vmodel: 'formData.Medico.zonaLaboral',
            //     disabled: 'props.verMedico'
            // })
        .build()
}