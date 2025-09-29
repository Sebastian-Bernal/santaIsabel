export class CardBuilder {
    constructor() {
        this.propiedades = {
            cards: [],
            contenedorCards: '',
            contenedor: '',
            header: {
                title: '',
                subtitle: '',
                html: ''
            },
            tamaño: '',
            estilos: '',
            showFiltros: false,
            filtros: [],
            // show: false,
        }
    }

    setCards(cards) {
        this.propiedades.cards = cards
        return this
    }

    setTamaño(tamaño) {
        this.propiedades.tamaño = tamaño
        return this
    }

    setContenedor(contenedor) {
        this.propiedades.contenedor = contenedor
        return this
    }

    setcontenedorCards(contenedorCards) {
        this.propiedades.contenedorCards = contenedorCards
        return this
    }

    setEstilos(estilos) {
        this.propiedades.estilos = estilos
        return this
    }

    setheaderHtml(html) {
        this.propiedades.header.html = html
        return this
    }

    setheaderTitle(title) {
        this.propiedades.header.title = title
        return this
    }

    setheaderSubTitle(subtitle) {
        this.propiedades.header.subtitle = subtitle
        return this
    }

    setShowFiltros(boolean) {
        this.propiedades.showFiltros = boolean
        return this
    }

    setFiltros(filtros) {
        this.propiedades.filtros = filtros
        return this
    }

    build() {
        return this.propiedades
    }
}