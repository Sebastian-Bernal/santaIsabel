// Clase base para construir formularios completos
export class FormularioBuilder {
  constructor() {
    this.propiedades = {
      botones: [],
      formData: null,
      validarform: null,
      formComplete: null,
      formulario: {
        titulo: '',
        tipo: '',
        tituloFormulario: '',
        cerrar: null,
        secciones: [],
      },
      content: {
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
    this.propiedades.botones = botones
    return this
  }

  setFormData(data) {
    this.propiedades.formData = data
    return this
  }

  setValidarForm(fn) {
    this.propiedades.validarform = fn
    return this
  }

  setFormComplete(value) {
    this.propiedades.formComplete = value
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



export class FormBuilder {
  constructor(structureName, structure) {
    this.structureName = structureName
    this.structure = structure
    this.campos = []
  }

  // Añadir un campo al formulario
  addField(fieldBuilder) {
    const field = fieldBuilder.build()
    this.campos.push(field)
    return this
  }

  // Obtener estructura base del formulario
  build() {
    return {
      [this.structureName]: { ...this.structure, campos: this.campos, },
    }
  }
}


export class FormFieldBuilder extends FormBuilder {
  constructor(type) {
    super() // hereda pero no requiere nombre de estructura aquí
    this.field = {
      type,
      placeholder: '',
      id: '',
      name: '',
      tamaño: 'w-full',
      modelValue: null,
      options: [],
      seleccionarItem: null,
      opciones: [],
      disabled: false,
      error: '',
      info: '',
      contenido: '',
      icon: ''
    }
  }

  setId(id) {
    this.field.id = id
    return this
  }

  setName(name) {
    this.field.name = name
    return this
  }

  setPlaceholder(text) {
    this.field.placeholder = text
    return this
  }

  setModelValue(value) {
    this.field.modelValue = value
    return this
  }

  setOptions(options) {
    this.field.options = options
    return this
  }

  setOpcionesBusqueda(opciones) {
    this.field.opciones = opciones
    return this
  }

  setSeleccionarItem(fn) {
    this.field.seleccionarItem = fn
    return this
  }

  setTamaño(size) {
    this.field.tamaño = size
    return this
  }

  setDisabled(disabled) {
    this.field.disabled = disabled
    return this
  }

  setError(msg) {
    this.field.error = msg
    return this
  }

  setInfo(msg) {
    this.field.info = msg
    return this
  }

  build() {
    return this.field
  }
}
