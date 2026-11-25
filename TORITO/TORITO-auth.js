/* TORITO · AUTENTICACIÓN CENTRALIZADA CON FIREBASE
   Las cuentas se administran en Firebase Authentication.
   El perfil se valida en Firestore: usuarios/{uid}.
   Este módulo usa exclusivamente el proyecto Firebase de TORITO.
*/
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCsOaJVo8P5reZvfp7vjBkhkP79C_mEO94",
  authDomain: "torito-56078.firebaseapp.com",
  projectId: "torito-56078",
  storageBucket: "torito-56078.firebasestorage.app",
  messagingSenderId: "497702302753",
  appId: "1:497702302753:web:04d419e13ded4b59371f60",
  measurementId: "G-32VFQHWP5Y"
};

const app = getApps().find(item => item.options?.projectId === firebaseConfig.projectId) || initializeApp(firebaseConfig, "torito-auth");
export const auth = getAuth(app);
export const db = getFirestore(app);

export function normalizarUsuarioTORITO(usuario) {
  return String(usuario || "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
}

export function correoTecnicoTORITO(usuario) {
  const limpio = normalizarUsuarioTORITO(usuario);
  if (!limpio) throw new Error("Ingresá un nombre de usuario válido.");
  return limpio + "@torito-56078.firebaseapp.com";
}

export async function obtenerPerfilTORITO(user) {
  if (!user) return null;
  const snapshot = await getDoc(doc(db, "usuarios", user.uid));
  if (!snapshot.exists()) return null;
  const perfil = snapshot.data();
  return perfil?.activo === true ? perfil : null;
}

export async function iniciarSesionTORITO(usuario, contrasena) {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    console.warn("TORITO: no se pudo fijar la persistencia local; se usará la persistencia disponible de Firebase.", error);
  }
  const credencial = await signInWithEmailAndPassword(auth, correoTecnicoTORITO(usuario), contrasena);
  let perfil;
  try {
    perfil = await obtenerPerfilTORITO(credencial.user);
  } catch (error) {
    await signOut(auth);
    throw new Error("La cuenta inició sesión, pero no se pudo consultar su perfil en Firestore. Revisá los permisos de la colección usuarios.");
  }
  if (!perfil) {
    await signOut(auth);
    limpiarSesionTORITO();
    throw new Error("La cuenta todavía no tiene un perfil activo en TORITO. Contactá al administrador del club.");
  }
  guardarPerfilLocalTORITO(perfil, usuario);
  return { user: credencial.user, perfil };
}

export function guardarPerfilLocalTORITO(perfil, usuarioAlternativo = "") {
  const categorias = Array.isArray(perfil?.categorias)
    ? perfil.categorias
    : (perfil?.categoria ? [perfil.categoria] : []);
  const rol = String(perfil?.rol || perfil?.tipo || "").trim().toLowerCase();
  const usuario = String((rol === "jugadora" ? (perfil?.jugadora || perfil?.nombre) : perfil?.usuario) || usuarioAlternativo || perfil?.nombre || "").trim();
  try {
    localStorage.setItem("usuarioTORITO", usuario);
    localStorage.setItem("nombreTORITO", String(perfil?.nombre || usuario).trim());
    localStorage.setItem("rolTORITO", String(perfil?.rol || perfil?.tipo || "").trim().toLowerCase());
    localStorage.setItem("categoriasTORITO", JSON.stringify(categorias));
    localStorage.setItem("jugadoraTORITO", String(perfil?.jugadora || ""));
    localStorage.setItem("puedeEditarTORITO", String(perfil?.puedeEditar === true));
    localStorage.setItem("puedeEliminarTORITO", String(perfil?.puedeEliminar === true));
    localStorage.setItem("puedeGestionarUsuariosTORITO", String(perfil?.puedeGestionarUsuarios === true));
    if (Array.isArray(perfil?.paginasPermitidas)) localStorage.setItem("paginasPermitidasTORITO", JSON.stringify(perfil.paginasPermitidas));
    else localStorage.removeItem("paginasPermitidasTORITO");
  } catch (error) {
    console.warn("TORITO: no se pudo guardar el perfil de compatibilidad.", error);
  }
}

export function limpiarSesionTORITO() {
  try {
    ["usuarioTORITO","nombreTORITO","rolTORITO","categoriasTORITO","jugadoraTORITO","puedeEditarTORITO","puedeEliminarTORITO","puedeGestionarUsuariosTORITO","paginasPermitidasTORITO"].forEach(key => localStorage.removeItem(key));
  } catch (_) {}
}

export async function observarSesionTORITO(callback) {
  if (typeof auth.authStateReady === "function") await auth.authStateReady();
  return onAuthStateChanged(auth, callback);
}

export async function cerrarSesionTORITO() {
  await signOut(auth);
  limpiarSesionTORITO();
}
