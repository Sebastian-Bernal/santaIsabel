import {ref} from 'vue';

export const pacientes = ref([
    { nombre: 'Juan Perez', edad: 30, genero: 'Masculino', telefono: '1234567890', eps: 'Coomeva', tipoDocumento: 'cedula', documento: 123456789, fechaModificacion: '2023-10-01' },
    { nombre: 'Ana Lopez', edad: 28, genero: 'Femenino', telefono: '9876543210', eps: 'Sura', tipoDocumento: 'cedula', documento: 126756789, fechaModificacion: '2023-10-01'  },
    { nombre: 'Carlos Martinez', edad: 35, genero: 'Masculino', telefono: '1231231234', eps: 'Compensar', tipoDocumento: 'cedula', documento: 15656789, fechaModificacion: '2023-10-01'  },
    { nombre: 'Laura Hernandez', edad: 22, genero: 'Femenino', telefono: '4564564567', eps: 'Sanitas', tipoDocumento: 'cedula', documento: 12389, fechaModificacion: '2023-10-01'  },
    { nombre: 'Pedro Ramirez', edad: 40, genero: 'Masculino', telefono: '7897897890', eps: 'Nueva EPS', tipoDocumento: 'extranjera', documento: 12056789, fechaModificacion: '2023-10-01'  },
    { nombre: 'Sofia', apellido: 'Torres', edad: 32, genero: 'Femenino', telefono: '3213213210', eps: 'Medimás', tipoDocumento: 'cedula', documento: 1234234, fechaModificacion: '2023-10-01'  },
    { nombre: 'Luis', apellido: 'Gonzalez', edad: 29, genero: 'Masculino', telefono: '6546546543', eps: '', tipoDocumento: 'cedula', documento: 123456789, fechaModificacion: '2023-10-01' },
    { nombre: 'Isabel', apellido: 'Fernandez', edad: 27, genero: 'Femenino', telefono: '1112223333', eps: 'Famisanar', tipoDocumento: 'cedula', documento: 123456789, fechaModificacion: '2023-10-01'  },
    { nombre: 'Andres', apellido: 'Castro', edad: 31, genero: 'Masculino', telefono: '4445556666', eps: 'Coosalud', tipoDocumento: 'cedula', documento: 123456789, fechaModificacion: '2023-10-01'  },
    { nombre: 'Maria', apellido: 'Gomez', edad: 25, genero: 'Femenino', telefono: '0987654321', eps: 'Nueva EPS', tipoDocumento: 'cedula', documento: 1107837697, fechaModificacion: '2023-10-01' }
]);