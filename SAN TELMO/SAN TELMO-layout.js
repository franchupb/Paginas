/* =========================================================
   SAN TELMO FEMENINO · NAVEGACIÓN COMPARTIDA
   Barra superior y lateral unificadas desde la página principal.
   No modifica los módulos ni sus datos.
========================================================= */
(function () {
  "use strict";

  if (window.SANTELMO_LAYOUT_INICIALIZADO) return;
  window.SANTELMO_LAYOUT_INICIALIZADO = true;

  const ARCHIVO_ACTUAL = (location.pathname.split("/").pop() || "").toLowerCase();
  const PRINCIPAL = "SAN TELMO-Pagina Principal.html";

  const grupos = [
    {
      id: "grupoPlantel",
      nombre: "PLANTEL",
      paginas: [
        ["SAN TELMO-jugadoras.html", "Jugadoras", false],
        ["SAN TELMO-asistencia.html", "Asistencia", false]
      ]
    },
    {
      id: "grupoEntrenamiento",
      nombre: "ENTRENAMIENTO",
      paginas: [
        ["SAN TELMO-calendario.html", "Calendario", false],
        ["SAN TELMO-planificacion.html", "Planificación", true],
        ["SAN TELMO-gimnasio.html", "Gimnasio", false],
        ["SAN TELMO-calculadora.html", "Calculadora", true]
      ]
    },
    {
      id: "grupoCompetencia",
      nombre: "COMPETENCIA",
      paginas: [
        ["SAN TELMO-Partidos.html", "Partidos", false],
        ["SAN TELMO-informes.html", "Informes", true],
        ["SAN TELMO-estadisticas.html", "Estadísticas", true],
        ["SAN TELMO-pizarra.html", "Pizarra táctica", true]
      ]
    },
    {
      id: "grupoRendimientos",
      nombre: "RENDIMIENTOS",
      paginas: [
        ["SAN TELMO-testeos.html", "Planilla de testeos", false],
        ["SAN TELMO-tiempos.html", "Tiempos", false],
        ["SAN TELMO-encuestas.html", "Encuestas", false],
        ["SAN TELMO-lesiones.html", "Lesiones", false]
      ]
    }
  ];

  const equivalencias = {
    "santelmo-pruebas.html": "santelmo-testeos.html"
  };

  const normalizarArchivo = nombre =>
    (equivalencias[nombre] || nombre).toLowerCase();

  const estilo = document.createElement("style");
  estilo.id = "santelmo-layout-compartido";
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
    .barra-superior .menu-perfil {
      position: absolute !important;
      top: calc(100% + 7px) !important;
      right: 20px !important;
      z-index: 500 !important;
      min-width: 190px !important;
      padding: 7px !important;
      border: 1px solid #e8e8e8 !important;
      border-radius: 11px !important;
      background: #fff !important;
      box-shadow: 0 10px 30px #00000018 !important;
    }
    .barra-superior .menu-perfil[hidden] { display: none !important; }
    .barra-superior .accion-cerrar-perfil {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      width: 100% !important;
      min-height: 42px !important;
      padding: 10px 12px !important;
      border: 0 !important;
      border-radius: 8px !important;
      background: #fff !important;
      color: #c0392b !important;
      font-size: 13px !important;
      font-weight: 750 !important;
      text-align: left !important;
      cursor: pointer !important;
    }
    .barra-superior .accion-cerrar-perfil:hover { background: #fff2f1 !important; }

    .contenedor {
      display: flex !important;
      min-height: calc(100vh - 84px) !important;
      align-items: stretch !important;
    }
    .contenedor > main.main { margin-left: 0 !important; flex: 1 1 auto !important; min-width: 0 !important; }
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
      background: var(--naranja-claro, #eaf1f8) !important;
      color: var(--naranja-oscuro, #a51e36) !important;
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
      background: var(--naranja-claro, #eaf1f8) !important;
      color: var(--naranja-oscuro, #a51e36) !important;
      font-weight: 800 !important;
    }
    #sidebar .nav-punto {
      width: 6px !important;
      height: 6px !important;
      flex: 0 0 6px !important;
      border-radius: 50% !important;
      background: #d7d9de !important;
    }
    #sidebar .submenu a.activo .nav-punto { background: var(--naranja, #174a7e) !important; }
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

  // Cabecera compartida por página: reemplaza el título original y unifica
  // la selección de categoría. La página principal queda expresamente excluida.
  if (ARCHIVO_ACTUAL !== PRINCIPAL.toLowerCase()) {
    const paginas = {
      "santelmo-jugadoras.html": {
        controlesCategoria: ["categoriaPrincipal"],
        ocultarSelectores: [".selector-categoria-principal"],
        selector: ".encabezado-pagina",
        eyebrow: "PLANTEL · EQUIPO",
        titulo: "Plantel de jugadoras",
        descripcion: "Administrá la información personal y deportiva de SAN TELMO FEMENINO."
      },
      "santelmo-asistencia.html": {
        controlesCategoria: ["filtroCategoria"],
        ocultarSelectores: [".selector-categoria-panel"],
        selector: ".cabecera-pagina",
        eyebrow: "PLANTEL · ASISTENCIA",
        titulo: "Asistencia mensual",
        descripcion: "Registrá la asistencia por categoría y consultá el seguimiento individual de cada jugadora al final de la página."
      },
      "santelmo-calendario.html": {
        controlesCategoria: ["categoria"],
        ocultarSelectores: [".selector-categoria"],
        selector: ".encabezado-calendario",
        eyebrow: "ENTRENAMIENTO · CALENDARIO",
        titulo: "Calendario de actividades",
        descripcion: "Organizá y consultá las actividades de cada categoría en un solo lugar."
      },
      "santelmo-planificacion.html": {
        controlesCategoria: ["selectCategoria"],
        ocultarSelectores: [".panel-semanal"],
        selector: ".cabecera-pagina",
        eyebrow: "ENTRENAMIENTO · PLANIFICACIÓN",
        titulo: "Planificación de microciclos",
        descripcion: "Organizá las sesiones semanales y consultá los contenidos técnicos y físicos de cada categoría."
      },
      "santelmo-gimnasio.html": {
        controlesCategoria: ["division"],
        ocultarSelectores: [".selector-categoria-superior"],
        selector: ".cabecera-pagina",
        eyebrow: "ENTRENAMIENTO · FUERZA",
        titulo: "Gimnasio",
        descripcion: "Creá, organizá y consultá las rutinas de fuerza del plantel."
      },
      "santelmo-calculadora.html": {
        controlesCategoria: ["division"],
        ocultarSelectores: [".field.campo-categoria"],
        selector: ".cabecera-pagina",
        eyebrow: "ENTRENAMIENTO · CARGAS",
        titulo: "Calculadora de cargas y volúmenes",
        descripcion: "Calculadora atemporal para registrar distancias, pasadas y tiempos de trabajo."
      },
      "santelmo-partidos.html": {
        controlesCategoria: ["filtroDivision"],
        ocultarSelectores: [".filters .field:nth-child(2)"],
        selector: ".page-heading",
        eyebrow: "COMPETENCIA · FIXTURE",
        titulo: "Fixture de competencia",
        descripcion: "Organizá los partidos por división, competición y fecha del torneo."
      },
      "santelmo-informes.html": {
        controlesCategoria: ["division","filtroDivisionPartidos","filtroDivisionEstadisticas"],
        ocultarSelectores: [".selector-categoria-general, #filtroDivisionPartidos, #filtroDivisionEstadisticas"],
        selector: ".page-heading",
        eyebrow: "COMPETENCIA · INFORMES",
        titulo: "Informes de partidos",
        descripcion: "Una planilla más simple para registrar cada encuentro, organizar la formación y mantener el seguimiento de minutos, goles y tarjetas de cada jugadora."
      },
      "santelmo-estadisticas.html": {
        controlesCategoria: ["selectorCategoria"],
        ocultarSelectores: ["#selectorCategoria"],
        selector: ".encabezado-seccion",
        eyebrow: "COMPETENCIA · ANÁLISIS",
        titulo: "Estadísticas del club",
        descripcion: "Consultá el rendimiento general y la evolución de cada jugadora a partir de los registros de competencia, asistencia, testeos, tiempos y lesiones."
      },
      "santelmo-testeos.html": {
        controlesCategoria: ["selectDivision"],
        ocultarSelectores: [".selector-categoria"],
        selector: ".encabezado",
        eyebrow: "RENDIMIENTOS · TESTEOS",
        titulo: "Testeos y evaluaciones físicas",
        descripcion: "Registrá los resultados y consultá la evolución física de cada jugadora."
      },
      "santelmo-tiempos.html": {
        controlesCategoria: ["selectorCategoriaGlobal"],
        ocultarSelectores: [".selector-categoria-principal"],
        selector: ".page-heading",
        eyebrow: "RENDIMIENTOS · TIEMPOS",
        titulo: "Tiempos y rendimiento físico",
        descripcion: "Consultá las pasadas, analizá los resultados y registrá la evolución física de cada jugadora en un solo lugar."
      },
      "santelmo-encuestas.html": {
        controlesCategoria: ["filtroCategoria"],
        ocultarSelectores: ["#bloqueCategoria"],
        selector: ".cabecera-pagina",
        eyebrow: "RENDIMIENTOS · SEGUIMIENTO DIARIO",
        titulo: "Encuestas del plantel",
        descripcion: "Publicá encuestas, consultá respuestas y hacé el seguimiento del bienestar y la carga de entrenamiento."
      },
      "SAN TELMO-lesiones.html": {
        controlesCategoria: ["selectorCategoriaGlobal"],
        ocultarSelectores: [".selector-categoria-principal"],
        selector: ".page-heading",
        eyebrow: "SALUD DEPORTIVA · SEGUIMIENTO",
        titulo: "Salud y disponibilidad deportiva",
        descripcion: "Centralizá los incidentes, el estado de recuperación, los controles pendientes y la disponibilidad deportiva de cada jugadora."
      }
    };
    const configPagina = paginas[ARCHIVO_ACTUAL];
    const panelEstilo = document.createElement("style");
    panelEstilo.id = "santelmo-panel-compartido-estilos";
    panelEstilo.textContent = `
      .santelmo-panel-compartido{position:relative;isolation:isolate;overflow:hidden;display:flex;align-items:center;justify-content:space-between;gap:22px;min-height:154px;padding:25px 30px;margin:0 0 22px;border-radius:20px;background:linear-gradient(112deg,#191919 0%,#282828 65%,#3b2a20 100%);color:#fff;box-shadow:0 12px 30px #17171712}
      .santelmo-panel-compartido:after{content:"";position:absolute;z-index:-1;width:300px;height:300px;right:170px;top:-190px;border:1px solid #ffffff20;border-radius:50%;box-shadow:0 0 0 35px #ffffff08,0 0 0 75px #ffffff06}
      .santelmo-panel-texto{min-width:0;flex:1 1 auto}.santelmo-panel-eyebrow{display:flex;align-items:center;gap:8px;margin-bottom:10px;color:#b9d3ed;font-size:10px;font-weight:850;letter-spacing:1.6px}.santelmo-panel-eyebrow:before{content:"";width:22px;height:2px;background:#174a7e}.santelmo-panel-titulo{margin:0 0 7px;color:#fff;font-family:Manrope,'DM Sans',Arial,sans-serif;font-size:27px;font-weight:850;letter-spacing:-.5px}.santelmo-panel-descripcion{max-width:760px;margin:0;color:#d0d0d0;font-size:12px;line-height:1.6}
      .santelmo-panel-control{position:relative;z-index:1;flex:0 0 235px;min-width:210px;padding:13px 15px;border:1px solid #ffffff29;border-radius:13px;background:#ffffff0d}.santelmo-panel-control label{display:block;margin:0 0 7px;color:#d2e3f4;font-size:9px;font-weight:850;letter-spacing:1px}.santelmo-panel-control select{width:100%;min-height:42px;padding:9px 32px 9px 11px;border:1px solid #ffffff32;border-radius:9px;outline:none;background:#fff;color:#202020;font-size:12px;font-weight:800}.santelmo-panel-control select:focus{box-shadow:0 0 0 3px #174a7e40}.santelmo-categoria-integrada{display:none!important}
      .santelmo-panel-acciones{position:relative;z-index:1;flex:0 0 auto;display:flex;align-items:center;justify-content:flex-end;gap:8px}
      @media(max-width:760px){.santelmo-panel-compartido{align-items:stretch;flex-direction:column;gap:14px;min-height:0;padding:21px 18px;margin-bottom:16px;border-radius:16px}.santelmo-panel-titulo{font-size:23px}.santelmo-panel-descripcion{font-size:11px}.santelmo-panel-control{flex:0 0 auto;min-width:0;width:100%;padding:11px 12px}.santelmo-panel-acciones{justify-content:flex-start;flex-wrap:wrap}}
    `;
    document.head.appendChild(panelEstilo);
    const zonaPrincipal = document.querySelector("main.contenido, main.main, main, .contenido, .contenido-principal");
    if (zonaPrincipal && configPagina) {
      const panel = document.createElement("section");
      panel.className = "santelmo-panel-compartido";
      panel.id = "santelmoPanelCompartido";
      panel.innerHTML = `
        <div class="santelmo-panel-texto">
          <div class="santelmo-panel-eyebrow">${configPagina.eyebrow}</div>
          <h2 class="santelmo-panel-titulo">${configPagina.titulo}</h2>
          <p class="santelmo-panel-descripcion">${configPagina.descripcion}</p>
        </div>
        <div class="santelmo-panel-control">
          <label for="santelmoCategoriaGlobal">CATEGORÍA DEL PLANTEL</label>
          <select id="santelmoCategoriaGlobal" aria-label="Seleccionar categoría"></select>
        </div>`;
      const controlesOriginales = (configPagina.controlesCategoria || []).map(id => document.getElementById(id)).filter(Boolean);
      const depositoControles = document.createElement("div");
      depositoControles.hidden = true;
      depositoControles.className = "santelmo-controles-categoria-ocultos";
      zonaPrincipal.appendChild(depositoControles);
      controlesOriginales.forEach(select => depositoControles.appendChild(select));
      const encabezadoOriginal = zonaPrincipal.querySelector(configPagina.selector);
      if (encabezadoOriginal) {
        const bloquesConAcciones = Array.from(encabezadoOriginal.children).filter(nodo => nodo.matches("button, a.boton-principal, a.btn") || (nodo.querySelector && nodo.querySelector("button, a.boton-principal, a.btn")));
        if (bloquesConAcciones.length) {
          const acciones = document.createElement("div");
          acciones.className = "santelmo-panel-acciones";
          bloquesConAcciones.forEach(nodo => acciones.appendChild(nodo));
          panel.appendChild(acciones);
        }
        encabezadoOriginal.remove();
      }
      zonaPrincipal.insertBefore(panel, zonaPrincipal.firstChild);
      const categorias = ["Sub 10","Sub 12","Sub 14","Sub 16","Primera"];
      const idsCategoria = new Set(["categoriaPrincipal","filtroCategoria","categoria","selectCategoria","division","filtroDivision","filtroDivisionPartidos","filtroDivisionEstadisticas","selectDivision","selectorCategoriaGlobal","selectorCategoria","filtroCategoriaEstadisticas"]);
      const normalizarCategoriaGlobal = valor => String(valor || "").normalize("NFD").split("").filter(caracter => { const codigo = caracter.charCodeAt(0); return codigo < 0x0300 || codigo > 0x036f; }).join("").toLowerCase().replace(/[^a-z0-9]/g,"");
      const categoriaEnOpciones = select => Array.from(select.options || []).some(option => categorias.some(cat => normalizarCategoriaGlobal(option.value || option.textContent) === normalizarCategoriaGlobal(cat)));
      const selectorGlobal = panel.querySelector("#santelmoCategoriaGlobal");
      (configPagina.ocultarSelectores || []).forEach(selector => {
        document.querySelectorAll(selector).forEach(nodo => {
          if (nodo !== panel && !nodo.contains(panel)) nodo.classList.add("santelmo-categoria-integrada");
        });
      });
      function categoriasAutorizadas() {
        const p = window.SANTELMO_PERMISOS;
        if (p && ["jugadora","cuerpo_tecnico"].includes(p.rol)) {
          const permitidas = new Set((p.categorias || []).map(normalizarCategoriaGlobal));
          return categorias.filter(c => permitidas.has(normalizarCategoriaGlobal(c)));
        }
        return categorias;
      }
      function controlesCategoria() {
        return controlesOriginales.filter(select => select.isConnected && select !== selectorGlobal);
      }
      function ocultarControlOriginal(select) {
        select.classList.add("santelmo-categoria-integrada");
        const etiqueta = select.id ? document.querySelector('label[for="' + CSS.escape(select.id) + '"]') : null;
        if (etiqueta) {
          const campo = etiqueta.closest(".campo,.field,.selector-campo,.filtro-item");
          const otrosControles = campo ? campo.querySelectorAll("input,select,textarea,button") : [];
          if (campo && otrosControles.length === 0) campo.classList.add("santelmo-categoria-integrada");
          etiqueta.classList.add("santelmo-categoria-integrada");
        }
      }
      function sincronizarControlesCategoria() {
        const categoria = selectorGlobal.value;
        controlesCategoria().forEach(select => {
          ocultarControlOriginal(select);
          const opcion = Array.from(select.options || []).find(option => normalizarCategoriaGlobal(option.value || option.textContent) === normalizarCategoriaGlobal(categoria));
          if (!opcion || select.value === opcion.value) return;
          select.value = opcion.value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
        });
      }
      function configurarSelectorGlobal() {
        const disponibles = categoriasAutorizadas();
        const anterior = selectorGlobal.value || localStorage.getItem("santelmoCategoriaGlobal") || "";
        selectorGlobal.replaceChildren(...disponibles.map(c => new Option(c,c)));
        const elegida = disponibles.find(c => normalizarCategoriaGlobal(c) === normalizarCategoriaGlobal(anterior));
        selectorGlobal.value = elegida || disponibles[0] || "";
        selectorGlobal.disabled = disponibles.length <= 1;
        if (!selectorGlobal.value) { selectorGlobal.innerHTML = '<option value="">Sin categorías disponibles</option>'; selectorGlobal.disabled = true; }
        sincronizarControlesCategoria();
      }
      selectorGlobal.addEventListener("change", () => {
        try { localStorage.setItem("santelmoCategoriaGlobal", selectorGlobal.value); } catch (_) {}
        sincronizarControlesCategoria();
      });
      const observerCategorias = new MutationObserver(() => sincronizarControlesCategoria());
      observerCategorias.observe(zonaPrincipal, { childList: true, subtree: true });
      window.addEventListener("santelmo-permisos-listos", configurarSelectorGlobal);
      configurarSelectorGlobal();
    }
  }

  const barra = document.querySelector(".barra-superior");
  const sidebar = document.getElementById("sidebar");
  if (!barra || !sidebar) {
    console.error("SANTELMO: no se encontró la barra superior o el contenedor lateral.");
    return;
  }

  // Algunas páginas antiguas (como la pizarra) no tenían un contenedor flex.
  // Se crea solo cuando la barra lateral y el contenido principal son hermanos.
  if (!document.querySelector(".contenedor")) {
    const principal = document.querySelector("main");
    const padre = sidebar.parentElement;
    if (principal && padre && principal.parentElement === padre) {
      const contenedor = document.createElement("div");
      contenedor.className = "contenedor";
      padre.insertBefore(contenedor, sidebar);
      contenedor.appendChild(sidebar);
      contenedor.appendChild(principal);
    }
  }

  // Elimina los controladores antiguos de cada página. Todas las páginas
  // quedan bajo un único controlador central para evitar dobles toggles.
  const botonOriginal = document.getElementById("botonMenu");
  let botonMenu = botonOriginal;
  if (botonOriginal) {
    botonMenu = botonOriginal.cloneNode(true);
    botonMenu.removeAttribute("onclick");
    botonOriginal.replaceWith(botonMenu);
  }

  // El overlay también se reemplaza para quitar eventos duplicados antiguos.
  const overlayOriginal = document.getElementById("capaSidebar") || document.getElementById("fondoSidebar");
  let overlay = overlayOriginal;
  if (overlayOriginal) {
    overlay = overlayOriginal.cloneNode(false);
    overlay.classList.add("capa-sidebar");
    overlayOriginal.replaceWith(overlay);
  }

  // Unifica el logotipo, sin tocar los elementos de perfil ni sus eventos.
  const logo = barra.querySelector(".logo-superior, .logo-club, .identidad-club img");
  if (logo) {
    logo.src = "SAN TELMO.png";
    logo.alt = "Escudo SANTELMO";
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
  if (normalizarArchivo(PRINCIPAL.toLowerCase()) === actual) {
    inicio.classList.add("activo");
    inicio.setAttribute("aria-current", "page");
  }
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
    titulo.addEventListener("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      bloque.classList.toggle("cerrado");
      titulo.setAttribute("aria-expanded", String(!bloque.classList.contains("cerrado")));
    }, true);
    bloque.appendChild(titulo);

    const submenu = document.createElement("div");
    submenu.className = "submenu";
    grupo.paginas.forEach(([href, texto, restringido]) => {
      const link = document.createElement("a");
      link.href = href === "SAN TELMO-pizarra.html" ? "SAN TELMO-pizarra.html?v=20261124pizarra1" : href;
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

  // Ancla oculta de compatibilidad: algunas páginas antiguas todavía buscan
  // #cerrarSesion al inicializar sus scripts. El cierre visible vive en el perfil.
  const cierreCompatibilidad = document.createElement("a");
  cierreCompatibilidad.id = "cerrarSesion";
  cierreCompatibilidad.href = "#";
  cierreCompatibilidad.hidden = true;
  cierreCompatibilidad.setAttribute("aria-hidden", "true");
  sidebar.appendChild(cierreCompatibilidad);

  async function importarCerrarSesionSANTELMO() {
    try {
      const modulo = await import("./SAN TELMO-auth.js?v=20261124-auth1");
      await modulo.cerrarSesionSANTELMO();
      window.location.href = "SAN TELMO-Loing.html";
    } catch (error) {
      console.error("No se pudo cerrar la sesión:", error);
      alert("No se pudo cerrar la sesión. Intentá nuevamente.");
    }
  }

  // El cierre de sesión queda asociado al perfil de la barra superior.
  const perfil = barra.querySelector(".perfil, .perfil-superior");
  let menuPerfil = document.getElementById("menuPerfil");
  if (perfil) {
    perfil.setAttribute("aria-haspopup", "menu");
    perfil.setAttribute("aria-expanded", "false");
    if (!perfil.matches("button, a, [tabindex]")) {
      perfil.setAttribute("role", "button");
      perfil.tabIndex = 0;
    }

    if (!menuPerfil) {
      menuPerfil = document.createElement("div");
      menuPerfil.id = "menuPerfil";
      menuPerfil.className = "menu-perfil";
      menuPerfil.hidden = true;
      menuPerfil.innerHTML = '<button type="button" class="accion-cerrar-perfil" id="cerrarSesionPerfil"><span aria-hidden="true">↪</span>Cerrar sesión</button>';
      perfil.insertAdjacentElement("afterend", menuPerfil);
    }

    const cerrarMenuPerfil = () => {
      menuPerfil.hidden = true;
      perfil.setAttribute("aria-expanded", "false");
    };
    const alternarMenuPerfil = () => {
      menuPerfil.hidden = !menuPerfil.hidden;
      perfil.setAttribute("aria-expanded", String(!menuPerfil.hidden));
    };

    perfil.addEventListener("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      alternarMenuPerfil();
    }, true);
    if (!perfil.matches("button, a")) {
      perfil.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          alternarMenuPerfil();
        }
      });
    }
    menuPerfil.addEventListener("click", event => event.stopPropagation());
    menuPerfil.querySelector("#cerrarSesionPerfil")?.addEventListener("click", event => {
      event.preventDefault();
      if (window.confirm("¿Querés cerrar la sesión de SANTELMO?")) importarCerrarSesionSANTELMO();
    });
    document.addEventListener("click", event => {
      if (!perfil.contains(event.target) && !menuPerfil.contains(event.target)) cerrarMenuPerfil();
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape") cerrarMenuPerfil();
    });
  }

  if (overlay) {
    overlay.classList.add("capa-sidebar");
  } else {
    overlay = document.createElement("div");
    overlay.id = "capaSidebar";
    overlay.className = "capa-sidebar";
    barra.insertAdjacentElement("afterend", overlay);
  }
  overlay.addEventListener("click", event => {
    event.preventDefault();
    event.stopImmediatePropagation();
    cerrarMenu();
  }, true);

  function actualizarEstado() {
    const abierto = !sidebar.classList.contains("oculto");
    if (botonMenu) {
      botonMenu.setAttribute("aria-expanded", String(abierto));
      botonMenu.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    }
    const capa = document.getElementById("capaSidebar") || document.getElementById("fondoSidebar");
    if (capa) capa.classList.toggle("visible", window.innerWidth <= 760 && abierto);
  }

  function cerrarMenu() {
    sidebar.classList.add("oculto");
    actualizarEstado();
  }

  // Control único: el botón fue clonado arriba para quitar cualquier
  // onclick o listener anterior de la página.
  if (botonMenu) {
    botonMenu.setAttribute("aria-controls", "sidebar");
    botonMenu.setAttribute("aria-expanded", String(!sidebar.classList.contains("oculto")));
    botonMenu.setAttribute("aria-label", sidebar.classList.contains("oculto") ? "Abrir menú" : "Cerrar menú");
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

  // Escape cierra el menú y sincroniza el overlay compartido, incluso en
  // páginas que todavía conservan manejadores antiguos de teclado.
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !sidebar.classList.contains("oculto")) {
      cerrarMenu();
    }
  });
  ajustarPantalla();
  window.addEventListener("resize", ajustarPantalla);

  // Señala que la barra lateral común ya está construida.
  window.SANTELMO_LAYOUT_LISTO = true;
  window.dispatchEvent(new Event("santelmo-layout-listo"));
})();