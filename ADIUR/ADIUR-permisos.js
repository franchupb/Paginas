/* ==========================================================
   ADIUR FEMENINO · CONFIGURACIÓN CENTRAL DE USUARIOS Y PERMISOS
   La autenticación y los perfiles se validan con Firebase.
   Esta matriz central define roles, categorías y restricciones
   de interfaz. La seguridad de datos requiere además reglas
   equivalentes en Firestore.
========================================================== */
(function () {
  "use strict";

  const LOGIN_URL = "ADIUR-Loing.html";
  const INICIO_URL = "ADIUR-Pagina Principal.html";
  const normalizar = value => String(value ?? "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[\s._-]+/g, "").trim();

  // ÚNICO LUGAR PARA CONFIGURAR USUARIOS Y SUS PERMISOS.
  // Las contraseñas nunca se guardan aquí: las administra Firebase Authentication.
  const USUARIOS = Object.freeze({
    fran: {
      nombre: "Fran", rol: "admin",
      categorias: ["Sub 10", "Sub 12", "Sub 14", "Sub 16", "Primera"],
      puedeGestionarUsuarios: true, puedeEditar: true, puedeEliminar: true
    },
    maylen: {
      nombre: "Maylen", rol: "coordinadora",
      categorias: ["Sub 10", "Sub 12", "Sub 14", "Sub 16", "Primera"],
      puedeGestionarUsuarios: false, puedeEditar: true, puedeEliminar: true
    },
    darlen: {
      nombre: "Darlen", rol: "coordinadora",
      categorias: ["Sub 10", "Sub 12", "Sub 14", "Sub 16", "Primera"],
      puedeGestionarUsuarios: false, puedeEditar: true, puedeEliminar: true
    },
    toto: {
      nombre: "Toto", rol: "cuerpo_tecnico",
      categorias: ["Sub 16", "Primera"],
      puedeGestionarUsuarios: false, puedeEditar: true, puedeEliminar: false
    },
    tincho: {
      nombre: "Tincho", rol: "cuerpo_tecnico",
      categorias: ["Sub 14", "Primera"],
      puedeGestionarUsuarios: false, puedeEditar: true, puedeEliminar: false
    },
    lucas: {
      nombre: "Lucas", rol: "cuerpo_tecnico",
      categorias: ["Primera"],
      puedeGestionarUsuarios: false, puedeEditar: true, puedeEliminar: false
    },
    guadaluped: {
      nombre: "Guadalupe Demaria", usuario: "Guadalupe_D",
      rol: "jugadora", categorias: ["Sub 16"], jugadora: "Guadalupe Demaria",
      puedeGestionarUsuarios: false, puedeEditar: false, puedeEliminar: false
    },
    jazmind: {
      nombre: "Jazmin De Nicola Forte", usuario: "Jazmin_D",
      rol: "jugadora", categorias: ["Sub 16"], jugadora: "Jazmin De Nicola Forte",
      puedeGestionarUsuarios: false, puedeEditar: false, puedeEliminar: false
    }
  });

  const PAGINAS_JUGADORAS = new Set([
    "adiur-pagina principal.html",
    "adiur-jugadoras.html",
    "adiur-asistencia.html",
    "adiur-calendario.html",
    "adiur-gimnasio.html",
    "adiur-partidos.html",
    "adiur-testeos.html",
    "adiur-pruebas.html",
    "adiur-encuestas.html",
    "adiur-estadisticas.html"
  ]);

  const DIVISIONES = {
    sub10: "Sub 10", s10: "Sub 10", u10: "Sub 10",
    sub12: "Sub 12", s12: "Sub 12", u12: "Sub 12",
    sub14: "Sub 14", s14: "Sub 14", u14: "Sub 14",
    sub16: "Sub 16", s16: "Sub 16", u16: "Sub 16",
    primera: "Primera"
  };
  function normalizarDivision(value) {
    const key = String(value || "").normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return DIVISIONES[key] || null;
  }
  function categoriaDeTexto(value) {
    const direct = normalizarDivision(value);
    if (direct) return direct;
    const match = String(value || "").match(/(?:^|[^a-z0-9])(sub\s*10|sub\s*12|sub\s*14|sub\s*16|s10|s12|s14|s16|primera)(?:$|[^a-z0-9])/i);
    return match ? normalizarDivision(match[1]) : null;
  }
  function paginaActual() {
    return decodeURIComponent(location.pathname.split("/").pop() || "").toLowerCase();
  }

  function mostrarErrorInicializacion(error, tituloMensaje, detalleMensaje) {
    console.error("ADIUR: no se pudo completar la validación de permisos.", error);
    document.documentElement.classList.remove("adiur-permisos-pendientes");
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
    boton.style.cssText = "border:0;border-radius:9px;padding:11px 17px;background:#f47721;color:#fff;font-weight:700;cursor:pointer";
    boton.addEventListener("click", () => location.reload());
    tarjeta.append(titulo, detalle, boton);
    pantalla.appendChild(tarjeta);
    if (document.body) {
      document.body.replaceChildren(pantalla);
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        if (document.body) document.body.replaceChildren(pantalla);
      }, { once: true });
    }
    document.getElementById("adiur-espera-permisos")?.remove();
  }

  let perfilActivo = null;
  let configActiva = null;
  let observerDOM = null;
  let temporizadorObserverDOM = null;
  let refrescoInicialRealizado = false;
  let permisosAplicadosTrasLayout = false;

  function mostrarPerfil() {
    if (!perfilActivo || !configActiva) return;
    const nombre = configActiva.nombre;
    const rolTexto = ({
      admin: "Administrador",
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
    if (!configActiva || !["jugadora", "cuerpo_tecnico"].includes(configActiva.rol)) return;
    const categoriasPermitidas = new Set(
      (configActiva.categorias || []).map(normalizarDivision).filter(Boolean)
    );
    if (!categoriasPermitidas.size) return;

    const selectores = root.querySelectorAll ? [ ...(root.matches?.("select") ? [root] : []), ...root.querySelectorAll("select") ] : [];
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
      if (!opcionesPermitidas.length) return;
      if (!opcionesPermitidas.some(option => option.value === select.value)) {
        select.value = opcionesPermitidas[0].value;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
      // Un perfil con una sola categoría no puede cambiarla; el CT
      // con varias puede alternar únicamente entre las divisiones asignadas.
      select.disabled = opcionesPermitidas.length === 1;
    });
  }
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
  function aplicarSoloLectura(root = document) {
    if (configActiva?.rol !== "jugadora") return;
    const pagina = paginaActual();
    if (pagina === "adiur-asistencia.html") {
      [...(root.matches?.("button[data-fecha][data-jugadora]") ? [root] : []), ...root.querySelectorAll("button[data-fecha][data-jugadora]")].forEach(el => {
        el.disabled = true;
        el.setAttribute("aria-disabled", "true");
        el.title = "Solo consulta: cada jugadora puede ver sus propias asistencias";
      });
      return;
    }
    if (pagina === "adiur-jugadoras.html") {
      ["botonAgregar", "modalJugadora"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.hidden = true;
      });
      return;
    }
    if (!["adiur-calendario.html", "adiur-partidos.html", "adiur-gimnasio.html"].includes(pagina)) return;

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
      el.classList.add("adiur-solo-lectura");
    });

    if (pagina === "adiur-calendario.html") {
      document.body.classList.add("adiur-vista-calendario-jugadora");
      const modal = document.getElementById("fondoModal");
      if (modal) {
        modal.classList.remove("visible");
        modal.hidden = true;
      }
    }
    if (pagina === "adiur-asistencia.html") {
      [...(root.matches?.("button[data-fecha][data-jugadora]") ? [root] : []), ...root.querySelectorAll("button[data-fecha][data-jugadora]")].forEach(el => {
        el.disabled = true;
        el.setAttribute("aria-disabled", "true");
        el.title = "Solo consulta: cada jugadora puede ver sus propias asistencias";
      });
    }

    if (pagina === "adiur-partidos.html") {
      ["contadorSub10", "contadorSub12", "contadorSub14", "contadorPrimera"].forEach(id => {
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

    if (pagina === "adiur-gimnasio.html") {
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
    if (configActiva.rol === "jugadora" && !PAGINAS_JUGADORAS.has(pagina)) {
      location.replace(INICIO_URL);
      return;
    }
    if (configActiva.rol === "jugadora") {
      document.querySelectorAll('a[href]').forEach(a => {
        const file = (a.getAttribute("href") || "").split(/[?#]/)[0].split("/").pop().toLowerCase();
        if (file.endsWith(".html") && !PAGINAS_JUGADORAS.has(file)) a.remove();
      });
      document.querySelectorAll("#sidebar .grupo-menu").forEach(grupo => {
        const submenu = grupo.querySelector(".submenu");
        const enlaces = submenu ? submenu.querySelectorAll('a[href]') : [];
        if (!enlaces.length) grupo.hidden = true;
      });
      // Gimnasio: mostrar solo biblioteca; se conservan PDF y cantidad de personas al imprimir.
      if (pagina === "adiur-gimnasio.html") {
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
      if (pagina === "adiur-testeos.html") {
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
    if (configActiva.rol === "cuerpo_tecnico") {
      document.querySelectorAll("button, a, [role=button]").forEach(el => {
        if (PALABRAS_BORRADO.test(textoControl(el))) el.hidden = true;
      });
    }
  }

  function aplicarPermisos() {
    if (!configActiva) return;
    mostrarPerfil();
    aplicarCategorias();
    aplicarSoloLectura();
    aplicarAccesosPagina();
  }

  async function iniciarControlFirebase() {
    try {
      const modulo = await import("./ADIUR-auth.js?v=20261123-authpersist1");
      await modulo.observarSesionADIUR(async user => {
        if (!user) {
          location.replace(LOGIN_URL);
          return;
        }
        try {
          let perfil;
          try {
            perfil = await modulo.obtenerPerfilADIUR(user);
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
          const clavesIdentidad = [
            perfil.usuario,
            String(user.email || "").split("@")[0],
            perfil.nombreUsuario,
            perfil.nombre
          ].map(normalizar).filter(Boolean);
          let base = clavesIdentidad.map(clave => USUARIOS[clave]).find(Boolean) || null;

          // Compatibilidad con perfiles de Firestore ya creados con variantes
          // de nombre/rol. No se expulsa una cuenta activa solo porque su
          // identificador no coincida literalmente con la clave de la matriz.
          if (!base && perfil.activo === true) {
            const rolCrudo = normalizar(perfil.rol || perfil.tipo || "");
            const roles = {
              admin: "admin", administrador: "admin",
              coordinadora: "coordinadora", coordinador: "coordinadora",
              cuerpotecnico: "cuerpo_tecnico", tecnico: "cuerpo_tecnico",
              jugadora: "jugadora"
            };
            const rol = roles[rolCrudo] || null;
            let categorias = perfil.categorias ?? perfil.categoria ?? [];
            if (!Array.isArray(categorias)) categorias = categorias ? [categorias] : [];
            categorias = categorias.map(normalizarDivision).filter(Boolean);
            if (rol && (rol === "admin" || rol === "coordinadora" || categorias.length)) {
              const nombre = String(perfil.nombre || perfil.nombreCompleto || perfil.usuario || user.email?.split("@")[0] || "Usuario").trim();
              base = {
                usuario: String(perfil.usuario || user.email?.split("@")[0] || clavesIdentidad[0] || "usuario"),
                nombre,
                rol,
                categorias: rol === "admin" || rol === "coordinadora"
                  ? ["Sub 10", "Sub 12", "Sub 14", "Sub 16", "Primera"]
                  : categorias,
                jugadora: perfil.jugadora || (rol === "jugadora" ? nombre : null),
                puedeGestionarUsuarios: rol === "admin",
                puedeEditar: ["admin", "coordinadora", "cuerpo_tecnico"].includes(rol),
                puedeEliminar: ["admin", "coordinadora"].includes(rol)
              };
            }
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
          document.body?.classList.toggle("adiur-perfil-jugadora", base.rol === "jugadora");
          // La matriz central es la fuente de verdad también para las páginas
          // que aún conservan controles de compatibilidad locales.
          try {
            localStorage.setItem("usuarioADIUR", String(perfil.usuario || base.usuario || base.nombre));
            localStorage.setItem("rolADIUR", base.rol);
            localStorage.setItem("categoriasADIUR", JSON.stringify(base.categorias));
          } catch (error) {
            console.warn("No se pudieron sincronizar los permisos locales ADIUR:", error);
          }
          window.ADIUR_PERMISOS = Object.freeze({
            usuario: base.usuario || perfil.usuario,
            nombre: base.nombre,
            rol: base.rol,
            categorias: [...base.categorias],
            jugadora: base.jugadora || null,
            puedeEditar: base.puedeEditar,
            puedeEliminar: base.puedeEliminar,
            puedeGestionarUsuarios: base.puedeGestionarUsuarios
          });
          aplicarPermisos();
          // Si el layout ya existe, esta aplicación también cubre el menú.
          // Si todavía no existe, se volverá a aplicar una sola vez al terminar.
          permisosAplicadosTrasLayout = !!window.ADIUR_LAYOUT_LISTO;
          window.dispatchEvent(new CustomEvent("adiur-permisos-listos", {
            detail: window.ADIUR_PERMISOS
          }));
          if (!refrescoInicialRealizado) {
            refrescoInicialRealizado = true;
            if (paginaActual() === "adiur-asistencia.html") {
              window.renderizarMatriz?.();
              window.renderizarSeguimientoIndividual?.();
            } else if (paginaActual() === "adiur-partidos.html") {
              window.renderizarFixture?.();
            } else if (paginaActual() === "adiur-testeos.html") {
              window.cambiarPestana?.("stats");
            } else if (paginaActual() === "adiur-calendario.html") {
              window.renderizarCalendario?.();
            }
          }
          // Solo los perfiles con restricciones necesitan vigilar controles que
          // se creen dinámicamente. Se agrupan las mutaciones para no recorrer
          // todo el documento decenas de veces durante un render.
          const necesitaVigilanciaDOM =
            base.rol === "cuerpo_tecnico" ||
            (base.rol === "jugadora" && paginaActual() !== "adiur-gimnasio.html");

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
                nodos.forEach(nodo => {
                  if (!nodo.isConnected) return;
                  aplicarCategorias(nodo);
                  aplicarSoloLectura(nodo);
                  if (base.rol === "cuerpo_tecnico") {
                    const controles = [
                      ...(nodo.matches?.("button, a, [role=button]") ? [nodo] : []),
                      ...nodo.querySelectorAll("button, a, [role=button]")
                    ];
                    controles.forEach(el => {
                      if (PALABRAS_BORRADO.test(textoControl(el))) el.hidden = true;
                    });
                  }
                });
              }, 120);
            });
            observerDOM.observe(document.body, { childList: true, subtree: true });
          }
          if (window.ADIUR_LAYOUT_LISTO) mostrarPaginaAutorizada();
        } catch (error) {
          mostrarErrorInicializacion(error);
        }
      });
    } catch (error) {
      mostrarErrorInicializacion(error);
    }
  }

  if (/^(index|loing)\.html$/i.test(paginaActual())) return;

  // En Partidos no ocultamos todo el documento mientras se resuelve la sesión:
  // la pantalla en blanco impedía ver incluso el error real de inicialización.
  // Los permisos de edición/categoría siguen aplicándose al confirmar Firebase.
  const esPaginaPartidos = paginaActual() === "adiur-partidos.html";
  if (!esPaginaPartidos) {
    document.documentElement.classList.add("adiur-permisos-pendientes");
    const estiloEspera = document.createElement("style");
    estiloEspera.id = "adiur-espera-permisos";
    estiloEspera.textContent = "html.adiur-permisos-pendientes body{visibility:hidden!important}";
    (document.head || document.documentElement).appendChild(estiloEspera);
  }

  function mostrarPaginaAutorizada() {
    if (!configActiva) return;
    if (!permisosAplicadosTrasLayout) {
      aplicarPermisos();
      permisosAplicadosTrasLayout = true;
    }
    document.documentElement.classList.remove("adiur-permisos-pendientes");
    document.getElementById("adiur-espera-permisos")?.remove();
  }

  window.addEventListener("adiur-layout-listo", mostrarPaginaAutorizada, { once: true });
  iniciarControlFirebase();
  if (window.ADIUR_LAYOUT_LISTO) mostrarPaginaAutorizada();

  // Respaldo visual: si el layout compartido falla en una página puntual,
  // una cuenta ya autenticada y autorizada no debe quedar con toda la pantalla
  // invisible indefinidamente.
  setTimeout(() => {
    if (configActiva && document.documentElement.classList.contains("adiur-permisos-pendientes")) {
      console.error("ADIUR: el layout no confirmó su inicialización; se habilita la vista autorizada como respaldo.");
      mostrarPaginaAutorizada();
    }
  }, 3500);
})();