# SAN TELMO · Preparación de Firebase / prompt para Gemini

Proyecto destino: `san-telmo-f2155`

Este documento describe el estado del código del sitio y el trabajo que debe hacerse en Firebase Console / Firestore. No contiene contraseñas ni credenciales privadas.

## 1. Referencia de arquitectura

Comparar la implementación de ADIUR en:
- `ADIUR/ADIUR-auth.js`
- `ADIUR/ADIUR-permisos.js`
- `ADIUR/firestore.rules`
- las páginas HTML que inicializan Firestore.

La adaptación de SAN TELMO debe conservar el mismo flujo funcional, pero nunca conectarse al proyecto `adiur-b1913`. SAN TELMO tiene autenticación, permisos, colecciones y almacenamiento separados.

En SAN TELMO:
- `SAN TELMO-auth.js` inicializa Firebase Authentication y Firestore.
- `SAN TELMO-permisos.js` espera la sesión de Firebase, lee `usuarios/{uid}`, valida el perfil activo y aplica permisos/categorías a la interfaz.
- Las páginas de datos usan Firestore del proyecto SAN TELMO.
- La configuración cliente existente utiliza `projectId: san-telmo-f2155`, `authDomain: san-telmo-f2155.firebaseapp.com`, `storageBucket: san-telmo-f2155.firebasestorage.app`, `messagingSenderId: 354872818092` y `appId: 1:354872818092:web:ef71af1c4b16885caa6209`.
- El SDK modular está normalizado en `10.12.2` en las páginas conectadas.

## 2. Autenticación y perfiles

Las cuentas se autentican con Firebase Authentication usando el nombre de usuario transformado a correo técnico por `correoTecnicoSANTELMO()` en `SAN TELMO-auth.js`. No cambiar el formato de las cuentas ni los dos alias especiales Kevin/Kevin_ sin comprobar primero las cuentas existentes en Authentication.

Cada usuario debe tener un documento `usuarios/{uid}`, cuyo ID sea exactamente el UID de Firebase Authentication. Campos que utiliza el sitio:
- `activo`: boolean, debe ser `true`.
- `usuario`: string.
- `nombre`: string.
- `rol`: `admin`, `editor`, `coordinador`, `coordinadora`, `cuerpo_tecnico` o `jugadora`.
- `categorias`: array con una o más de `Sub 10`, `Sub 12`, `Sub 14`, `Sub 16`, `Primera`.
- `jugadora`: nombre exacto de la jugadora, para cuentas de jugadoras.
- `puedeEditar`, `puedeEliminar`, `puedeGestionarUsuarios`: boolean.
- `paginasPermitidas`: array opcional de nombres exactos de archivos HTML.

La aplicación permite a administradores todas las categorías. Los demás perfiles deben quedar limitados a sus categorías asignadas. Las cuentas de jugadoras son de consulta, con la excepción de enviar su respuesta de encuesta cuando corresponda.

## 3. Colecciones que utiliza el código SAN TELMO

Antes de crear colecciones, inspeccionar Firestore y reutilizar las que ya existan. No duplicar ni renombrar datos existentes.

| Colección / documento | Uso en el sitio |
|---|---|
| `usuarios/{uid}` | Perfil y autorización asociado a Firebase Authentication |
| `santelmo_jugadoras` | Plantel principal; lectura en Jugadoras, Asistencia, Informes, Estadísticas, Testeos, Tiempos y Lesiones |
| `santelmo_plantel/jugadoras` | Documento de respaldo/compatibilidad con una lista de jugadoras |
| `santelmo_partidos` | Fixture compartido entre Página Principal, Partidos e Informes |
| `santelmo_asistenciaSANTELMO` | Sesiones y registros de asistencia |
| `santelmo_configuracionAsistenciaSANTELMO` | Configuración de asistencia y días de entrenamiento |
| `santelmo_calculadoraSANTELMO/principal` | Estado de Calculadora |
| `santelmo_planificacionSANTELMO` | Planificación y datos asociados |
| `santelmo_gimnasioSANTELMO/principal` | Rutinas y biblioteca de Gimnasio |
| `santelmo_testeos_santelmo` | Resultados y biblioteca de testeos |
| `santelmo_informes_partidos` | Informes de partidos; fuente actual de Estadísticas |
| `informes_partidos` | Colección histórica/compatibilidad que Estadísticas aún consulta |
| `santelmo_tiemposRendimiento` | Evaluaciones y registros de tiempos |
| `santelmo_lesiones` | Expedientes y seguimiento de lesiones |
| `santelmo_encuestas_periodos` | Períodos publicados de encuestas |
| `santelmo_encuestas_respuestas` | Respuestas de jugadoras y encuestas públicas |

La página de Estadísticas combina `santelmo_informes_partidos` con la colección histórica `informes_partidos`, evitando duplicados por ID. Informes escribe en `santelmo_informes_partidos`.

La antigua pizarra de SAN TELMO utilizaba `santelmo_pizarraTacticaSANTELMO`. La pizarra nueva replica la de ADIUR y es local, igual que el modelo ADIUR; no volver a conectarla a Firestore ni borrar la colección histórica. Calendario también queda local y toma los datos de Planificación/localStorage. Estas dos excepciones son intencionales.

## 4. Revisión de código ya aplicada

- Todas las páginas que se conectan a Firestore usan el proyecto `san-telmo-f2155`; Calendario y la nueva Pizarra táctica no inicializan Firebase.
- La autenticación y la validación central de permisos se mantienen en módulos propios de SAN TELMO.
- Jugadoras ahora lee, actualiza y elimina en la misma colección `santelmo_jugadoras`; se corrigieron dos operaciones que apuntaban por error a la colección antigua `jugadoras`.
- Página Principal reutiliza una instancia Firebase existente del mismo proyecto cuando está disponible.
- Gimnasio quedó en el mismo SDK modular `10.12.2` y reutiliza la instancia del proyecto SAN TELMO.
- La pizarra se reemplazó por el mismo tablero funcional de ADIUR: cancha completa, formaciones propias y rival, fichas arrastrables, herramientas de dibujo, colores, deshacer/rehacer y modo inmersivo; se adaptaron identidad, perfil, navegación y paleta roja de SAN TELMO.

## 5. PROMPT PARA GEMINI

Actuá como especialista senior en Firebase Authentication, Cloud Firestore y Firebase Security Rules. Necesito que revises y prepares el proyecto Firebase **san-telmo-f2155** para que el sitio web SAN TELMO funcione igual de integrado que ADIUR, pero completamente aislado del proyecto de ADIUR.

Repositorio de referencia: `franchupb/Paginas`.
Carpeta de SAN TELMO: `SAN TELMO/`.
Carpeta modelo de ADIUR: `ADIUR/`.

### Reglas de trabajo obligatorias
1. Primero inspeccioná el proyecto Firebase real `san-telmo-f2155`: Authentication, Firestore, colecciones, documentos, campos, reglas actuales e índices. No supongas que una colección está vacía ni que se debe crear.
2. Compará la arquitectura de ADIUR (`ADIUR-auth.js`, `ADIUR-permisos.js`, `firestore.rules` y sus páginas) con la de SAN TELMO (`SAN TELMO-auth.js`, `SAN TELMO-permisos.js` y sus páginas).
3. No conectes SAN TELMO a `adiur-b1913`. No copies el API config de ADIUR. El proyecto correcto es exclusivamente `san-telmo-f2155`.
4. No borres, limpies, sobrescribas masivamente ni migres datos sin presentar primero el plan y verificar el esquema real. Conservá IDs de documentos y datos históricos.
5. No cambies usuarios, contraseñas, UID, correos técnicos ni alias existentes. Nunca expongas contraseñas o tokens.
6. No uses reglas abiertas del tipo `allow read, write: if request.auth != null` para todas las colecciones. Tampoco uses `allow read, write: if true`.
7. No consideres los filtros de la interfaz como seguridad. Las reglas de Firestore deben impedir accesos no autorizados aunque alguien llame directamente al SDK.
8. No afirmes que las reglas quedaron publicadas si solo las redactaste. Separá claramente cambios preparados, pruebas ejecutadas y cambios efectivamente desplegados.

### Autenticación y perfiles
El sitio inicia sesión mediante Firebase Authentication con un correo técnico derivado del nombre de usuario. El módulo `SAN TELMO-auth.js` consulta el documento `usuarios/{uid}` y exige `activo == true`.

Los perfiles utilizan estos campos: `activo`, `usuario`, `nombre`, `rol`, `categorias`, `jugadora`, `puedeEditar`, `puedeEliminar`, `puedeGestionarUsuarios`, `paginasPermitidas`.

Roles admitidos: `admin`, `editor`, `coordinador`, `coordinadora`, `cuerpo_tecnico`, `jugadora`.
Categorías: `Sub 10`, `Sub 12`, `Sub 14`, `Sub 16`, `Primera`.

Implementá reglas coherentes con los permisos del sitio:
- Un usuario autenticado puede obtener únicamente su propio documento `usuarios/{uid}`.
- Solo administración puede listar, crear, modificar o eliminar perfiles de usuarios.
- Solo perfiles activos acceden a datos del club.
- Administración puede acceder a todas las categorías.
- Coordinación y cuerpo técnico acceden únicamente a las categorías asignadas; pueden escribir según sus permisos. La eliminación debe quedar limitada a administración/coordinación, de acuerdo con el perfil y la política del club.
- Jugadoras solo pueden consultar sus datos/categoría autorizada y no pueden modificar plantel, asistencia, partidos, informes, testeos, tiempos, lesiones ni planificación.
- No permitir que una cuenta modifique su propio rol, categorías, estado activo o permisos.

### Colecciones a auditar
Verificá el esquema real y prepará reglas para las colecciones que realmente existan y utilice el código:
`santelmo_jugadoras`, `santelmo_plantel`, `santelmo_partidos`, `santelmo_asistenciaSANTELMO`, `santelmo_configuracionAsistenciaSANTELMO`, `santelmo_calculadoraSANTELMO`, `santelmo_planificacionSANTELMO`, `santelmo_gimnasioSANTELMO`, `santelmo_testeos_santelmo`, `santelmo_informes_partidos`, `informes_partidos` (histórica), `santelmo_tiemposRendimiento`, `santelmo_lesiones`, `santelmo_encuestas_periodos`, `santelmo_encuestas_respuestas`.

La app usa también `santelmo_calculadoraSANTELMO/principal` y `santelmo_gimnasioSANTELMO/principal`. Confirmá los IDs de documento reales antes de definir reglas.

### Restricciones por categoría y consultas
Inspeccioná los documentos para identificar cómo se guarda la categoría: puede aparecer como `categoria`, `division` u otra variante histórica. No inventes campos. Las reglas deben validar el campo real y la app debe realizar consultas compatibles con esas reglas.

Recordá que Firestore Rules no filtra documentos: si una consulta puede devolver documentos de categorías no autorizadas, Firestore la rechazará o la consulta será insegura. Ajustá las consultas para que incluyan filtros de categoría/UID suficientes y probá cada rol con datos de más de una categoría.

Revisá especialmente `santelmo_plantel/jugadoras`: es un documento de respaldo que puede contener listas de varias categorías. No permitas que una jugadora descargue el plantel completo si eso expone otras categorías. Si hace falta, proponé separar el respaldo por categoría sin borrar el documento original hasta aprobar la migración.

### Encuestas públicas
La página Encuestas permite responder mediante un enlace público, sin iniciar sesión, ingresando nombre y apellido. No abras toda la colección a lectura/escritura pública.
- Permitir únicamente la lectura puntual necesaria para mostrar un período publicado y abierto; no permitir listar todos los períodos a visitantes.
- Permitir creación pública únicamente de respuestas válidas vinculadas a un período existente y abierto, validando campos, tipos, tamaños y categoría contra el período.
- No permitir que visitantes anónimos lean respuestas, modifiquen respuestas existentes, eliminen períodos ni cambien su estado.
- Los usuarios autenticados de CT/coordinación deben poder administrar períodos y consultar respuestas de las categorías autorizadas.
- Las jugadoras autenticadas solo deben acceder a las acciones que el código permite.
- Revisá el código de Encuestas para identificar todos los campos reales antes de escribir estas reglas.

### Informes históricos
Estadísticas consulta `santelmo_informes_partidos` y también `informes_partidos` como compatibilidad histórica. Informes escribe en `santelmo_informes_partidos`; puede intentar eliminar el ID correspondiente de la colección histórica cuando se borra explícitamente un informe. Conservá los datos históricos y habilitá únicamente las operaciones necesarias para los roles autorizados.

### Excepciones deliberadas
- `SAN TELMO-calendario.html`: no conectarlo directamente a Firestore; utiliza Planificación/localStorage según el diseño actual.
- `SAN TELMO-pizarra.html`: replica la pizarra local de ADIUR y no debe conectarse a Firestore. No borres la colección antigua `santelmo_pizarraTacticaSANTELMO`; solo dejala sin uso por la página nueva.

### Índices, pruebas y entrega
1. Revisá las consultas `where`, `orderBy`, combinaciones de filtros y listeners `onSnapshot` de todas las páginas.
2. Creá únicamente los índices compuestos que realmente requieran las consultas. Entregá el archivo `firestore.indexes.json` si corresponde.
3. Prepará reglas Firestore completas, con denegación por defecto, funciones reutilizables para usuario activo/rol/categoría y sin solapamientos que permitan saltarse restricciones.
4. Probá con Emulator Suite o Rules Playground: admin, editor, coordinador/a, cuerpo técnico, jugadora de cada categoría, usuario inactivo, usuario sin perfil, usuario no autenticado y visitante de encuesta pública.
5. Probá lectura, creación, actualización y eliminación en cada colección, incluyendo intentos de leer/escribir otra categoría y modificar perfiles ajenos.
6. Verificá que las consultas reales de las páginas no fallen por las nuevas reglas y que las respuestas públicas no puedan leerse desde fuera.
7. Entregá el contenido completo de las reglas, los índices necesarios, los resultados de pruebas y los pasos exactos para desplegar. Antes de publicar reglas en producción, mostrámelas y explicá cualquier cambio que pueda bloquear operaciones existentes.

El objetivo es que SAN TELMO use su propia nube `san-telmo-f2155` con la misma lógica funcional de ADIUR, manteniendo los datos y usuarios separados y reforzando el control real desde Firestore.
