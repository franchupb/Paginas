/* ==========================================================
   TORITO · AUTORIZACIÓN CENTRALIZADA
   La identidad y los permisos se validan con Firebase Auth + Firestore.
   Este archivo controla la interfaz; las reglas de Firestore son
   la barrera real para proteger los datos.
========================================================== */
(function () {
  "use strict";

  const LOGIN_URL = "TORITO-Loing.html";
  const INICIO_URL = "TORITO-Pagina Principal.html";
  const CATEGORIAS = ["Sub 10", "Sub 12", "Sub 14", "Sub 16", "Primera"];
  const PAGINAS_JUGADORA = new Set([
    "torito-pagina principal.html",
    "torito-partidos.html",
    "torito-calendario.html",
    "torito-gimnasio.html",
    "torito-testeos.html"
  ]);
  const normalizar = value => String(value ?? "").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[\s._-]+/g, "").trim();

  document.documentElement.classList.add("torito-permisos-pendientes");
  const estilo = document.createElement("style");
  estilo.textContent = "html.torito-permisos-pendientes body{visibility:hidden!important}html.torito-permisos-pendientes:before{content:'Verificando acceso seguro…';position:fixed;inset:0;z-index:2147483647;display:grid;place-items:center;background:#f7f7f7;color:#333;font:600 14px system-ui,sans-serif;visibility:visible}";
  document.head.appendChild(estilo);

  function categoriaDeTexto(value) {
    const texto = String(value || "").trim();
    const s = normalizar(texto);
    const mapa = {
      sub10:"Sub 10",s10:"Sub 10",u10:"Sub 10",
      sub12:"Sub 12",s12:"Sub 12",u12:"Sub 12",
      sub14:"Sub 14",s14:"Sub 14",u14:"Sub 14",
      sub16:"Sub 16",s16:"Sub 16",u16:"Sub 16",
      primera:"Primera"
    };
    if (mapa[s]) return mapa[s];
    const match = texto.match(/(?:^|[^a-z0-9])(sub\s*10|sub\s*12|sub\s*14|sub\s*16|s10|s12|s14|s16|primera)(?:$|[^a-z0-9])/i);
    return match ? mapa[normalizar(match[1])] || null : null;
  }

  function textoControl(el) {
    return [
      el.textContent, el.value, el.getAttribute("aria-label"), el.title,
      el.id, el.name, el.className, el.getAttribute("data-accion"),
      el.getAttribute("data-action"), el.getAttribute("data-operacion"),
      el.getAttribute("onclick")
    ].filter(Boolean).join(" ").toLowerCase();
  }

  function esperarDOM() {
    if (document.readyState !== "loading") return Promise.resolve();
    return new Promise(resolve => document.addEventListener("DOMContentLoaded", resolve, { once:true }));
  }

  function mostrarErrorAcceso(mensaje) {
    document.documentElement.classList.remove("torito-permisos-pendientes");
    document.body.innerHTML = "";
    const main = document.createElement("main");
    main.style.cssText = "min-height:100vh;display:grid;place-content:center;padding:24px;text-align:center;font:15px system-ui,sans-serif;color:#252525";
    const titulo = document.createElement("h1");
    titulo.textContent = "No se pudo verificar el acceso";
    const texto = document.createElement("p");
    texto.textContent = mensaje;
    const link = document.createElement("a");
    link.href = LOGIN_URL;
    link.textContent = "Volver al inicio de sesión";
    link.style.cssText = "color:#d95d0b;font-weight:700";
    main.append(titulo,texto,link);
    document.body.appendChild(main);
  }

  async function iniciar() {
    await esperarDOM();
    let modulo;
    try {
      modulo = await import("./TORITO-auth.js?v=20261124-auth2");
    } catch (error) {
      console.error("No se pudo cargar la autenticación de TORITO:", error);
      mostrarErrorAcceso("No está disponible el módulo de autenticación. Intentá nuevamente más tarde.");
      return;
    }

    const sesion = await new Promise(resolve => {
      let cancelar = () => {};
      let resuelta = false;
      cancelar = modulo.observarSesionTORITO((user, perfil, error) => {
        if (resuelta) return;
        resuelta = true;
        cancelar();
        resolve({ user, perfil, error });
      });
    });

    if (!sesion.user || !sesion.perfil) {
      try { localStorage.removeItem("usuarioTORITO"); } catch (_) {}
      location.replace(LOGIN_URL);
      return;
    }

    const perfil = sesion.perfil;
    const usuario = perfil.nombre || perfil.usuario || "Usuario";
    const rol = perfil.rol;
    const categoriasPermitidas = rol === "admin" ? CATEGORIAS.slice() : perfil.categorias.slice();
    const permitidas = new Set(categoriasPermitidas);
    const puedeEditar = perfil.puedeEditar === true && rol !== "jugadora";
    const puedeEliminar = perfil.puedeEliminar === true && rol === "admin";
    const pagina = decodeURIComponent(location.pathname.split("/").pop() || "").toLowerCase();

    if (rol === "jugadora" && !PAGINAS_JUGADORA.has(pagina)) {
      location.replace(INICIO_URL);
      return;
    }

    function esSelectorCategoria(select) {
      if (!select || select.tagName !== "SELECT") return false;
      return Array.from(select.options || []).some(o => categoriaDeTexto(o.value) || categoriaDeTexto(o.textContent));
    }

    function aplicarCategorias(root = document) {
      root.querySelectorAll("select").forEach(select => {
        if (!esSelectorCategoria(select)) return;
        const valorAnterior = categoriaDeTexto(select.value);
        Array.from(select.options || []).forEach(option => {
          const categoria = categoriaDeTexto(option.value) || categoriaDeTexto(option.textContent);
          const todas = /^(todas?|todas las divisiones|todas las categorías|todas las categorias)$/i.test(String(option.textContent || "").trim());
          if ((categoria && !permitidas.has(categoria)) || (todas && categoriasPermitidas.length < CATEGORIAS.length)) option.remove();
        });
        if (categoriasPermitidas.length === 1) {
          const opcion = Array.from(select.options || []).find(o =>
            categoriaDeTexto(o.value) === categoriasPermitidas[0] ||
            categoriaDeTexto(o.textContent) === categoriasPermitidas[0]
          );
          if (opcion) {
            select.value = opcion.value;
            select.disabled = true;
            select.dataset.toritoCategoriaFija = "1";
            select.setAttribute("aria-label", "Categoría autorizada: " + categoriasPermitidas[0]);
            if (valorAnterior !== categoriasPermitidas[0]) select.dispatchEvent(new Event("change", { bubbles:true }));
          }
        } else {
          select.disabled = false;
          delete select.dataset.toritoCategoriaFija;
        }
      });
    }

    function divisionElemento(elemento) {
      for (const atributo of ["data-division","data-categoria","data-category"]) {
        const categoria = categoriaDeTexto(elemento.getAttribute(atributo));
        if (categoria) return categoria;
      }
      return null;
    }

    function ocultarOtrasCategorias(root = document) {
      const selectores = "[data-division],[data-categoria],[data-category],.division-section,.categoria-card,.division-card,.category-card";
      root.querySelectorAll(selectores).forEach(elemento => {
        let categoria = divisionElemento(elemento);
        if (!categoria && elemento.matches(".division-section")) {
          const h = elemento.querySelector("h1,h2,h3");
          categoria = categoriaDeTexto(h?.textContent);
        }
        if (categoria && !permitidas.has(categoria)) {
          elemento.hidden = true;
          elemento.setAttribute("aria-hidden","true");
        }
      });
    }

    function filtrarJugadoras(root = document) {
      if (rol !== "jugadora") return;
      const nombrePropio = normalizar(perfil.nombre || perfil.usuario);
      root.querySelectorAll("select").forEach(select => {
        const descriptor = normalizar([select.id,select.name,select.getAttribute("aria-label")].join(" "));
        if (!/jugadora|jugador|atleta|plantel/.test(descriptor)) return;
        Array.from(select.options || []).forEach(option => {
          const texto = normalizar(option.textContent);
          if (texto && !/seleccion|todas|ninguna/.test(texto) && texto !== nombrePropio) option.remove();
        });
        select.disabled = true;
      });
    }

    const PALABRAS_BORRADO = /eliminar|borrar|suprimir|quitar|dar de baja/i;
    const PALABRAS_CAMBIO = /guardar|agregar|añadir|nuevo|crear|editar|modificar|actualizar|importar|cargar|registrar|duplicar|publicar|aplicar|restaurar|reset|save|submit|enviar|confirmar/i;
    const PALABRAS_NAVEGACION = /cerrar|cancelar|volver|abrir|ver|filtrar|buscar|siguiente|anterior|mes|semana|día|dia|imprimir|descargar|mostrar|ocultar|menú|menu|perfil|sesión|sesion|inicio|pizarra|calendario/i;

    function controlPermitidoSoloLectura(el) {
      const t = textoControl(el);
      if (el.matches("a,[role=tab]")) return true;
      if (el.matches("button,[role=button]")) return !PALABRAS_CAMBIO.test(t) && !PALABRAS_BORRADO.test(t) || PALABRAS_NAVEGACION.test(t);
      if (el.matches("select")) return !esSelectorCategoria(el) && !/jugadora|jugador|atleta|plantel/i.test(t);
      if (el.matches("input")) return el.type === "search" || /buscar|filtro|fecha|mes|semana|orden|búsqueda|busqueda/i.test(t);
      return false;
    }

    function bloquearAccion(event) {
      const control = event.target?.closest?.("button,input[type=submit],input[type=button],[role=button]");
      if (event.type === "submit" && !puedeEditar) {
        event.preventDefault(); event.stopImmediatePropagation(); return;
      }
      if (!control) return;
      const t = textoControl(control);
      if (!puedeEditar && !controlPermitidoSoloLectura(control)) {
        event.preventDefault(); event.stopImmediatePropagation();
      } else if (!puedeEliminar && PALABRAS_BORRADO.test(t)) {
        event.preventDefault(); event.stopImmediatePropagation();
      }
    }

    function aplicarSoloLectura(root = document) {
      if (puedeEditar) return;
      root.querySelectorAll("button,input,select,textarea,[contenteditable=true]").forEach(el => {
        if (controlPermitidoSoloLectura(el)) return;
        if (el.matches("input,select,textarea")) el.disabled = true;
        else if (el.matches("[contenteditable=true]")) el.setAttribute("contenteditable","false");
        else { el.disabled = true; el.setAttribute("aria-disabled","true"); }
        el.classList.add("torito-solo-lectura");
      });
      root.querySelectorAll("form").forEach(form => form.addEventListener("submit", bloquearAccion, true));
    }

    function actualizarPerfil() {
      [ "nombreUsuario", "nombrePerfil", "saludoUsuario", "tituloPerfil" ].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = usuario;
      });
      [ "avatarUsuario", "avatarPerfil" ].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = (usuario.trim()[0] || "U").toUpperCase();
      });
      const etiquetaRol = rol === "admin" ? "Administrador"
        : rol === "coordinadora" ? "Coordinación"
        : rol === "cuerpo_tecnico" ? "Cuerpo técnico"
        : "Jugadora";
      [ "rolUsuario", "rolPerfil" ].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = etiquetaRol;
      });
    }

    function aplicarPermisos(root = document) {
      actualizarPerfil();
      aplicarCategorias(root);
      ocultarOtrasCategorias(root);
      filtrarJugadoras(root);
      aplicarSoloLectura(root);
      if (!puedeEliminar) {
        root.querySelectorAll("button,a,[role=button]").forEach(el => {
          if (PALABRAS_BORRADO.test(textoControl(el))) {
            el.hidden = true;
            el.setAttribute("aria-hidden","true");
          }
        });
      }
      root.querySelectorAll('a[href]').forEach(a => {
        const destino = (a.getAttribute("href") || "").split(/[?#]/)[0].toLowerCase();
        if (/^(biblioteca|multimedia|lesiones)\.html$/.test(destino)) {
          a.hidden = true;
          a.removeAttribute("href");
          a.setAttribute("aria-disabled","true");
        }
      });
    }

    document.addEventListener("change", event => {
      if (!esSelectorCategoria(event.target)) return;
      const seleccion = categoriaDeTexto(event.target.value) || categoriaDeTexto(event.target.selectedOptions?.[0]?.textContent);
      if (seleccion && !permitidas.has(seleccion)) {
        event.preventDefault(); event.stopImmediatePropagation();
        event.target.value = categoriasPermitidas[0] || "";
      }
    }, true);
    document.addEventListener("click", bloquearAccion, true);
    document.addEventListener("submit", bloquearAccion, true);
    aplicarPermisos();
    const observer = new MutationObserver(records => {
      if (records.some(r => r.addedNodes.length || r.removedNodes.length)) aplicarPermisos();
    });
    observer.observe(document.documentElement,{childList:true,subtree:true});

    window.TORITO_PERMISOS = Object.freeze({
      uid: perfil.uid,
      usuario,
      rol,
      categorias: Object.freeze(categoriasPermitidas.slice()),
      division: categoriasPermitidas.length === 1 ? categoriasPermitidas[0] : null,
      puedeEditar,
      puedeEliminar,
      puedeGestionarUsuarios: perfil.puedeGestionarUsuarios === true,
      puedeAccederCategoria: categoria => permitidas.has(categoriaDeTexto(categoria)),
      puedeEditarCategoria: categoria => puedeEditar && permitidas.has(categoriaDeTexto(categoria)),
      puedeEliminarCategoria: categoria => puedeEliminar && permitidas.has(categoriaDeTexto(categoria))
    });
    window.esperarPermisosTORITO = () => Promise.resolve(window.TORITO_PERMISOS);
    document.documentElement.classList.remove("torito-permisos-pendientes");
  }

  iniciar().catch(error => {
    console.error("TORITO: falló la validación central de permisos:",error);
    mostrarErrorAcceso("No fue posible verificar la sesión y los permisos. No se habilitó el acceso a los datos.");
  });
})();
