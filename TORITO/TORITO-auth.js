/* TORITO · AUTENTICACIÓN CENTRALIZADA
   Las credenciales se validan exclusivamente con Firebase Authentication.
   El perfil y los permisos se consultan en Firestore usando el UID autenticado.
   No guardar contraseñas, tokens ni roles confiables en localStorage.
*/
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const PROJECT_ID = "torito-56078";
const AUTH_DOMAIN = PROJECT_ID + ".firebaseapp.com";
const firebaseConfig = {
  apiKey: "AIzaSyCsOaJVo8P5reZvfp7vjBkhkP79C_mEO94",
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: PROJECT_ID + ".firebasestorage.app",
  messagingSenderId: "497702302753",
  appId: "1:497702302753:web:04d419e13ded4b59371f60",
  measurementId: "G-32VFQHWP5Y"
};

const defaultApp = getApps().find(app => app.name === "[DEFAULT]");
if (defaultApp && defaultApp.options.projectId !== PROJECT_ID) {
  throw new Error("La aplicación Firebase predeterminada pertenece a otro proyecto. Se canceló la conexión para evitar mezclar clubes.");
}
const app = defaultApp || initializeApp(firebaseConfig);
if (app.options.projectId !== PROJECT_ID) {
  throw new Error("La conexión de TORITO no apunta al proyecto Firebase esperado.");
}

export const auth = getAuth(app);
export const db = getFirestore(app);

const CATEGORIAS_VALIDAS = Object.freeze(["Sub 10", "Sub 12", "Sub 14", "Sub 16", "Primera"]);
const ROLES_VALIDOS = new Set(["admin", "coordinadora", "cuerpo_tecnico", "jugadora"]);

export function normalizarUsuarioTORITO(valor) {
  return String(valor || "").trim().toLowerCase().normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9._-]/g, "");
}

export function correoTecnicoTORITO(usuario) {
  const limpio = normalizarUsuarioTORITO(usuario);
  if (!limpio) throw new Error("Ingresá un nombre de usuario válido.");
  return limpio + "@" + AUTH_DOMAIN;
}

export function normalizarCategoriaTORITO(valor) {
  const texto = String(valor || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]/g, "");
  const mapa = {
    sub10: "Sub 10", s10: "Sub 10", u10: "Sub 10",
    sub12: "Sub 12", s12: "Sub 12", u12: "Sub 12",
    sub14: "Sub 14", s14: "Sub 14", u14: "Sub 14",
    sub16: "Sub 16", s16: "Sub 16", u16: "Sub 16",
    primera: "Primera"
  };
  return mapa[texto] || null;
}

function validarPerfil(datos, uid) {
  if (!datos || datos.activo !== true) {
    throw new Error("La cuenta no tiene un perfil activo en TORITO. Consultá con la administración del club.");
  }
  if (!ROLES_VALIDOS.has(String(datos.rol || "").trim().toLowerCase())) {
    throw new Error("El perfil de TORITO no tiene un rol válido.");
  }
  if (!Array.isArray(datos.categorias)) {
    throw new Error("El perfil de TORITO no tiene categorías asignadas.");
  }
  const categorias = [...new Set(datos.categorias.map(normalizarCategoriaTORITO).filter(Boolean))];
  if (!categorias.length && datos.rol !== "admin") {
    throw new Error("El perfil de TORITO no tiene categorías habilitadas.");
  }
  return Object.freeze({
    uid,
    usuario: String(datos.usuario || datos.nombre || "").trim(),
    nombre: String(datos.nombre || datos.usuario || "Usuario").trim(),
    rol: String(datos.rol).trim().toLowerCase(),
    activo: true,
    categorias: Object.freeze(categorias),
    puedeEditar: datos.puedeEditar === true,
    puedeEliminar: datos.puedeEliminar === true,
    puedeGestionarUsuarios: datos.puedeGestionarUsuarios === true,
    jugadoraId: datos.jugadoraId ? String(datos.jugadoraId) : null
  });
}

export async function obtenerPerfilTORITO(user = auth.currentUser) {
  if (!user) return null;
  const snapshot = await getDoc(doc(db, "usuarios", user.uid));
  if (!snapshot.exists()) return null;
  return validarPerfil(snapshot.data(), user.uid);
}

function guardarCompatibilidad(perfil) {
  try {
    localStorage.setItem("usuarioTORITO", perfil.nombre || perfil.usuario);
    localStorage.setItem("rolTORITO", perfil.rol);
    localStorage.setItem("categoriasTORITO", JSON.stringify(perfil.categorias));
    localStorage.setItem("uidTORITO", perfil.uid);
  } catch (error) {
    console.warn("No se pudo guardar la caché visual de TORITO:", error);
  }
}

function limpiarCompatibilidad() {
  try {
    ["usuarioTORITO", "rolTORITO", "categoriasTORITO", "uidTORITO"].forEach(key => localStorage.removeItem(key));
  } catch (_) {}
}

export async function iniciarSesionTORITO(usuario, contrasena) {
  if (!String(contrasena || "")) throw new Error("Ingresá tu contraseña para continuar.");
  await setPersistence(auth, browserLocalPersistence);
  const credential = await signInWithEmailAndPassword(auth, correoTecnicoTORITO(usuario), contrasena);
  try {
    const perfil = await obtenerPerfilTORITO(credential.user);
    if (!perfil) throw new Error("La cuenta todavía no tiene un perfil de TORITO configurado.");
    guardarCompatibilidad(perfil);
    return perfil;
  } catch (error) {
    await signOut(auth).catch(() => {});
    limpiarCompatibilidad();
    throw error;
  }
}

export async function cerrarSesionTORITO() {
  limpiarCompatibilidad();
  await signOut(auth);
}

export function observarSesionTORITO(callback) {
  return onAuthStateChanged(auth, async user => {
    if (!user) {
      limpiarCompatibilidad();
      callback(null, null);
      return;
    }
    try {
      const perfil = await obtenerPerfilTORITO(user);
      if (!perfil) throw new Error("La cuenta no tiene un perfil activo de TORITO.");
      guardarCompatibilidad(perfil);
      callback(user, perfil);
    } catch (error) {
      limpiarCompatibilidad();
      await signOut(auth).catch(() => {});
      callback(null, null, error);
    }
  });
}

export function puedeAccederCategoriaTORITO(perfil, categoria) {
  const cat = normalizarCategoriaTORITO(categoria);
  if (!perfil || !perfil.activo || !cat) return false;
  return perfil.rol === "admin" || perfil.categorias.includes(cat);
}

export function puedeEditarTORITO(perfil, categoria) {
  return Boolean(perfil && perfil.activo && perfil.puedeEditar &&
    puedeAccederCategoriaTORITO(perfil, categoria) && perfil.rol !== "jugadora");
}

export function puedeEliminarTORITO(perfil, categoria) {
  return Boolean(perfil && perfil.activo && perfil.rol === "admin" &&
    perfil.puedeEliminar && puedeAccederCategoriaTORITO(perfil, categoria));
}

export { CATEGORIAS_VALIDAS };
