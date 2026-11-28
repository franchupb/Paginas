/* ==========================================================
   HORIZONTE FEMENINO · CONFIGURACIÓN CENTRAL DE USUARIOS Y PERMISOS
   La autenticación y los perfiles se validan con Firebase.
   Esta matriz central define roles, categorías y restricciones
   de interfaz. La seguridad de datos requiere además reglas
   equivalentes en Firestore.
========================================================== */
(function () {
  "use strict";

  const LOGIN_URL = "HORIZONTE - Login.html";
  const INICIO_URL = "HORIZONTE - Página principal.html";
  const normalizar = value => String(value ?? "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[\s._-]+/g, "").trim();

  // ÚNICO LUGAR PARA CONFIGURAR USUARIOS Y SUS PERMISOS.
  // Las contraseñas nunca se guardan aquí: las administra Firebase Authentication.
  // Los perfiles de HORIZONTE se administran en Firestore (usuarios/{uid}).
  // No se almacenan contraseñas ni hace falta editar este archivo para sumar usuarios.
  const USUARIOS = Object.freeze({});;

  const PAGINAS_JUGADORAS = new Set([
    "HORIZONTE - Página principal.html",
    "horizonte-paginaprincipal.html",
    "horizonte-jugadoras.html",
    "horizonte-asistencia.html",
    "horizonte-calendario.html",
    "horizonte-gimnasio.html",
    "horizonte-partidos.html",
    "horizonte-testeos.html",
    "horizonte-pruebas.html",
    "horizonte-encuestas.html",
    "horizonte-estadisticas.html"
  ]);

  const DIVISIONES = {
    primeramasc: "Primera Masc",
    primeromasculino: "Primera Masc",
    primerafem: "Primera Fem",
    primerafemenina: "Primera Fem",
    reservamasc: "Reserva Masc",
    reservamasculino: "Reserva Masc",
    reservafem: "Reserva Fem",
    reservafemenina: "Reserva Fem"
  };
  function normalizarDivision(value) {
    const key = String(value || "").normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return DIVISIONES[key] || null;
  }
  function categoriaDeTexto(value) {
    const direct = normalizarDivision(value);
    if (direct) return direct;
    const match = String(value || "").match(/(?:^|[^a-z0-9])(primera\s*(?:masc(?:ulino)?|fem(?:enina)?)|reserva\s*(?:masc(?:ulino)?|fem(?:enina)?))(?:$|[^a-z0-9])/i);
    return match ? normalizarDivision(match[1]) : null;
  }
  function normalizarNombreArchivo(value) {
    let archivo = String(value || "").split(/[?#]/)[0].split("/").pop() || "";
    try { archivo = decodeURIComponent(archivo); } catch (_) {}
    return archivo.toLowerCase().replace(/\s+/g, "");
  }
  function paginaActual() {
    return normalizarNombreArchivo(location.pathname);
  }

  function mostrarErrorInicializacion(error, tituloMensaje, detalleMensaje, enlaceAccion = null) {
    console.error("HORIZONTE: no se pudo completar la validación de permisos.", error);
    document.documentElement.classList.remove("horizonte-permisos-pendientes");
    const pantalla = document.createElement("main");
    pantalla.setAttribute("role", "alert");
    pantalla.style.cssText = "min-height:100vh;display:grid;place-items:center;padding:24px;background:#f4f5f7;font-family:Arial,sans-serif;color:#171717";
    const tarjeta = document.createElement("section");
    tarjeta.style.cssText = "width:min(100%,520px);padding:28px;border:1px solid #e8e8e8;border-radius:16px;background:#fff;box-shadow:0 8px 30px #0000000d";
    const titulo = document.createElement("h1");
    titulo.textContent = tituloMensaje || "No se pudieron verificar tus permisos";
    titulo.style.cssText = "margin:0 0 10px;font-size:21px";
    const detalle = document.createElement("p");
    detalle.textContent = detalleMensaje || "Tu sesión no se cerró. Por seguridad, esta página no se mostró porque no se pudo completar su inicialización. Revisá tu conexión y volvé a intentar.";
    detalle.style.cssText = "margin:0 0 20px;color:#747474;line-height:1.55;font-size:14px";
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = "Reintentar";
    boton.style.cssText = "border:0;border-radius:9px;padding:11px 17px;background:#174a7e;color:#fff;font-weight:700;cursor:pointer";
    boton.addEventListener("click", () => location.reload());
    tarjeta.append(titulo, detalle, boton);
    if (enlaceAccion?.href) {
      const enlace = document.createElement("a");
      enlace.href = enlaceAccion.href;
      enlace.textContent = enlaceAccion.texto || "Continuar";
      enlace.style.cssText = "display:inline-flex;align-items:center;margin:12px 0 0 12px;color:#b94f0b;font-weight:700;font-size:14px;text-decoration:none";
      tarjeta.appendChild(enlace);
    }
    pantalla.appendChild(tarjeta);
    if (document.body) {
      document.body.replaceChildren(pantalla);
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        if (document.body) document.body.replaceChildren(pantalla);
      }, { once: true });
    }
    document.getElementById("horizonte-espera-permisos")?.remove();
  }

  let perfilActivo = null;
  let configActiva = null;
  let observerDOM = null;
  let temporizadorObserverDOM = null;
  let refrescoInicialRealizado = false;
  let permisosAplicadosTrasLayout = false;
  let accesoPaginaDenegado = false;

  function mostrarPerfil() {
    if (!perfilActivo || !configActiva) return;
    const nombre = configActiva.nombre;
    const rolOriginal = normalizar(perfilActivo?.rol || perfilActivo?.tipo || "");
    const rolTexto = rolOriginal === "coordinador"
      ? "Coordinador"
      : rolOriginal === "coordinadora"
        ? "Coordinadora"
        : ({
          admin: "Administrador",
          editor: "Editor",
          coordinadora: "Coordinadora",
          cuerpo_tecnico: "Cuerpo técnico",
          jugadora: "Jugadora"
        })[configActiva.rol] || configActiva.rol;
    ["nombreUsuario", "nombrePerfil", "saludoUsuario"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = nombre;
    });
    ["avatarUsuario", "avatarPerfil"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = (nombre.trim()[0] || "U").toUpperCase();
    });
    ["rolUsuario", "rolPerfil"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = rolTexto;
    });
  }

  function esSelectorCategoria(select) {
    return select && select.tagName === "SELECT" &&
      Array.from(select.options || []).some(o => categoriaDeTexto(o.value) || categoriaDeTexto(o.textContent));
  }
  function aplicarCategorias(root = document) {
    if (!configActiva || configActiva.rol === "admin") return;
    const categoriasPermitidas = new Set(
      (configActiva.categorias || []).map(normalizarDivision).filter(Boolean)
    );
    const selectores = root.querySelectorAll
      ? [...(root.matches?.("select") ? [root] : []), ...root.querySelectorAll("select")]
      : [];

    selectores.forEach(select => {
      if (!esSelectorCategoria(select)) return;
      Array.from(select.options || []).forEach(option => {
        const categoria = categoriaDeTexto(option.value) || categoriaDeTexto(option.textContent);
        const texto = String(option.textContent || "").trim();
        if (categoria && !categoriasPermitidas.has(categoria)) option.remove();
        else if (!categoria && /^(todas|todas las categorías|todas las divisiones|seleccioná una categoría|seleccionar categoría|elegir categoría)$/i.test(texto)) option.remove();
      });

      const opcionesPermitidas = Array.from(select.options || []).filter(option => {
        const categoria = categoriaDeTexto(option.value) || categoriaDeTexto(option.textContent);
        return categoria && categoriasPermitidas.has(categoria);
      });
      if (!opcionesPermitidas.length) {
        select.value = "";
        select.disabled = true;
        select.setAttribute("aria-disabled", "true");
        select.title = "Tu perfil no tiene categorías habilitadas para esta sección.";
        return;
      }

      select.removeAttribute("aria-disabled");
      select.removeAttribute("title");
      if (!opcionesPermitidas.some(option => option.value === select.value)) {
        select.value = opcionesPermitidas[0].value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
      select.disabled = opcionesPermitidas.length === 1;
    });
  }

  document.addEventListener("change", event => {
    const select = event.target;
    if (!configActiva || configActiva.rol === "admin" || !esSelectorCategoria(select)) return;
    const categoria = categoriaDeTexto(select.value) ||
      categoriaDeTexto(select.selectedOptions?.[0]?.textContent);
    const permitidas = new Set((configActiva.categorias || []).map(normalizarDivision).filter(Boolean));
    if (categoria && !permitidas.has(categoria)) {
      const alternativa = Array.from(select.options || []).find(option => {
        const valor = categoriaDeTexto(option.value) || categoriaDeTexto(option.textContent);
        return valor && permitidas.has(valor);
      });
      select.value = alternativa?.value || "";
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
  function esSelectorJugadora(select) {
    return /jugadora|jugador|atleta|plantel/i.test([
      select.id, select.name, select.getAttribute("aria-label"), select.getAttribute("data-field")
    ].join(" "));
  }
  const PALABRAS_BORRADO = /eliminar|borrar|suprimir|quitar|dar de baja/i;
  const PALABRAS_EDICION = /guardar|agregar|añadir|nuevo|crear|editar|modificar|actualizar|importar|cargar|registrar|duplicar|publicar|aplicar|restaurar|reset|save|submit|enviar|confirmar/i;
  const PALABRAS_LECTURA = /cerrar|cancelar|volver|abrir|ver|filtrar|buscar|siguiente|anterior|mes|semana|dia|día|imprimir|descargar|mostrar|ocultar|menu|menú|perfil|sesion|sesión|inicio|pizarra|calendario|estadisticas|estadísticas/i;
  function textoControl(el) {
    return [el.textContent, el.value, el.getAttribute("aria-label"), el.title, el.id, el.name,
      el.className, el.getAttribute("data-accion"), el.getAttribute("data-action"), el.getAttribute("onclick")]
      .filter(Boolean).join(" ").toLowerCase();
  }
  function bloquearAccion(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return false;
  }

  function aplicarSoloLectura(root = document) {
    if (!configActiva || (configActiva.rol !== "jugadora" && configActiva.puedeEditar !== false)) return;
    const pagina = paginaActual();
    if (configActiva.rol !== "jugadora") {
      const controles = [...(root.matches?.("button, input, select, textarea, [contenteditable=true]") ? [root] : []), ...root.querySelectorAll("button, input, select, textarea, [contenteditable=true]")];
      controles.forEach(el => {
        const texto = textoControl(el);
        const id = String(el.id || el.name || el.getAttribute("aria-label") || "").toLowerCase();
        const filtro = el.matches("input, select") && (
          el.type === "search" || el.type === "date" || el.type === "month" ||
          /buscar|busqueda|filtro|categoria|division|fecha|mes|semana|orden|jugadora/i.test(id + " " + texto)
        );
        if (filtro || el.matches("a, [role=tab]")) return;
        if (el.matches("button")) {
          if (!PALABRAS_EDICION.test(texto) && !PALABRAS_BORRADO.test(texto)) return;
          el.disabled = true;
          el.setAttribute("aria-disabled", "true");
        } else if (el.matches("[contenteditable=true]")) {
          el.setAttribute("contenteditable", "false");
        } else if (el.matches("input, textarea, select")) {
          el.disabled = true;
          el.readOnly = true;
        }
        el.classList.add("horizonte-solo-lectura");
      });
      root.querySelectorAll("form").forEach(form => form.addEventListener("submit", bloquearAccion, true));
      return;
    }
    if (pagina === "horizonte-asistencia.html") {
      [...(root.matches?.("button[data-fecha][data-jugadora]") ? [root] : []), ...root.querySelectorAll("button[data-fecha][data-jugadora]")].forEach(el => {
        el.disabled = true;
        el.setAttribute("aria-disabled", "true");
        el.title = "Solo consulta: cada jugadora puede ver sus propias asistencias";
      });
      return;
    }
    if (pagina === "horizonte-jugadoras.html") {
      ["botonAgregar", "modalJugadora"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.hidden = true;
      });
      return;
    }
    if (!["horizonte-calendario.html", "horizonte-partidos.html", "horizonte-gimnasio.html"].includes(pagina)) return;

    const permitidos = new Set([
      "mesAnterior", "mesSiguiente", "categoria", "division", "buscarRutina",
      "busqueda", "filtroDivision", "filtroCompeticion",
      "modalPDF", "modalAgregarPersona", "modalQuitarPersona", "modalCerrarInferior",
      "cerrarModal", "cerrarPerfil"
    ]);

    [...(root.matches?.("button, input, select, textarea, [contenteditable=true]") ? [root] : []), ...root.querySelectorAll("button, input, select, textarea, [contenteditable=true]")].forEach(el => {
      if (permitidos.has(el.id) || el.closest("#controlPersonasRutina")) return;
      const texto = textoControl(el);
      const lectura = el.matches("a, [role=tab]") ||
        (el.matches("button") && (/pdf|imprimir|descargar|abrir|ver/i.test(texto) ||
          (!PALABRAS_EDICION.test(texto) && !PALABRAS_BORRADO.test(texto)))) ||
        (el.matches("input") && (el.type === "search" || /buscar|filtro|fecha|mes|semana|orden/i.test(texto)));
      if (lectura) return;
      if (el.matches("input, textarea, select")) { el.disabled = true; el.readOnly = true; }
      else if (el.matches("[contenteditable=true]")) el.setAttribute("contenteditable", "false");
      else { el.disabled = true; el.setAttribute("aria-disabled", "true"); }
      el.classList.add("horizonte-solo-lectura");
    });

    if (pagina === "horizonte-calendario.html") {
      document.body.classList.add("horizonte-vista-calendario-jugadora");
      const modal = document.getElementById("fondoModal");
      if (modal) {
        modal.classList.remove("visible");
        modal.hidden = true;
      }
    }
    if (pagina === "horizonte-asistencia.html") {
      [...(root.matches?.("button[data-fecha][data-jugadora]") ? [root] : []), ...root.querySelectorAll("button[data-fecha][data-jugadora]")].forEach(el => {
        el.disabled = true;
        el.setAttribute("aria-disabled", "true");
        el.title = "Solo consulta: cada jugadora puede ver sus propias asistencias";
      });
    }

    if (pagina === "horizonte-partidos.html") {
      ["contadorPrimeraMasc", "contadorPrimeraFem", "contadorReservaMasc", "contadorReservaFem"].forEach(id => {
        const contador = document.getElementById(id);
        const tarjeta = contador?.closest(".stat");
        if (tarjeta) tarjeta.hidden = true;
      });
      ["btnNuevo", "btnEliminarModo"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.hidden = true;
      });
      [...(root.matches?.("[data-accion]") ? [root] : []), ...root.querySelectorAll("[data-accion]")].forEach(el => el.remove());
    }

    if (pagina === "horizonte-gimnasio.html") {
      ["panelControlesRutina", "panelEditorRutina", "botonesGestion"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.hidden = true;
      });
      const biblioteca = document.getElementById("panelBiblioteca");
      if (biblioteca) biblioteca.hidden = false;
      [...(root.matches?.("[data-editar-rutina], [data-eliminar-rutina]") ? [root] : []), ...root.querySelectorAll("[data-editar-rutina], [data-eliminar-rutina]")].forEach(el => el.hidden = true);
      ["modalEditar", "modalEliminar"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.hidden = true;
      });
      ["modalPDF", "modalAgregarPersona", "modalQuitarPersona", "controlPersonasRutina"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.hidden = false;
      });
    }
  }
  function aplicarAccesosPagina() {
    if (!configActiva) return;
    const pagina = paginaActual();
    if (Array.isArray(configActiva.paginasPermitidas) && !configActiva.paginasPermitidas.some(x => normalizarNombreArchivo(x) === pagina)) {
      accesoPaginaDenegado = true;
      mostrarErrorInicializacion(new Error("El perfil no tiene acceso a esta sección."), "Acceso restringido", "Tu perfil de HORIZONTE no tiene permiso para entrar en esta página.", { href: INICIO_URL, texto: "Volver al inicio" });
      return false;
    }
    if (Array.isArray(configActiva.paginasPermitidas)) {
      const permitidas = new Set(configActiva.paginasPermitidas.map(normalizarNombreArchivo));
      document.querySelectorAll('a[href]').forEach(a => {
        const file = normalizarNombreArchivo(a.getAttribute("href") || "");
        if (file.endsWith(".html") && !permitidas.has(file)) a.remove();
      });
    }
    if (configActiva.rol === "jugadora" && !PAGINAS_JUGADORAS.has(pagina)) {
      accesoPaginaDenegado = true;
      mostrarErrorInicializacion(
        new Error("El rol jugadora no tiene acceso a esta sección."),
        "Acceso restringido",
        "Tu perfil de jugadora no tiene permiso para entrar en esta página. No te redirigimos automáticamente; podés volver al inicio o revisar el acceso con el administrador.",
        { href: INICIO_URL, texto: "Volver al inicio" }
      );
      return false;
    }
    if (configActiva.rol === "jugadora") {
      document.querySelectorAll('a[href]').forEach(a => {
        const file = (a.getAttribute("href") || "").split(/[?#]/)[0].split("/").pop().toLowerCase();
        if (file.endsWith(".html") && !PAGINAS_JUGADORAS.has(normalizarNombreArchivo(file))) a.remove();
      });
      document.querySelectorAll("#sidebar .grupo-menu").forEach(grupo => {
        const submenu = grupo.querySelector(".submenu");
        const enlaces = submenu ? submenu.querySelectorAll('a[href]') : [];
        if (!enlaces.length) grupo.hidden = true;
      });
      // Gimnasio: mostrar solo biblioteca; se conservan PDF y cantidad de personas al imprimir.
      if (pagina === "horizonte-gimnasio.html") {
        ["panelControlesRutina", "panelEditorRutina", "botonesGestion"].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.hidden = true;
        });
        const biblioteca = document.getElementById("panelBiblioteca");
        if (biblioteca) biblioteca.hidden = false;
        ["modalEditar", "modalEliminar"].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.hidden = true;
        });
      }
      // Testeos: para las jugadoras se muestra exclusivamente la pestaña Estadísticas.
      if (pagina === "horizonte-testeos.html") {
        ["btnTabCarga", "btnTabBiblioteca"].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.hidden = true;
        });
        const carga = document.getElementById("vistaCarga");
        const biblioteca = document.getElementById("vistaBiblioteca");
        const estadisticas = document.getElementById("vistaStats");
        if (carga) { carga.classList.remove("activa"); carga.hidden = true; }
        if (biblioteca) { biblioteca.classList.remove("activa"); biblioteca.hidden = true; }
        if (estadisticas) { estadisticas.classList.add("activa"); estadisticas.hidden = false; }
        document.getElementById("btnTabStats")?.classList.add("activa");
        document.querySelectorAll("button, a, [role=tab]").forEach(el => {
          if (/cargar|nuevo|registrar|agregar|editar|eliminar|testeo|registro/i.test(textoControl(el)) &&
              !/pdf|imprimir|abrir|cerrar/i.test(textoControl(el))) el.hidden = true;
        });
      }
    }
    if (!configActiva.puedeEliminar) {
      document.querySelectorAll("button, a, [role=button]").forEach(el => {
        if (PALABRAS_BORRADO.test(textoControl(el))) el.hidden = true;
      });
    }
    return true;
  }

  function aplicarPermisos() {
    if (!configActiva) return false;
    mostrarPerfil();
    aplicarCategorias();
    aplicarSoloLectura();
    return aplicarAccesosPagina();
  }

  async function iniciarControlFirebase() {
    try {
      const modulo = await import("./HORIZONTE-auth.js?v=20261128-restauracion-sesion1");
      await modulo.observarSesionHORIZONTE(async user => {
        // En algunos navegadores la restauración de la persistencia local puede
        // terminar después del primer evento del observador. No interpretar ese
        // primer null como una sesión cerrada: dar un margen y consultar de nuevo.
        let usuarioAutenticado = user || modulo.auth.currentUser;
        if (!usuarioAutenticado) {
          await new Promise(resolve => setTimeout(resolve, 1200));
          usuarioAutenticado = modulo.auth.currentUser;
        }
        if (!usuarioAutenticado) {
          mostrarErrorInicializacion(
            new Error("Firebase no devolvió un usuario autenticado."),
            "No se pudo confirmar tu sesión",
            "No te redirigimos automáticamente ni modificamos tu sesión. Si acabás de ingresar, probá Reintentar. Si cerraste sesión, podés volver al acceso de HORIZONTE.",
            { href: LOGIN_URL, texto: "Ir al inicio de sesión" }
          );
          return;
        }
        user = usuarioAutenticado;
        try {
          let perfil;
          try {
            perfil = await modulo.obtenerPerfilHORIZONTE(user);
          } catch (errorPerfil) {
            mostrarErrorInicializacion(
              errorPerfil,
              "No se pudo leer tu perfil",
              "La sesión está iniciada, pero no se pudo consultar el perfil de esta cuenta. No cerramos tu sesión ni te enviamos al Login. Revisá la conexión e intentá nuevamente."
            );
            return;
          }
          if (!perfil) {
            mostrarErrorInicializacion(
              new Error("No existe un perfil activo para el usuario autenticado."),
              "Tu cuenta no tiene un perfil habilitado",
              "La sesión está iniciada, pero no encontramos un perfil activo asociado a esta cuenta. No se cerró tu sesión. Contactá al administrador para revisar el perfil."
            );
            return;
          }
          const identidad = String(
            perfil.usuario || String(user.email || "").split("@")[0] ||
            perfil.nombreUsuario || perfil.nombre || "usuario"
          ).trim();
          const rolCrudo = normalizar(perfil.rol || perfil.tipo || "");
          const roles = {
            admin: "admin", administrador: "admin", superadmin: "admin",
            editor: "editor", editora: "editor",
            coordinador: "editor", coordinadora: "editor",
            cuerpotecnico: "cuerpo_tecnico", tecnico: "cuerpo_tecnico",
            tecnica: "cuerpo_tecnico", entrenador: "cuerpo_tecnico",
            entrenadora: "cuerpo_tecnico", preparadorfisico: "cuerpo_tecnico",
            preparador: "cuerpo_tecnico",
            jugadora: "jugadora", jugador: "jugadora"
          };
          const rol = roles[rolCrudo] || null;
          let categorias = perfil.categorias ?? perfil.categoria ?? [];
          if (!Array.isArray(categorias)) categorias = categorias ? [categorias] : [];
          categorias = categorias.map(normalizarDivision).filter(Boolean);
          const todasLasCategorias = ["Primera Masc", "Primera Fem", "Reserva Masc", "Reserva Fem"];
          const permisosAnidados = perfil.permisos && typeof perfil.permisos === "object" ? perfil.permisos : {};
          const permiso = (clave, valorPredeterminado) => {
            if (typeof perfil[clave] === "boolean") return perfil[clave];
            if (typeof permisosAnidados[clave] === "boolean") return permisosAnidados[clave];
            return valorPredeterminado;
          };
          let base = null;
          if (rol && (rol === "admin" || categorias.length > 0)) {
            const nombre = String(perfil.nombre || perfil.nombreCompleto || identidad).trim();
            const paginas = Array.isArray(perfil.paginasPermitidas)
              ? perfil.paginasPermitidas
              : (Array.isArray(perfil.paginas) ? perfil.paginas : null);
            base = {
              usuario: identidad,
              nombre,
              rol,
              categorias: rol === "admin" ? todasLasCategorias : categorias,
              jugadora: String(perfil.jugadora || (rol === "jugadora" ? nombre : "")).trim() || null,
              puedeGestionarUsuarios: permiso("puedeGestionarUsuarios", rol === "admin"),
              puedeEditar: permiso("puedeEditar", ["admin", "editor", "cuerpo_tecnico"].includes(rol)),
              puedeEliminar: permiso("puedeEliminar", rol === "admin"),
              paginasPermitidas: paginas ? paginas.map(String).map(x => x.trim()).filter(Boolean) : null
            };
          }

          if (!base || perfil.activo !== true) {
            mostrarErrorInicializacion(
              new Error("Perfil sin rol reconocido o cuenta inactiva."),
              "No tenés acceso habilitado a esta página",
              "La sesión está iniciada, pero el perfil no tiene un rol reconocido o la cuenta figura inactiva. No te enviamos al Login para evitar un ciclo de redirecciones. Revisá el rol y el estado de tu cuenta."
            );
            return;
          }
          // Este script se carga en el <head>. Firebase puede restaurar la sesión
          // antes de que exista <body>; esperar al DOM evita que un acceso válido
          // termine enviado al Login por un error de inicialización de la interfaz.
          if (document.readyState === "loading") {
            await new Promise(resolve => {
              document.addEventListener("DOMContentLoaded", resolve, { once: true });
            });
          }

          // La matriz de este archivo manda sobre rol y categorías. Firestore solo identifica y habilita la cuenta.
          perfilActivo = perfil;
          configActiva = base;
          document.body?.classList.toggle("horizonte-perfil-jugadora", base.rol === "jugadora");
          // La matriz central es la fuente de verdad también para las páginas
          // que aún conservan controles de compatibilidad locales.
          try {
            localStorage.setItem("usuarioHORIZONTE", String(base.rol === "jugadora" ? (base.jugadora || base.nombre) : (base.usuario || perfil.usuario || base.nombre)));
            localStorage.setItem("nombreHORIZONTE", base.nombre);
            localStorage.setItem("rolHORIZONTE", base.rol);
            localStorage.setItem("categoriasHORIZONTE", JSON.stringify(base.categorias));
            localStorage.setItem("jugadoraHORIZONTE", base.jugadora || "");
            localStorage.setItem("puedeEditarHORIZONTE", String(base.puedeEditar));
            localStorage.setItem("puedeEliminarHORIZONTE", String(base.puedeEliminar));
            localStorage.setItem("puedeGestionarUsuariosHORIZONTE", String(base.puedeGestionarUsuarios));
            if (base.paginasPermitidas) localStorage.setItem("paginasPermitidasHORIZONTE", JSON.stringify(base.paginasPermitidas));
            else localStorage.removeItem("paginasPermitidasHORIZONTE");
          } catch (error) {
            console.warn("No se pudieron sincronizar los permisos locales HORIZONTE:", error);
          }
          window.HORIZONTE_PERMISOS = Object.freeze({
            usuario: base.usuario || perfil.usuario,
            nombre: base.nombre,
            rol: base.rol,
            categorias: [...base.categorias],
            jugadora: base.jugadora || null,
            puedeEditar: base.puedeEditar,
            puedeEliminar: base.puedeEliminar,
            puedeGestionarUsuarios: base.puedeGestionarUsuarios,
            paginasPermitidas: base.paginasPermitidas ? [...base.paginasPermitidas] : null,
            puedeGestionarPruebas: base.puedeEditar && base.rol !== "jugadora"
          });
          if (!aplicarPermisos()) {
            window.HORIZONTE_PERMISOS = null;
            return;
          }
          // Si el layout ya existe, esta aplicación también cubre el menú.
          // Si todavía no existe, se volverá a aplicar una sola vez al terminar.
          permisosAplicadosTrasLayout = !!window.HORIZONTE_LAYOUT_LISTO;
          window.dispatchEvent(new CustomEvent("horizonte-permisos-listos", {
            detail: window.HORIZONTE_PERMISOS
          }));
          if (!refrescoInicialRealizado) {
            refrescoInicialRealizado = true;
            if (paginaActual() === "horizonte-asistencia.html") {
              window.renderizarMatriz?.();
              window.renderizarSeguimientoIndividual?.();
            } else if (paginaActual() === "horizonte-partidos.html") {
              window.renderizarFixture?.();
            } else if (paginaActual() === "horizonte-testeos.html") {
              window.cambiarPestana?.("stats");
            } else if (paginaActual() === "horizonte-calendario.html") {
              window.renderizarCalendario?.();
            }
          }
          // Solo los perfiles con restricciones necesitan vigilar controles que
          // se creen dinámicamente. Se agrupan las mutaciones para no recorrer
          // todo el documento decenas de veces durante un render.
          const necesitaVigilanciaDOM =
            base.rol !== "admin" || base.puedeEliminar === false;

          if (necesitaVigilanciaDOM && !observerDOM) {
            const nodosPendientes = new Set();
            observerDOM = new MutationObserver(mutaciones => {
              mutaciones.forEach(mutacion => {
                mutacion.addedNodes.forEach(nodo => {
                  if (nodo.nodeType === 1) nodosPendientes.add(nodo);
                });
              });
              if (!nodosPendientes.size) return;
              if (temporizadorObserverDOM) clearTimeout(temporizadorObserverDOM);
              temporizadorObserverDOM = setTimeout(() => {
                temporizadorObserverDOM = null;
                const nodos = [...nodosPendientes];
                nodosPendientes.clear();
                const selectoresCategorias = new Set();
                nodos.forEach(nodo => {
                  if (!nodo.isConnected) return;
                  if (nodo.matches?.("select")) selectoresCategorias.add(nodo);
                  const selectorPadre = nodo.closest?.("select");
                  if (selectorPadre) selectoresCategorias.add(selectorPadre);
                  nodo.querySelectorAll?.("select").forEach(select => selectoresCategorias.add(select));
                  aplicarCategorias(nodo);
                  aplicarSoloLectura(nodo);
                  if (!base.puedeEliminar) {
                    const controles = [
                      ...(nodo.matches?.("button, a, [role=button]") ? [nodo] : []),
                      ...nodo.querySelectorAll("button, a, [role=button]")
                    ];
                    controles.forEach(el => {
                      if (PALABRAS_BORRADO.test(textoControl(el))) el.hidden = true;
                    });
                  }
                });
                selectoresCategorias.forEach(select => {
                  if (select.isConnected) aplicarCategorias(select);
                });
              }, 120);
            });
            observerDOM.observe(document.body, { childList: true, subtree: true });
            // Los módulos de cada página pueden reconstruir selectores al recibir
            // horizonte-permisos-listos, antes de crear el observador. Revalidarlos aquí.
            aplicarCategorias(document);
          }
          if (window.HORIZONTE_LAYOUT_LISTO) mostrarPaginaAutorizada();
        } catch (error) {
          mostrarErrorInicializacion(error);
        }
      });
    } catch (error) {
      mostrarErrorInicializacion(error);
    }
  }

  if (/^login\.html$/i.test(paginaActual())) return;

  // En Partidos no ocultamos todo el documento mientras se resuelve la sesión:
  // la pantalla en blanco impedía ver incluso el error real de inicialización.
  // Los permisos de edición/categoría siguen aplicándose al confirmar Firebase.
  const esPaginaPartidos = paginaActual() === "horizonte-partidos.html";
  if (!esPaginaPartidos) {
    document.documentElement.classList.add("horizonte-permisos-pendientes");
    const estiloEspera = document.createElement("style");
    estiloEspera.id = "horizonte-espera-permisos";
    estiloEspera.textContent = "html.horizonte-permisos-pendientes body{visibility:hidden!important}";
    (document.head || document.documentElement).appendChild(estiloEspera);
  }

  function mostrarPaginaAutorizada() {
    if (!configActiva || accesoPaginaDenegado) return;
    if (!permisosAplicadosTrasLayout) {
      if (!aplicarPermisos()) return;
      permisosAplicadosTrasLayout = true;
    }
    document.documentElement.classList.remove("horizonte-permisos-pendientes");
    document.getElementById("horizonte-espera-permisos")?.remove();
  }

  window.addEventListener("horizonte-layout-listo", mostrarPaginaAutorizada, { once: true });
  iniciarControlFirebase();
  if (window.HORIZONTE_LAYOUT_LISTO) mostrarPaginaAutorizada();

  // Respaldo visual: si el layout compartido falla en una página puntual,
  // una cuenta ya autenticada y autorizada no debe quedar con toda la pantalla
  // invisible indefinidamente.
  setTimeout(() => {
    if (configActiva && document.documentElement.classList.contains("horizonte-permisos-pendientes")) {
      console.error("HORIZONTE: el layout no confirmó su inicialización; se habilita la vista autorizada como respaldo.");
      mostrarPaginaAutorizada();
    }
  }, 3500);
})();