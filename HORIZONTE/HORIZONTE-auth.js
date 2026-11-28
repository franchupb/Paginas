/* HORIZONTE · AUTENTICACIÓN CENTRALIZADA CON FIREBASE
   Las cuentas se administran en Firebase Authentication.
   El perfil se valida en Firestore: usuarios/{uid}.
   Este módulo utiliza exclusivamente el proyecto Firebase de HORIZONTE.
*/
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCCC2AQ_pPEL1dM976JNGYaLrXluFR_ntM",
  authDomain: "horizonte-21aa1.firebaseapp.com",
  projectId: "horizonte-21aa1",
  storageBucket: "horizonte-21aa1.firebasestorage.app",
  messagingSenderId: "977841417989",
  appId: "1:977841417989:web:29be738bff91da44e5d16c",
  measurementId: "G-KQKZRL3ZH3"
};

const app = getApps().find(item => item.name === "horizonte-auth") || initializeApp(firebaseConfig, "horizonte-auth");
export const auth = getAuth(app);
export const db = getFirestore(app);

export function normalizarUsuarioHORIZONTE(usuario) {
  return String(usuario || "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
}

export function correoTecnicoHORIZONTE(usuario) {
  const limpio = normalizarUsuarioHORIZONTE(usuario);
  if (!limpio) throw new Error("Ingresá un nombre de usuario válido.");

  // Se conserva la distinción entre las dos cuentas llamadas Kevin.
  // Los alias pertenecen exclusivamente al proyecto de HORIZONTE.
  const correosEspeciales = {
    "kevin": "kevin@horizonte-21aa1.firebaseapp.com",
    "kevin_": "kevin_@horizonte-21aa1.firebaseapp.com"
  };

  return correosEspeciales[limpio] || (limpio + "@horizonte-21aa1.firebaseapp.com");
}

export async function obtenerPerfilHORIZONTE(user) {
  if (!user) return null;
  const snapshot = await getDoc(doc(db, "usuarios", user.uid));
  if (!snapshot.exists()) return null;
  const perfil = snapshot.data();
  if (perfil?.activo !== true) return null;

  // Firestore utiliza exclusivamente el campo "categorias".
  const categorias = Array.isArray(perfil.categorias)
    ? perfil.categorias
    : (perfil.categoria ? [perfil.categoria] : []);

  return { ...perfil, categorias };
}

export async function iniciarSesionHORIZONTE(usuario, contrasena) {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    console.warn("HORIZONTE: no se pudo fijar la persistencia local; se usará la persistencia disponible de Firebase.", error);
  }
  const credencial = await signInWithEmailAndPassword(auth, correoTecnicoHORIZONTE(usuario), contrasena);
  let perfil;
  try {
    perfil = await obtenerPerfilHORIZONTE(credencial.user);
  } catch (error) {
    await signOut(auth);
    throw new Error("La cuenta inició sesión, pero no se pudo consultar su perfil en Firestore. Revisá los permisos de la colección usuarios.");
  }
  if (!perfil) {
    await signOut(auth);
    limpiarSesionHORIZONTE();
    throw new Error("La cuenta todavía no tiene un perfil activo en HORIZONTE. Contactá al administrador del club.");
  }
  guardarPerfilLocalHORIZONTE(perfil, usuario);
  return { user: credencial.user, perfil };
}

export function guardarPerfilLocalHORIZONTE(perfil, usuarioAlternativo = "") {
  const categorias = Array.isArray(perfil?.categorias)
    ? perfil.categorias
    : (perfil?.categoria ? [perfil.categoria] : []);
  const rol = String(perfil?.rol || perfil?.tipo || "").trim().toLowerCase();
  const usuario = String((rol === "jugadora" ? (perfil?.jugadora || perfil?.nombre) : perfil?.usuario) || usuarioAlternativo || perfil?.nombre || "").trim();
  try {
    localStorage.setItem("usuarioHORIZONTE", usuario);
    localStorage.setItem("nombreHORIZONTE", String(perfil?.nombre || usuario).trim());
    localStorage.setItem("rolHORIZONTE", String(perfil?.rol || perfil?.tipo || "").trim().toLowerCase());
    localStorage.setItem("categoriasHORIZONTE", JSON.stringify(categorias));
    localStorage.setItem("jugadoraHORIZONTE", String(perfil?.jugadora || ""));
    localStorage.setItem("puedeEditarHORIZONTE", String(perfil?.puedeEditar === true));
    localStorage.setItem("puedeEliminarHORIZONTE", String(perfil?.puedeEliminar === true));
    localStorage.setItem("puedeGestionarUsuariosHORIZONTE", String(perfil?.puedeGestionarUsuarios === true));
    if (Array.isArray(perfil?.paginasPermitidas)) localStorage.setItem("paginasPermitidasHORIZONTE", JSON.stringify(perfil.paginasPermitidas));
    else localStorage.removeItem("paginasPermitidasHORIZONTE");
  } catch (error) {
    console.warn("HORIZONTE: no se pudo guardar el perfil de compatibilidad.", error);
  }
}

export function limpiarSesionHORIZONTE() {
  try {
    ["usuarioHORIZONTE","nombreHORIZONTE","rolHORIZONTE","categoriasHORIZONTE","jugadoraHORIZONTE","puedeEditarHORIZONTE","puedeEliminarHORIZONTE","puedeGestionarUsuariosHORIZONTE","paginasPermitidasHORIZONTE"].forEach(key => localStorage.removeItem(key));
  } catch (_) {}
}

export async function observarSesionHORIZONTE(callback) {
  if (typeof auth.authStateReady === "function") await auth.authStateReady();
  return onAuthStateChanged(auth, callback);
}

export async function cerrarSesionHORIZONTE() {
  await signOut(auth);
  limpiarSesionHORIZONTE();
}
