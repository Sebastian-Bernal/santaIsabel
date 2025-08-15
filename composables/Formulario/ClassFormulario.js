// Clase base para construir formularios completos
export class FormBuilder {
  constructor(structureName, structure) {
    this.structureName = structureName
    this.structure = structure
    this.fields = {}
  }

  // Añadir un campo al formulario
  addField(fieldBuilder) {
    const field = fieldBuilder.build()
    this.fields[field.name || field.id] = field
    return this
  }

  // Obtener estructura base del formulario
  build() {
    return {
      [this.structureName]: { ...this.structure, ...this.getInitialValues() },
    }
  }

  // Extraer valores iniciales de los fields creados
  getInitialValues() {
    const values = {}
    Object.keys(this.fields).forEach((key) => {
      values[key] = this.fields[key].modelValue ?? ''
    })
    return values
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
