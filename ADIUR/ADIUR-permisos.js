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
    "adiur-testeos.html"
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

  let perfilActivo = null;
  let configActiva = null;
  let observerDOM = null;

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
    if (!configActiva || configActiva.categorias.length === 5) return;
    root.querySelectorAll("select").forEach(select => {
      if (!esSelectorCategoria(select)) return;
      Array.from(select.options || []).forEach(option => {
        const cat = categoriaDeTexto(option.value) || categoriaDeTexto(option.textContent);
        const todas = /^(todas?|todas las divisiones|todas las categorias|todas las categorías)$/i.test((option.textContent || "").trim());
        if ((cat && !configActiva.categorias.includes(cat)) || todas) option.remove();
      });
      const permitida = Array.from(select.options || []).find(o =>
        configActiva.categorias.includes(categoriaDeTexto(o.value) || categoriaDeTexto(o.textContent)));
      if (configActiva.categorias.length === 1 && permitida) {
        select.value = permitida.value;
        select.disabled = true;
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    root.querySelectorAll("[data-division], [data-categoria], [data-category]").forEach(el => {
      const cat = categoriaDeTexto(el.getAttribute("data-division") || el.getAttribute("data-categoria") || el.getAttribute("data-category"));
      if (cat && !configActiva.categorias.includes(cat)) el.hidden = true;
    });
  }

  function esSelectorJugadora(select) {
    return /jugadora|jugador|atleta|plantel/i.test([
      select.id, select.name, select.getAttribute("aria-label"), select.getAttribute("data-field")
    ].join(" "));
  }
  function filtrarJugadora(root = document) {
    if (configActiva?.rol !== "jugadora") return;
    root.querySelectorAll("select").forEach(select => {
      if (!esSelectorJugadora(select)) return;
      Array.from(select.options || []).forEach(option => {
        const label = (option.textContent || "").trim();
        if (!label || /seleccion|todas|ninguna/i.test(label)) return;
        if (normalizar(label) !== normalizar(configActiva.jugadora)) option.remove();
      });
      const propia = Array.from(select.options || []).find(o => normalizar(o.textContent) === normalizar(configActiva.jugadora));
      if (propia) select.value = propia.value;
      select.disabled = true;
    });
    const propia = normalizar(configActiva.jugadora);
    root.querySelectorAll("tr, [data-jugadora], .rutina-card, .jugadora-card, .registro-card, .tarjeta-jugadora, [data-player]").forEach(el => {
      const texto = normalizar(el.innerText || el.textContent || el.getAttribute("data-jugadora") || el.getAttribute("data-player"));
      if (texto && !texto.includes(propia)) el.hidden = true;
    });
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
    if (configActiva?.puedeEditar) return;
    root.querySelectorAll("button, input, select, textarea, [contenteditable=true]").forEach(el => {
      const texto = textoControl(el);
      const navegacion = el.matches("a, [role=tab]") ||
        (el.matches("button") && !PALABRAS_EDICION.test(texto) && !PALABRAS_BORRADO.test(texto)) ||
        (el.matches("input") && (el.type === "search" || /buscar|filtro|fecha|mes|semana|orden/i.test(texto)));
      if (navegacion) return;
      if (el.matches("input, textarea, select")) { el.disabled = true; el.readOnly = true; }
      else if (el.matches("[contenteditable=true]")) el.setAttribute("contenteditable", "false");
      else { el.disabled = true; el.setAttribute("aria-disabled", "true"); }
      el.classList.add("adiur-solo-lectura");
    });
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
        if (file.endsWith(".html") && !PAGINAS_JUGADORAS.has(file)) {
          a.remove();
          return;
        }
        if (file === "adiur-gimnasio.html") a.innerHTML = '<span class="nav-punto" aria-hidden="true"></span>Biblioteca de rutinas';
        if (file === "adiur-testeos.html") a.innerHTML = '<span class="nav-punto" aria-hidden="true"></span>Estadísticas';
      });
      // Gimnasio: las jugadoras acceden únicamente a la biblioteca de rutinas.
      if (pagina === "adiur-gimnasio.html") {
        const controles = document.getElementById("panelControlesRutina");
        const editor = document.getElementById("panelEditorRutina");
        if (controles) controles.hidden = true;
        if (editor) editor.hidden = true;
        const biblioteca = document.getElementById("panelBiblioteca");
        if (biblioteca) biblioteca.hidden = false;
        document.querySelectorAll("button, a, [role=button]").forEach(el => {
          if (/crear|agregar|editar|eliminar|guardar|rutina nueva|asignar|aplicar a jugadoras/i.test(textoControl(el))) el.hidden = true;
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
          if (/cargar|nuevo|registrar|agregar|editar|eliminar|testeo|registro/i.test(textoControl(el))) el.hidden = true;
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
    filtrarJugadora();
    aplicarSoloLectura();
    aplicarAccesosPagina();
  }

  async function iniciarControlFirebase() {
    try {
      const modulo = await import("./ADIUR-auth.js");
      modulo.observarSesionADIUR(async user => {
        if (!user) {
          location.replace(LOGIN_URL);
          return;
        }
        try {
          const perfil = await modulo.obtenerPerfilADIUR(user);
          if (!perfil) { await modulo.cerrarSesionADIUR(); location.replace(LOGIN_URL); return; }
          const clave = normalizar(perfil.usuario || "");
          const base = USUARIOS[clave];
          if (!base || perfil.activo !== true) {
            await modulo.cerrarSesionADIUR();
            location.replace(LOGIN_URL);
            return;
          }
          // La matriz de este archivo manda sobre rol y categorías. Firestore solo identifica y habilita la cuenta.
          perfilActivo = perfil;
          configActiva = base;
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
          if (!observerDOM) {
            observerDOM = new MutationObserver(() => aplicarPermisos());
            observerDOM.observe(document.documentElement, { childList: true, subtree: true });
          }
        } catch (error) {
          console.error("No se pudieron aplicar los permisos ADIUR:", error);
          location.replace(LOGIN_URL);
        }
      });
    } catch (error) {
      console.error("No se pudo iniciar el control Firebase ADIUR:", error);
      location.replace(LOGIN_URL);
    }
  }

  if (/^(index|loing)\.html$/i.test(paginaActual())) return;
  iniciarControlFirebase();
})();