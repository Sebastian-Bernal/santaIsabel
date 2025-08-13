export class TablaBuilder {
    constructor() {
        this.tabla = {
            columnas: [],
            headerTabla: {},
            acciones: {},
            datos: {}
        };
    }

    setColumnas(columnas) {
        this.tabla.columnas = columnas;
        return this;
    }

    setHeaderTabla(titulo, descripcion, color, accionAgregar) {
        this.tabla.headerTabla = { titulo, descripcion, color, accionAgregar };
        return this;
    }

    setAcciones(icons, botones = true) {
        this.tabla.acciones = { icons, botones };
        return this;
    }

    setDatos(content) {
        this.tabla.datos = { content };
        return this;
    }

    build() {
        return this.tabla;
    }
};

export class TablaDirector {
    constructor(builder) {
        this.builder = builder;
    }

    construirDesdeFormulario(formData) {
        return this.builder
            .setColumnas(formData.columnas)
            .setHeaderTabla(
                formData.titulo,
                formData.descripcion,
                formData.color,
                formData.accionAgregar
            )
            .setAcciones(formData.acciones.icons, formData.acciones.botones)
            .setDatos(formData.datos)
            .build();
    }
}