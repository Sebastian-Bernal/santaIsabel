export class CardBuilder {
    constructor() {
        this.propiedades = {
            header: {
                icon: '',
                iconBG: '',
                title: '',
                subtitle: ''
            },
            body: {
                text: '',
                html: ''
            },
            footer: {
                status: '',
                statusClass: '',
                buttons: []
            },
            tamaño: '',
            estilos: '',
            // show: false,
        }
    }

    setTamaño(tamaño) {
        this.propiedades.tamaño = tamaño
        return this
    }

    setEstilos(estilos) {
        this.propiedades.estilos = estilos
        return this
    }

    setheaderIcon(icon) {
        this.propiedades.header.icon = icon
        return this
    }

    setheaderIconBG(iconBG) {
        this.propiedades.header.iconBG = iconBG
        return this
    }

    setheaderTitle(title) {
        this.propiedades.header.title = title
        return this
    }

    setbodyText(text) {
        this.propiedades.body.text = text
        return this
    }

    setbodyHtml(html) {
        this.propiedades.body.html = html
        return this
    }

    setfooterStatus(status) {
        this.propiedades.footer.status = status
        return this
    }

    setfooterStatusClass(statusClass) {
        this.propiedades.footer.statusClass = statusClass
        return this
    }

    setfooterButtons(buttons) {
        this.propiedades.footer.buttons = buttons
        return this
    }

    build() {
        return this.propiedades
    }
}