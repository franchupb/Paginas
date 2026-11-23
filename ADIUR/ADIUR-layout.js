/* =========================================================
   ADIUR FEMENINO · NAVEGACIÓN COMPARTIDA
   Barra superior y lateral unificadas desde la página principal.
   No modifica los módulos ni sus datos.
========================================================= */
(function () {
  "use strict";

  const ARCHIVO_ACTUAL = (location.pathname.split("/").pop() || "").toLowerCase();
  const PRINCIPAL = "ADIUR-Pagina Principal.html";

  const grupos = [
    {
      id: "grupoPlantel",
      nombre: "PLANTEL",
      paginas: [
        ["ADIUR-jugadoras.html", "Jugadoras", false],
        ["ADIUR-asistencia.html", "Asistencia", false]
      ]
    },
    {
      id: "grupoEntrenamiento",
      nombre: "ENTRENAMIENTO",
      paginas: [
        ["ADIUR-calendario.html", "Calendario", false],
        ["ADIUR-planificacion.html", "Planificación", true],
        ["ADIUR-gimnasio.html", "Gimnasio", false],
        ["ADIUR-calculadora.html", "Calculadora", true]
      ]
    },
    {
      id: "grupoCompetencia",
      nombre: "COMPETENCIA",
      paginas: [
        ["ADIUR-Partidos.html", "Partidos", false],
        ["ADIUR-informes.html", "Informes", true],
        ["ADIUR-estadisticas.html", "Estadísticas", true],
        ["ADIUR-pizarra.html", "Pizarra táctica", true]
      ]
    },
    {
      id: "grupoRendimientos",
      nombre: "RENDIMIENTOS",
      paginas: [
        ["ADIUR-testeos.html", "Planilla de testeos", false],
        ["ADIUR-tiempos.html", "Tiempos", false],
        ["ADIUR-encuestas.html", "Encuestas", false],
        ["lesiones.html", "Lesiones", false]
      ]
    }
  ];

  const equivalencias = {
    "adiur-pruebas.html": "adiur-testeos.html"
  };

  const normalizarArchivo = nombre =>
    (equivalencias[nombre] || nombre).toLowerCase();

  const estilo = document.createElement("style");
  estilo.id = "adiur-layout-compartido";
  estilo.textContent = `
    .barra-superior {
      position: sticky !important;
      top: 0 !important;
      z-index: 200 !important;
      display: flex !important;
      align-items: center !important;
      gap: 15px !important;
      min-height: 84px !important;
      padding: 12px 25px !important;
      background: #fff !important;
      border-bottom: 1px solid var(--borde, #e8e8e8) !important;
      box-sizing: border-box !important;
    }
    .barra-superior .boton-menu,
    .barra-superior .menu-boton {
      display: grid !important;
      place-items: center !important;
      width: 42px !important;
      height: 42px !important;
      flex: 0 0 42px !important;
      border: 0 !important;
      border-radius: 9px !important;
      background: #fff !important;
      color: var(--negro, #171717) !important;
      font-size: 27px !important;
      cursor: pointer !important;
    }
    .barra-superior .boton-menu:hover,
    .barra-superior .menu-boton:hover { background: var(--gris, #f4f5f7) !important; }
    .barra-superior .logo-superior,
    .barra-superior .logo-club,
    .barra-superior .identidad-club img {
      display: block !important;
      width: 55px !important;
      height: 55px !important;
      flex: 0 0 55px !important;
      object-fit: contain !important;
      border-radius: 50% !important;
      padding: 2px !important;
      background: #fff !important;
      box-sizing: border-box !important;
    }
    .barra-superior .identidad-club {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      flex: 1 1 auto !important;
      min-width: 0 !important;
    }
    .barra-superior .textos-club { min-width: 0 !important; }
    .barra-superior .titulo-superior {
      flex: 1 1 auto !important;
      min-width: 0 !important;
    }
    .barra-superior .titulo-superior h1,
    .barra-superior .textos-club h1 {
      margin: 0 0 5px !important;
      color: var(--negro, #171717) !important;
      font-size: 23px !important;
      font-weight: 900 !important;
      letter-spacing: .5px !important;
      line-height: 1.2 !important;
    }
    .barra-superior .titulo-superior p,
    .barra-superior .textos-club p {
      margin: 0 !important;
      color: var(--gris-texto, #747474) !important;
      font-size: 13px !important;
      line-height: 1.4 !important;
    }
    .barra-superior .perfil {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      flex: 0 0 auto !important;
      min-width: 0 !important;
      margin-left: auto !important;
      padding: 4px 7px !important;
      border: 0 !important;
      border-radius: 9px !important;
      background: transparent !important;
      color: var(--negro, #171717) !important;
      text-align: left !important;
      cursor: pointer !important;
    }
    .barra-superior .perfil:hover { background: #f7f7f7 !important; }
    .barra-superior .avatar {
      display: grid !important;
      place-items: center !important;
      width: 42px !important;
      height: 42px !important;
      flex: 0 0 42px !important;
      border-radius: 50% !important;
      background: var(--negro, #171717) !important;
      color: #fff !important;
      font-size: 14px !important;
      font-weight: 900 !important;
    }
    .barra-superior .informacion-perfil {
      display: flex !important;
      flex-direction: column !important;
      gap: 0 !important;
      min-width: 0 !important;
    }
    .barra-superior .nombre-perfil {
      display: block !important;
      max-width: 150px !important;
      overflow: hidden !important;
      color: var(--negro, #171717) !important;
      font-size: 13px !important;
      font-weight: 800 !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important;
    }
    .barra-superior .rol-perfil {
      display: block !important;
      margin-top: 4px !important;
      color: var(--gris-texto, #747474) !important;
      font-size: 11px !important;
    }

    .contenedor {
      display: flex !important;
      min-height: calc(100vh - 84px) !important;
      align-items: stretch !important;
    }
    #sidebar.sidebar,
    #sidebar.barra-lateral {
      position: relative !important;
      top: auto !important;
      left: auto !important;
      bottom: auto !important;
      z-index: 150 !important;
      display: flex !important;
      flex: 0 0 258px !important;
      flex-direction: column !important;
      width: 258px !important;
      height: auto !important;
      min-height: calc(100vh - 84px) !important;
      max-height: none !important;
      padding: 20px 13px !important;
      margin: 0 !important;
      overflow-x: hidden !important;
      overflow-y: auto !important;
      background: #fff !important;
      border-right: 1px solid var(--borde, #e8e8e8) !important;
      box-shadow: none !important;
      transition: margin-left .25s ease, transform .25s ease !important;
      box-sizing: border-box !important;
    }
    #sidebar.sidebar.oculto,
    #sidebar.barra-lateral.oculto { margin-left: -258px !important; }
    #sidebar .menu-inicio {
      display: flex !important;
      align-items: center !important;
      gap: 12px !important;
      padding: 13px 14px !important;
      margin: 0 0 16px !important;
      border-radius: 11px !important;
      background: #fff !important;
      color: var(--negro, #171717) !important;
      font-size: 13px !important;
      font-weight: 850 !important;
      text-decoration: none !important;
    }
    #sidebar .menu-inicio:hover { background: #f8f8f8 !important; }
    #sidebar .menu-inicio.activo {
      background: var(--naranja-claro, #fff0e6) !important;
      color: var(--naranja-oscuro, #dc5e0b) !important;
    }
    #sidebar .icono-inicio {
      width: 15px !important;
      flex: 0 0 15px !important;
      text-align: center !important;
      font-size: 17px !important;
    }
    #sidebar .grupo-menu { margin: 0 0 8px !important; }
    #sidebar .titulo-grupo {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 10px !important;
      width: 100% !important;
      min-height: 46px !important;
      padding: 12px 13px !important;
      border: 0 !important;
      border-radius: 8px !important;
      background: transparent !important;
      color: #171717 !important;
      font-family: Arial, Helvetica, sans-serif !important;
      font-size: 11px !important;
      font-weight: 850 !important;
      letter-spacing: .8px !important;
      text-align: left !important;
      cursor: pointer !important;
      box-sizing: border-box !important;
    }
    #sidebar .titulo-grupo:hover { background: #f8f8f8 !important; }
    #sidebar .flecha {
      display: inline-block !important;
      font-size: 16px !important;
      font-weight: 700 !important;
      line-height: 1 !important;
      transition: transform .2s !important;
    }
    #sidebar .grupo-menu.cerrado .flecha { transform: rotate(0deg) !important; }
    #sidebar .grupo-menu:not(.cerrado) .flecha { transform: rotate(90deg) !important; }
    #sidebar .submenu {
      display: flex !important;
      flex-direction: column !important;
      gap: 3px !important;
      padding: 0 0 5px !important;
    }
    #sidebar .grupo-menu.cerrado .submenu { display: none !important; }
    #sidebar .submenu a {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      padding: 10px 12px !important;
      border-radius: 9px !important;
      background: transparent !important;
      color: #656872 !important;
      font-size: 13px !important;
      text-decoration: none !important;
      transition: background .15s, color .15s !important;
    }
    #sidebar .submenu a:hover { background: #f6f6f6 !important; color: #181818 !important; }
    #sidebar .submenu a.activo {
      background: var(--naranja-claro, #fff0e6) !important;
      color: var(--naranja-oscuro, #dc5e0b) !important;
      font-weight: 800 !important;
    }
    #sidebar .nav-punto {
      width: 6px !important;
      height: 6px !important;
      flex: 0 0 6px !important;
      border-radius: 50% !important;
      background: #d7d9de !important;
    }
    #sidebar .submenu a.activo .nav-punto { background: var(--naranja, #f47721) !important; }
    #sidebar .separador-sesion {
      margin: auto 0 0 !important;
      padding-top: 12px !important;
      border-top: 1px solid #e8e8e8 !important;
    }
    #sidebar .enlace-cerrar-sesion {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      padding: 12px !important;
      border-radius: 9px !important;
      color: #c0392b !important;
      font-size: 13px !important;
      font-weight: 700 !important;
      text-decoration: none !important;
    }
    #sidebar .enlace-cerrar-sesion:hover { background: #fff2f1 !important; color: #a93226 !important; }
    #sidebar .icono-salir { font-size: 17px !important; }
    .capa-sidebar, .fondo-sidebar { display: none; }

    @media (max-width: 760px) {
      .barra-superior {
        min-height: 72px !important;
        padding: 10px 13px !important;
        gap: 9px !important;
      }
      .barra-superior .boton-menu,
      .barra-superior .menu-boton {
        width: 38px !important;
        height: 38px !important;
        flex-basis: 38px !important;
        font-size: 24px !important;
      }
      .barra-superior .logo-superior,
      .barra-superior .logo-club,
      .barra-superior .identidad-club img {
        width: 44px !important;
        height: 44px !important;
        flex-basis: 44px !important;
      }
      .barra-superior .titulo-superior h1,
      .barra-superior .textos-club h1 { font-size: 16px !important; }
      .barra-superior .titulo-superior p,
      .barra-superior .textos-club p { font-size: 11px !important; }
      .barra-superior .nombre-perfil { max-width: 80px !important; font-size: 12px !important; }
      .barra-superior .rol-perfil { display: none !important; }
      .barra-superior .avatar { width: 36px !important; height: 36px !important; flex-basis: 36px !important; }
      .contenedor { min-height: calc(100vh - 72px) !important; }
      #sidebar.sidebar, #sidebar.barra-lateral {
        position: fixed !important;
        top: 72px !important;
        bottom: 0 !important;
        left: 0 !important;
        z-index: 300 !important;
        width: 258px !important;
        max-width: 86vw !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: none !important;
        margin: 0 !important;
        overflow-y: auto !important;
        box-shadow: 5px 0 25px #00000012 !important;
        transform: translateX(0) !important;
        transition: transform .25s ease !important;
      }
      #sidebar.sidebar.oculto, #sidebar.barra-lateral.oculto {
        margin: 0 !important;
        transform: translateX(-110%) !important;
      }
      .capa-sidebar.visible, .fondo-sidebar.visible {
        display: block !important;
        position: fixed !important;
        inset: 72px 0 0 !important;
        z-index: 290 !important;
        background: rgba(0,0,0,.32) !important;
      }
    }
    @media (max-width: 380px) {
      .barra-superior .titulo-superior h1,
      .barra-superior .textos-club h1 { font-size: 14px !important; }
      .barra-superior .nombre-perfil { max-width: 60px !important; }
    }
  `;
  document.head.appendChild(estilo);

  const barra = document.querySelector("header.barra-superior");
  const sidebar = document.getElementById("sidebar");
  if (!barra || !sidebar) return;

  // Unifica el logotipo, sin tocar los elementos de perfil ni sus eventos.
  const logo = barra.querySelector(".logo-superior, .logo-club, .identidad-club img");
  if (logo) {
    logo.src = "ADIUR-Logo ADIUR.jpg";
    logo.alt = "Logo ADIUR";
    logo.classList.add("logo-superior");
  }

  // Unifica las clases visuales conservando el nodo y los listeners existentes.
  sidebar.classList.add("sidebar");
  sidebar.classList.remove("barra-lateral");
  sidebar.innerHTML = "";

  const actual = normalizarArchivo(ARCHIVO_ACTUAL);
  const inicio = document.createElement("a");
  inicio.className = "menu-inicio";
  inicio.href = PRINCIPAL;
  inicio.innerHTML = '<span class="icono-inicio" aria-hidden="true">⌂</span>INICIO';
  sidebar.appendChild(inicio);

  grupos.forEach(grupo => {
    const coincide = grupo.paginas.some(p => normalizarArchivo(p[0].toLowerCase()) === actual);
    const bloque = document.createElement("div");
    bloque.className = "grupo-menu" + (coincide ? "" : " cerrado");
    bloque.id = grupo.id;

    const titulo = document.createElement("button");
    titulo.type = "button";
    titulo.className = "titulo-grupo";
    titulo.dataset.grupo = grupo.id;
    titulo.setAttribute("aria-expanded", String(coincide));
    titulo.innerHTML = '<span>' + grupo.nombre + '</span><span class="flecha" aria-hidden="true">›</span>';
    titulo.addEventListener("click", () => {
      bloque.classList.toggle("cerrado");
      titulo.setAttribute("aria-expanded", String(!bloque.classList.contains("cerrado")));
    });
    bloque.appendChild(titulo);

    const submenu = document.createElement("div");
    submenu.className = "submenu";
    grupo.paginas.forEach(([href, texto, restringido]) => {
      const link = document.createElement("a");
      link.href = href;
      link.innerHTML = '<span class="nav-punto" aria-hidden="true"></span>' + texto;
      if (restringido) link.setAttribute("data-ocultar-bianca", "");
      if (normalizarArchivo(href.toLowerCase()) === actual) {
        link.classList.add("activo");
        link.setAttribute("aria-current", "page");
      }
      link.addEventListener("click", () => {
        if (window.innerWidth <= 760) cerrarMenu();
      });
      submenu.appendChild(link);
    });
    bloque.appendChild(submenu);
    sidebar.appendChild(bloque);
  });

  const separador = document.createElement("div");
  separador.className = "separador-sesion";
  async function importarCerrarSesionADIUR() {
    try {
      const modulo = await import("./ADIUR-auth.js?v=20261122b");
      await modulo.cerrarSesionADIUR();
      window.location.href = "ADIUR-Loing.html";
    } catch (error) {
      console.error("No se pudo cerrar la sesión:", error);
      alert("No se pudo cerrar la sesión. Intentá nuevamente.");
    }
  }
  const salir = document.createElement("a");
  salir.href = "#";
  salir.id = "cerrarSesion";
  salir.className = "enlace-cerrar-sesion";
  salir.innerHTML = '<span class="icono-salir" aria-hidden="true">↪</span>Cerrar sesión';
  salir.addEventListener("click", event => {
    if (event.defaultPrevented) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (window.confirm("¿Querés cerrar la sesión de ADIUR?")) {
      importarCerrarSesionADIUR();
    }
  });
  separador.appendChild(salir);
  sidebar.appendChild(separador);

  const overlay = document.getElementById("capaSidebar") || document.getElementById("fondoSidebar");
  if (overlay) {
    overlay.classList.add("capa-sidebar");
    overlay.addEventListener("click", cerrarMenu);
  } else {
    const nuevoOverlay = document.createElement("div");
    nuevoOverlay.id = "capaSidebar";
    nuevoOverlay.className = "capa-sidebar";
    nuevoOverlay.addEventListener("click", cerrarMenu);
    barra.insertAdjacentElement("afterend", nuevoOverlay);
  }

  function actualizarEstado() {
    const abierto = !sidebar.classList.contains("oculto");
    const boton = document.getElementById("botonMenu");
    if (boton) boton.setAttribute("aria-expanded", String(abierto));
    const capa = document.getElementById("capaSidebar") || document.getElementById("fondoSidebar");
    if (capa) capa.classList.toggle("visible", window.innerWidth <= 760 && abierto);
  }

  function cerrarMenu() {
    sidebar.classList.add("oculto");
    actualizarEstado();
  }

  const botonMenu = document.getElementById("botonMenu");

  // El menú se controla desde este archivo en todas las páginas.
  // Se intercepta en captura para evitar que los controladores antiguos de
  // cada módulo ejecuten un segundo toggle y vuelvan a cerrar el menú.
  if (botonMenu) {
    botonMenu.setAttribute("aria-controls", "sidebar");
    botonMenu.addEventListener("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      sidebar.classList.toggle("oculto");
      const abierto = !sidebar.classList.contains("oculto");
      botonMenu.setAttribute("aria-expanded", String(abierto));
      botonMenu.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
      actualizarEstado();
    }, true);
  }

  function ajustarPantalla() {
    if (window.innerWidth <= 760) sidebar.classList.add("oculto");
    else sidebar.classList.remove("oculto");
    actualizarEstado();
  }
  ajustarPantalla();
  window.addEventListener("resize", ajustarPantalla);

  // Señala que la barra lateral común ya está construida.
  window.ADIUR_LAYOUT_LISTO = true;
  window.dispatchEvent(new Event("adiur-layout-listo"));
})();