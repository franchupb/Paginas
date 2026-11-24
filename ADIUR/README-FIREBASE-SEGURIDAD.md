# ADIUR · seguridad y sincronización de Firebase

## Estado importante

El archivo `ADIUR/firestore.rules` de esta rama contiene reglas cerradas por cuenta, rol y categoría. **Editar este archivo en GitHub no publica las reglas en Firebase.** Las reglas que estén activas en la consola de Firebase siguen siendo las que controlan el acceso hasta que se publiquen allí.

La regla que se había compartido anteriormente (`allow read, write: if true`) deja la base abierta. No cargues información nueva ni sensible mientras esa regla siga activa.

## Orden seguro de publicación

1. Hacé una exportación/backup de Firestore desde Google Cloud/Firebase antes de cambiar reglas o datos.
2. Integrá esta rama en `master` para que las páginas nuevas y la herramienta de migración estén publicadas.
3. En Firebase Console, abrí **Firestore Database → Rules**, reemplazá las reglas actuales por el contenido de este archivo y publicalas.
4. Iniciá sesión en ADIUR con una cuenta cuyo perfil de Firestore tenga `rol: "admin"` y `activo: true`.
5. Abrí `https://franchupb.github.io/Paginas/ADIUR/ADIUR-migrar-firestore.html` y ejecutá la migración. La herramienta copia planificación, gimnasio y calculadora a las colecciones `planificacionADIUR_categorias`, `gimnasioADIUR_categorias` y `calculadoraADIUR_categorias`; no borra los documentos `principal`.
6. Probá el sitio con una cuenta administradora, una coordinadora, cada cuenta de cuerpo técnico y una cuenta de jugadora. Comprobá que cada una vea únicamente las categorías asignadas y que las acciones de escritura/borrado correspondan a su rol.
7. Conservá los documentos `principal` y `plantel` hasta terminar la verificación. No los borres como parte de esta migración.

Hacé los pasos 2 a 6 en un momento de poco uso: entre la publicación del código y la migración, las páginas nuevas todavía no tendrán los documentos separados por categoría.

## Supuestos que deben coincidir con Firestore

- Los documentos de `usuarios` están guardados con el **UID de Firebase Authentication como ID del documento**.
- Cada perfil tiene `activo: true`, un `rol` reconocido y un array `categorias` con los nombres canónicos: `Sub 10`, `Sub 12`, `Sub 14`, `Sub 16`, `Primera`.
- Los documentos de `jugadoras`, `partidos`, `asistenciaADIUR`, `configuracionAsistenciaADIUR`, `calendarioADIUR`, `tiemposRendimiento`, `lesiones`, `encuestas_periodos` y `encuestas_respuestas` incluyen `categoria`.
- Los documentos de `testeos_adiur` e `informes_partidos` incluyen `division`.
- Los documentos antiguos de planificación, gimnasio y calculadora se encuentran en el documento `principal` de las colecciones originales; las páginas nuevas usan las colecciones terminadas en `_categorias`.

Si alguno de estos puntos no coincide, no publiques las reglas todavía: primero hay que adaptar el esquema real para evitar que una página quede sin acceso.

## Colecciones y permisos previstos

- Administrador y coordinadora: lectura/escritura en las categorías asignadas; borrado de datos del club.
- Cuerpo técnico: lectura/escritura en las categorías asignadas; sin borrado general.
- Jugadora: lectura de las páginas habilitadas y de su/s categoría/s; sin escritura en datos del club.
- Encuestas: las jugadoras autenticadas solo crean su propia respuesta; los enlaces públicos solo aceptan respuestas mientras el período esté abierto.
- Pizarra táctica: guardado privado por UID para cuentas del cuerpo técnico.
- `plantel/jugadoras` y los documentos `principal` antiguos quedan preservados como respaldo; las páginas nuevas no dependen de ellos.

## Comprobaciones pendientes en Firebase Console

Esta rama no puede leer ni publicar tu consola de Firebase. Antes de considerar la migración terminada, hay que confirmar en Firebase Console que las reglas quedaron publicadas, que los IDs de `usuarios` coinciden con los UID de Authentication, que la herramienta creó los documentos de categoría y que las pruebas de acceso de cada rol dan el resultado esperado.
