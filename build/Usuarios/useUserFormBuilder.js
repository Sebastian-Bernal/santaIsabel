// builders/useFormularioCitaBuilder.js
import { FormularioBuilder } from '~/build/Constructores/FormBuilder'

export function useUserBuilder({
    storeId,
    storePinia,
    camposRequeridos = [],
    cerrarModal,
    tipoFormulario,
    buscarUsuario,
    departamentos,
    seleccionarDepartamento,
    municipios,
    seleccionarMunicipio,
    CIE10,
    seleccionarCIE_10,
    EPS,
    opcionesProfesion,
    show,
    tipoUsuario,
    verUser,
    soloVer,
    eliminar,
    validarFecha = () => { },
    validarTipoDoc = () => { },
}) {


    const validarContraseña = (event) => {
        let mensaje = '';

        const valor = event.target.value
        
        const letras = valor?.match(/[a-zA-Z]/g) || []; // Al menos 3 letras (mayúsculas o minúsculas)
        const numeros = valor?.match(/[0-9]/g) || []; // Al menos 2 números
        const simbolos = valor?.match(/[^a-zA-Z0-9]/g) || []; // Al menos 1 símbolo (cualquier cosa que no sea letra o número)

        if(letras.length >= 3 && numeros.length >= 2 && simbolos.length >= 1){
            console.log('jaj')
            mensaje = 'no ma'
        }

        const errorDiv = document.getElementById(`error-password`);
        if (errorDiv) {
            if (mensajeError) {
                errorDiv.innerHTML = `<p>${mensajeError}</p>`;
            } else {
                errorDiv.innerHTML = ''; // Limpia el mensaje si no hay error
            }
        }

    }

    const builder = new FormularioBuilder()
    builder
        .setStoreId(storeId)
        .setStorePinia(storePinia)
        .setEditarFormulario(verUser)
        .setSoloVer(soloVer)
        .setEliminarFormulario(eliminar)
        .setCamposRequeridos(camposRequeridos)
        .setFormulariotamaño('LG')
    if (verUser) {
        builder
            .setFormularioTituloFormulario('Modificar Usuario')
    } else {
        builder
            .setFormularioTituloFormulario('Nuevo Usuario')
    }
    builder
        .setFormularioShow(show)
        .setFormularioTipo(tipoFormulario)
        .setFormularioContenedorCampos('flex flex-col')
        .setBotones([
            { text: 'Atrás', accion: cerrarModal, color: 'bg-gray-500', type: 'cerrar' },
            { text: 'Siguiente', color: 'bg-blue-500', type: 'enviar' },
        ])
        // 📌 Sección: Datos
        .nuevaSeccion('Datos usuarios')
    builder
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Datos usuario',
            tamaño: 'w-full md:col-span-2',
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
                onKeyUp: buscarUsuario
            },
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
            events: {
                onChange: validarTipoDoc
            }
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
            minlength: 5,
        })
        .addCampo({
            component: 'Input',
            type: 'date',
            placeholder: 'Nacimiento',
            id: 'nacimiento',
            name: 'nacimiento',
            tamaño: 'w-full text-gray-500',
            vmodel: 'InformacionUser.nacimiento',
            slot: {
                tooltip: `<div id="error-fecha" class="text-red-300 text-xs mt-1"></div>`
            },
            events: {
                onChange: validarFecha
            }
        })

        // 📌 Sección: Ubicación
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-location-dot text-blue-700 mr-1"></i>Ubicacion',
            tamaño: 'w-full md:col-span-2',
            forLabel: 'departamento'
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
            upperCase: true,
        })
        .addCampo({
            component: 'SelectSearch',
            options: municipios,
            opciones: [{ value: "nombre" }, { text: 'Codigo:', value: 'id' }],
            seleccionarItem: seleccionarMunicipio,
            placeholder: 'Municipio',
            id: 'municipio',
            name: 'municipio',
            tamaño: 'md:w-full w-full',
            vmodel: 'InformacionUser.municipio',
            upperCase: true,
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
            upperCase: true,
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
            upperCase: true,
        })

        // 📌 Sección: Contacto
        .addCampo({
            component: 'Label',
            text: '<i class="fa-solid fa-phone text-blue-500 mr-1"></i>Contacto',
            tamaño: 'w-full md:col-span-2',
            forLabel: 'celular'
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

    if (tipoUsuario === 'Administrador') {
        builder
            // 📌 Sección: Usuario
            .addCampo({
                component: 'Label',
                text: '<i class="fa-solid fa-user-secret text-sky-600 mr-1"></i>Datos usuario',
                tamaño: 'w-full md:col-span-2',
                forLabel: 'correo-secret'
            })
            .addCampo({
                component: 'Input',
                type: 'text',
                placeholder: 'Correo Electrónico',
                id: 'correo-secret',
                name: 'correo-secret',
                tamaño: 'w-full',
                minLength: '5',
                mayuscula: false,
                vmodel: 'User.correo',
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
                    { text: 'Administrador', value: 'Administrador' },
                ],
                vmodel: 'User.rol',
            })
            .addCampo({
                component: 'Input',
                type: 'password',
                placeholder: 'Crea una contraseña',
                id: 'contraseña-usuario',
                name: 'contraseña-usuario',
                minLength: '5',
                mayuscula: false,
                vmodel: 'User.contraseña',
                slot: {
                    html: `<div id="error-password"></div>`
                },
                events: {
                    onInput: validarContraseña
                }
            })

    }

    if (tipoUsuario === 'Paciente') {
        builder
            .nuevaSeccion('Datos Paciente')
            .addCampo({
                component: 'Label',
                text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Paciente',
                tamaño: 'w-full md:col-span-2',
                forLabel: 'Sexo'
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
                tamaño: 'w-full md:col-span-2',
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
                tamaño: 'md:col-span-2 w-full',
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
                labelGroup: 'Diagnosticos',
                buttons: [{ icon: 'fa-solid fa-plus', color: 'bg-blue-500', addItem: { descripcion: '', codigoCIE10: '', id_paciente: '' } }],
                tamaño: 'w-full md:col-span-2',
                vmodel: 'Diagnosticos',
                value: [],
                campos: [
                    {
                        name: 'descripcion',
                        id: 'cie-10',
                        type: 'SelectSearch',
                        placeholder: 'CIE-10',
                        tamaño: 'w-full',
                        options: CIE10,
                        opciones: [{ value: 'description' }, { text: 'Codigo', value: 'code' }],
                        seleccionarItem: seleccionarCIE_10,
                    },

                ]
            })

            // 📌 Sección: Antecedentes
            .addCampo({
                component: 'GroupCampos',
                labelGroup: 'Antecedentes',
                buttons: [
                    { icon: 'fa-solid fa-plus', color: 'bg-blue-500', label: 'Personal', addItem: { descripcion: '', tipo: 'Personal' } },
                    { icon: 'fa-solid fa-plus', color: 'bg-blue-700', label: 'Familiar', addItem: { descripcion: '', tipo: 'Familiar' } },
                ],
                tamaño: 'w-full md:col-span-2',
                vmodel: 'Antecedentes',
                value: [],
                campos: [
                    {
                        name: 'descripcion',
                        id: 'antecedente',
                        type: 'Input',
                        placeholder: 'Antecedente',
                        tamaño: 'w-full'
                    },
                ],
                containerCampos: 'w-full'
            })
    }

    if (tipoUsuario === 'Profesional') {
        builder
            .nuevaSeccion('Datos Profesional')
            // 📌 Sección: Médico
            .addCampo({
                component: 'Label',
                text: '<i class="fa-solid fa-user text-blue-500 mr-1"></i>Medico',
                tamaño: 'w-full md:col-span-2',
                forLabel: 'profesion'
            })
            .addCampo({
                component: 'Select',
                placeholder: 'Profesión',
                id: 'profesion',
                name: 'profesion',
                tamaño: 'w-full md:col-span-2',
                options: opcionesProfesion,
                vmodel: 'Profesional.profesion',
            })

            // 📌 Sección: Ubicación Laboral
            .addCampo({
                component: 'Label',
                text: '<i class="fa-solid fa-location-dot text-blue-500 mr-1"></i>Ubicación Laboral',
                tamaño: 'w-full md:col-span-2',
                forLabel: 'listDepartamento'
            })
            .addCampo({
                component: 'SelectSearch',
                tamaño: 'w-full',
                placeholder: 'Departamento',
                id: 'listDepartamento',
                name: 'listDepartamento',
                options: departamentos,
                opciones: [{ value: "nombre" }, { text: 'nombre', value: 'nombre' }],
                seleccionarItem: seleccionarDepartamento,
                vmodel: 'Profesional.departamentoLaboral',
            })
            .addCampo({
                component: 'Input',
                type: 'text',
                placeholder: 'Municipio',
                id: 'municipioLaboral',
                name: 'municipioLaboral',
                tamaño: 'w-full',
                list: 'listMunicipio',
                vmodel: 'Profesional.municipioLaboral',
            })
            .addCampo({
                component: 'Select',
                placeholder: 'Zona',
                id: 'zonaLaboral',
                name: 'zonaLaboral',
                tamaño: 'w-full',
                options: [
                    { text: 'Rural', value: 'Rural' },
                    { text: 'Urbana', value: 'Urbana' }
                ],
                vmodel: 'Profesional.zonaLaboral',
            })
            // 📌 Sección: Usuario
            .addCampo({
                component: 'Label',
                text: '<i class="fa-solid fa-user-secret text-sky-600 mr-1"></i>Datos usuario',
                tamaño: 'w-full md:col-span-2',
                forLabel: 'correo-secret'
            })
            .addCampo({
                component: 'Input',
                type: 'text',
                placeholder: 'Correo Electrónico',
                id: 'correo-secret',
                name: 'correo-secret',
                tamaño: 'w-full',
                minLength: '5',
                mayuscula: false,
                vmodel: 'User.correo',
            })
    }

    return builder.build()
}