import { useNotificacionesStore } from '~/stores/notificaciones.js'
import { guardarEnDB, actualizarEnIndexedDB } from '~/composables/Formulario/useIndexedDBManager.js';

// funcion para Validar campos del formulario Nuevo Paciente
export const validarYEnviarDatosEmpresa = async (datos) => {
    const notificacionesStore = useNotificacionesStore();

    // 🔍 Lista de campos obligatorios
    const camposObligatorios = [
        'nombre', 'no_identificacion', 'DV', 'direccion', 'municipio', 'pais',
        'telefono', 'lenguaje', 'tipoDocumento', 'tipoEntorno', 'tipoMoneda',
        'tipoOperacion', 'tipoOrganizacion', 'tipoRegimen', 'tipoResponsabilidad',
        'impuesto', 'registroMercantil', 'logo', 'logoLogin', 'JPG'
    ];

    const empresa = datos.Empresa;

    // 🔎 Verificar campos vacíos o nulos
    const camposFaltantes = camposObligatorios.filter(campo => {
        const valor = empresa[campo];
        return valor === undefined || valor === null || valor === '';
    });

    if (camposFaltantes.length > 0) {
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Datos incompletos';
        notificacionesStore.options.texto = `Faltan los siguientes campos: ${camposFaltantes.join(', ')}`;
        notificacionesStore.options.tiempo = 6000;
        await notificacionesStore.simple();
        return false;
    }

    // 📞 Validar formato de teléfono (mínimo 7 dígitos)
    const telefonoRegex = /^\d{7,}$/;
    if (!telefonoRegex.test(empresa.telefono)) {
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Teléfono inválido';
        notificacionesStore.options.texto = 'El número de teléfono debe tener al menos 7 dígitos';
        notificacionesStore.options.tiempo = 5000;
        await notificacionesStore.simple();
        return false;
    }

    // 🆔 Validar número de identificación (solo números)
    const identificacionRegex = /^\d+$/;
    if (!identificacionRegex.test(empresa.no_identificacion)) {
        notificacionesStore.options.icono = 'error';
        notificacionesStore.options.titulo = 'Identificación inválida';
        notificacionesStore.options.texto = 'El número de identificación debe contener solo dígitos';
        notificacionesStore.options.tiempo = 5000;
        await notificacionesStore.simple();
        return false;
    }

    return await enviarFormulario(datos);
};

// Funcion para validar conexion a internet y enviar fomulario a API o a IndexedDB
const enviarFormulario = async (datos) => {
    const notificacionesStore = useNotificacionesStore();
    const api = useApiRest();
    const config = useRuntimeConfig()
    const token = sessionStorage.getItem('token')

    const id_temporal = await guardarEnDB(JSON.parse(JSON.stringify({ Empresa: { ...datos.Empresa, sincronizado: 0 } })));

    const online = navigator.onLine;
    if (online) {
        try {
            // mandar a api
            let options = {
                metodo: 'POST',
                url: config.public.empresas,
                token: token,
                body: {
                    nombre: datos.Empresa.nombre,
                    no_identificacion: datos.Empresa.no_identificacion,
                    DV: datos.Empresa.DV,
                    direccion: datos.Empresa.direccion,
                    municipio: datos.Empresa.municipio,
                    pais: datos.Empresa.pais,
                    telefono: datos.Empresa.telefono,
                    lenguaje: datos.Empresa.lenguaje,
                    tipoDocumento: datos.Empresa.tipoDocumento,
                    tipoEntorno: datos.Empresa.tipoEntorno,
                    tipoMoneda: datos.Empresa.tipoMoneda,
                    tipoOperacion: datos.Empresa.tipoOperacion,
                    tipoOrganizacion: datos.Empresa.tipoOrganizacion,
                    tipoRegimen: datos.Empresa.tipoRegimen,
                    tipoResponsabilidad: datos.Empresa.tipoResponsabilidad,
                    impuesto: datos.Empresa.impuesto,
                    registroMercantil: datos.Empresa.registroMercantil,
                    logo: datos.Empresa.logo,
                    logoLogin: datos.Empresa.logoLogin,
                    JPG: datos.Empresa.JPG
                }
            }
            const respuesta = await api.functionCall(options)

            if (respuesta.success) {
                const datosActualizadosLocal = {
                    Empresa: {
                        id_temporal: id_temporal.data,
                        sincronizado: 1,
                        id: respuesta.data.id,
                        nombre: respuesta.data.nombre,
                        no_identificacion: respuesta.data.no_identificacion,
                        DV: respuesta.data.DV,
                        direccion: respuesta.data.direccion,
                        municipio: respuesta.data.municipio,
                        pais: respuesta.data.pais,
                        telefono: respuesta.data.telefono,
                        lenguaje: respuesta.data.lenguaje,
                        tipoDocumento: respuesta.data.tipoDocumento,
                        tipoEntorno: respuesta.data.tipoEntorno,
                        tipoMoneda: respuesta.data.tipoMoneda,
                        tipoOperacion: respuesta.data.tipoOperacion,
                        tipoOrganizacion: respuesta.data.tipoOrganizacion,
                        tipoRegimen: respuesta.data.tipoRegimen,
                        tipoResponsabilidad: respuesta.data.tipoResponsabilidad,
                        impuesto: respuesta.data.impuesto,
                        registroMercantil: respuesta.data.registroMercantil,
                        logo: respuesta.data.logo,
                        logoLogin: respuesta.data.logoLogin,
                        JPG: respuesta.data.JPG
                    }
                }
                await actualizarEnIndexedDB(JSON.parse(JSON.stringify(datosActualizadosLocal)));
                return true
            }


        } catch (error) {
            console.error('Fallo al enviar. Guardando localmente', error);
            // await guardarEnDB(JSON.parse(JSON.stringify(datos)));
        }
    } else {
        notificacionesStore.options.icono = 'warning'
        notificacionesStore.options.titulo = 'No hay internet intente en otro momento';
        notificacionesStore.options.texto = 'en desarrollo'
        notificacionesStore.options.tiempo = 3000
        await notificacionesStore.simple()
        return true
    }
};