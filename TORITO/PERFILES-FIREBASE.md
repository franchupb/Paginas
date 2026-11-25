# Perfiles de acceso de TORITO

Los usuarios de TORITO se administran en el proyecto Firebase **torito-56078**. No se deben crear en el proyecto de ADIUR.

## 1. Crear la cuenta de acceso

En Firebase Authentication, creá un usuario con correo técnico:

`nombredeusuario@torito-56078.firebaseapp.com`

El nombre de usuario que se escribe en el Login es la parte anterior a `@`. Se admiten letras, números, puntos, guiones y guion bajo.

## 2. Crear el perfil de Firestore

En Firestore, creá la colección `usuarios`. Dentro, creá un documento cuyo ID sea exactamente el **UID** de la cuenta de Firebase Authentication.

Los nombres de los campos distinguen mayúsculas y minúsculas. Usá estos nombres en minúscula:

| Campo | Tipo | Para qué sirve |
|---|---|---|
| `activo` | boolean | Debe ser `true` para permitir el ingreso |
| `usuario` | string | Nombre de usuario del Login |
| `nombre` | string | Nombre que se muestra en el perfil |
| `rol` | string | `admin`, `editor`, `cuerpo_tecnico` o `jugadora` |
| `categorias` | array de strings | Divisiones a las que puede acceder |
| `jugadora` | string | Nombre exacto del plantel, solo para perfiles de jugadora |
| `puedeEditar` | boolean | Permite cargar o modificar información |
| `puedeEliminar` | boolean | Permite eliminar información |
| `puedeGestionarUsuarios` | boolean | Marca el permiso de administración de usuarios |
| `paginasPermitidas` | array de strings | Opcional: limita el perfil a páginas concretas |

Categorías admitidas: `Sub 10`, `Sub 12`, `Sub 14`, `Sub 16` y `Primera`. Los perfiles que no sean administradores deben tener al menos una categoría.

## 3. Ejemplos de perfiles

**Administrador con acceso completo**
```js
{
  activo: true,
  usuario: "fran",
  nombre: "Fran",
  rol: "admin",
  categorias: ["Sub 10", "Sub 12", "Sub 14", "Sub 16", "Primera"],
  puedeEditar: true,
  puedeEliminar: true,
  puedeGestionarUsuarios: true
}
```

**Editor limitado a Primera**
```js
{
  activo: true,
  usuario: "liana",
  nombre: "Liana",
  rol: "editor",
  categorias: ["Primera"],
  puedeEditar: true,
  puedeEliminar: false,
  puedeGestionarUsuarios: false
}
```

**Jugadora con acceso de consulta a su categoría**
```js
{
  activo: true,
  usuario: "nombre_usuario",
  nombre: "Nombre y Apellido",
  rol: "jugadora",
  categorias: ["Sub 14"],
  jugadora: "Nombre y Apellido",
  puedeEditar: false,
  puedeEliminar: false,
  puedeGestionarUsuarios: false
}
```

## 4. Cómo funcionan los filtros

- El administrador puede acceder a todas las categorías.
- Los demás perfiles solo ven las categorías asignadas en `categorias`.
- Si el perfil tiene una sola categoría, el selector queda fijado.
- Si tiene varias, puede cambiar entre esas categorías, pero no acceder a otras.
- Si se completa `paginasPermitidas`, el acceso también queda limitado a esos archivos. Los nombres deben coincidir con los archivos HTML, por ejemplo `TORITO-Partidos.html`.

## Importante sobre la seguridad

Los filtros de la interfaz no reemplazan las reglas de seguridad de Firestore. Las reglas del proyecto TORITO deben exigir una sesión autenticada y validar el UID, el rol y las categorías antes de permitir leer o modificar cada colección. Este archivo no cambia ni publica reglas de Firebase.
