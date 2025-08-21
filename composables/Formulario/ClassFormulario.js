// Clase base para construir formularios completos
export class FormularioBuilder {
  constructor() {
    this.propiedades = {
      formulario: {
        botones: [],
        tamañoForm: '',
        titulo: '',
        tipo: '',
        tituloFormulario: '',
        cerrar: null,
        secciones: [],
      },
      content: {
        validarform: null,
        mandarFormulario: null,
        modelValue: null,
        agregarItem: null,
        eliminarItem: null,
        traerDatos: null,
        guardarDatos: null,
        formulario: '',
      },
      campos: [],
    }
  }

  setBotones(botones) {
    this.propiedades.formulario.botones = botones
    return this
  }

  setValidarForm(fn) {
    this.propiedades.content.validarform = fn
    return this
  }

  setMandarFormulario(fn) {
    this.propiedades.content.mandarFormulario = fn
    return this
  }

  setFormulariotamaño(tamañoClave = 'LG') {
    const clases = tamañosDisponibles[tamañoClave] || tamañosDisponibles['LG']
    this.propiedades.formulario.tamañoForm = clases

    return this
  }

  setFormularioTitulo(titulo) {
    this.propiedades.formulario.titulo = titulo
    return this
  }

  setFormularioTipo(tipo) {
    this.propiedades.formulario.tipo = tipo
    return this
  }

  setFormularioTituloFormulario(tituloFormulario) {
    this.propiedades.formulario.tituloFormulario = tituloFormulario
    return this
  }

  setFormularioCerrar(fn) {
    this.propiedades.formulario.cerrar = fn
    return this
  }

  setFormularioSecciones(secciones) {
    this.propiedades.formulario.secciones = secciones
    return this
  }

  setContentModelValue(value) {
    this.propiedades.content.modelValue = value
    return this
  }

  setContentAgregarItem(fn) {
    this.propiedades.content.agregarItem = fn
    return this
  }

  setContentEliminarItem(fn) {
    this.propiedades.content.eliminarItem = fn
    return this
  }

  setContentTraerDatos(fn) {
    this.propiedades.content.traerDatos = fn
    return this
  }

  setContentGuardarDatos(fn) {
    this.propiedades.content.guardarDatos = fn
    return this
  }

  setContentFormulario(nombre) {
    this.propiedades.content.formulario = nombre
    return this
  }

  addCampo(campo) {
    this.propiedades.campos.push(campo)
    return this
  }

  build() {
    return this.propiedades
  }
}

const tamañosDisponibles = {
  LG: 'lg:w-[70%] md:w-[85%] md:h-[85%] w-[90%] h-[90%]',
  XS: 'md:w-[65%] md:h-[70%] w-[90%] h-[80%]',
}