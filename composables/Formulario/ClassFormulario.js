export class ComponenteBuilder {
  constructor() {
    this.propiedades = {
      fondo: '',
      estilos: '',
      layout: '',
      header: '',
      contenedor: '',
      componentes: [],
    }
  }

  setFondo(fondo = 'FondoDefault') {
    this.propiedades.fondo = fondo
    return this
  }

  setEstilos(estilos) {
    this.propiedades.estilos = estilos
    return this
  }

  setLayout(layout) {
    this.propiedades.layout = layout
    return this
  }

  setHeaderPage(header) {
    this.propiedades.header = header
    return this
  }

  setContenedor(contenedor) {
    this.propiedades.contenedor = contenedor
    return this
  }

  addComponente(tipo, input) {
    let componente;

    // Si el input tiene un método build, asumimos que es un builder
    if (input && typeof input.build === 'function') {
      componente = input.build();
    } else if (input && typeof input === 'object') {
      // Si ya es un objeto, lo usamos directamente
      componente = input;
    } else {
      throw new Error('El componente debe ser un objeto o tener un método build()');
    }

    componente.tipo = tipo;
    this.propiedades.componentes.push(componente);
    return this;

  }

  // addComponente(tipo, config) {
  //   let componente

  //   switch (tipo) {
  //     case 'formulario':
  //       componente = new Formulario(config)
  //       break
  //     case 'tabla':
  //       componente = new Tabla(config)
  //       break
  //     case 'calendario':
  //       componente = new Calendario(config)
  //       break
  //     // Agrega más tipos según lo necesites
  //     default:
  //       throw new Error(`Tipo de componente desconocido: ${tipo}`)
  //   }

  //   this.propiedades.componentes.push(componente)
  //   return this

  // }

  build() {
    return this.propiedades
  }


}


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
        show: false,
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
      seccionActual: []
    },
    this.seccionActual
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

  setFormularioShow(show) {
    this.propiedades.formulario.show = show
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

  nuevaSeccion(nombre, descripcion = '') {
    const seccion = {
      nombre,
      descripcion,
      campos: []
    };
    this.propiedades.formulario.secciones.push(seccion);
    this.propiedades.seccionActual = seccion;
    return this;
  }

  addCampo(campo) {
    if (this.propiedades.seccionActual) {
      this.propiedades.seccionActual.campos.push(campo);
    } else {
      console.warn('No hay sección activa. Usa .nuevaSeccion(nombre) antes de agregar campos.');
    }
    return this;
  }


  build() {
    return this.propiedades
  }
}

const tamañosDisponibles = {
  LG: 'lg:w-[70%] md:w-[85%] md:h-[85%] w-[90%] h-[90%]',
  XS: 'md:w-[65%] md:h-[70%] w-[90%] h-[80%]',
}