# TORITO · autenticación, permisos y Firebase

## Estado de esta rama

Esta rama prepara la autenticación de TORITO con Firebase Authentication y perfiles de Firestore. No cambia ni migra documentos existentes y no publica reglas en Firebase.

- Proyecto esperado: `torito-56078`.
- Perfiles: colección `usuarios`, documento identificado por el UID de Firebase Authentication.
- Cada perfil debe tener `activo: true`, un `rol` válido y un array `categorias`.
- Las categorías válidas son `Sub 10`, `Sub 12`, `Sub 14`, `Sub 16` y `Primera`.
- Los permisos de interfaz no sustituyen las reglas de Firestore.

## Preparación necesaria en Firebase Console

1. Hacer una copia de seguridad de Firestore antes de cambiar reglas o datos.
2. Crear las cuentas de Fran y Liana en Firebase Authentication. El formulario usa el identificador técnico `<usuario>@torito-56078.firebaseapp.com`; la contraseña se configura directamente en Firebase y nunca se guarda en este repositorio.
3. Crear `usuarios/{UID}` para cada cuenta, usando el UID real que muestra Authentication.
4. Perfil inicial recomendado para Fran:
   - `usuario: "fran"`
   - `nombre: "Fran"`
   - `rol: "admin"`
   - `activo: true`
   - `categorias: ["Sub 10", "Sub 12", "Sub 14", "Sub 16", "Primera"]`
   - `puedeEditar: true`, `puedeEliminar: true`, `puedeGestionarUsuarios: true`
5. Perfil inicial de Liana, con mínimo privilegio hasta confirmar si debe editar:
   - `usuario: "liana"`
   - `nombre: "Liana"`
   - `rol: "cuerpo_tecnico"`
   - `activo: true`
   - `categorias: ["Primera"]`
   - `puedeEditar: false`, `puedeEliminar: false`, `puedeGestionarUsuarios: false`

No pegues contraseñas, tokens ni claves privadas en GitHub o en el chat. Si las credenciales anteriores estaban escritas en un HTML publicado, cambialas en los servicios donde se reutilicen.

## Datos que todavía requieren migración por categoría

El código actual guarda datos de varias categorías juntos en documentos o claves compartidas, por ejemplo planificación y gimnasio en documentos `principal`, y datos de calculadora, calendario y encuestas en almacenamiento local. Esos formatos no permiten aplicar de forma segura una regla de acceso exclusivo a Primera. Antes de habilitar reglas estrictas, hay que separar los datos por categoría mediante una migración que conserve los originales y verifique conteos y contenido.

## Limitación de publicación

Subir `firestore.rules` a GitHub no publica las reglas en Firebase. La publicación y la verificación final requieren acceso a Firebase Console o a un entorno autorizado de Firebase CLI. Esta rama no ejecuta ninguna operación sobre la base real.
