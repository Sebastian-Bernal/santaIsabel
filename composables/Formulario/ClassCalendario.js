// Clase base para construir formularios completos
export class CalendarioBuilder {
  constructor() {
    this.propiedades = {
        citas: [],
        tamaño: '',
        estilos: '',
        show: false,
    }
  }

  setCitas(citas) {
    this.propiedades.citas = citas
    return this
  }

  setTamaño(tamaño) {
    this.propiedades.tamaño = tamaño
    return this
  }

  setEstilos(estilos) {
    this.propiedades.estilos = estilos
    return this
  }

  setShow(boolean) {
    this.propiedades.show = boolean
    return this
  }

  build() {
    return this.propiedades
  }
}

export class CitasBuilder {
  constructor() {
    this.propiedades = {
        citas: [],
        tamaño: '',
        estilos: '',
        show: false,
    }
  }

  setCitas(citas) {
    this.propiedades.citas = citas
    return this
  }

  setTamaño(tamaño) {
    this.propiedades.tamaño = tamaño
    return this
  }

  setEstilos(estilos) {
    this.propiedades.estilos = estilos
    return this
  }

  setShow(boolean) {
    this.propiedades.show = boolean
    return this
  }

  build() {
    return this.propiedades
  }
}