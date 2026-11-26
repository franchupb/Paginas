/* SAN TELMO · AUTENTICACIÓN CENTRALIZADA CON FIREBASE
   Las cuentas se administran en Firebase Authentication.
   El perfil se valida en Firestore: usuarios/{uid}.
   Este módulo usa exclusivamente el proyecto Firebase de SAN TELMO.
*/
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDExeLCMeFUVmAFwQ8ydFvRmW9AdAJmmeg",
  authDomain: "san-telmo-f2155.firebaseapp.com",
  projectId: "san-telmo-f2155",
  storageBucket: "san-telmo-f2155.firebasestorage.app",
  messagingSenderId: "354872818092",
  appId: "1:354872818092:web:ef71af1c4b16885caa6209",
  measurementId: "G-NTK2BFQQ0D"
};

const app = getApps().find(item => item.options?.projectId === firebaseConfig.projectId) || initializeApp(firebaseConfig, "santelmo-auth");
export const auth = getAuth(app);
export const db = getFirestore(app);

export function normalizarUsuarioSANTELMO(usuario) {
  return String(usuario || "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
}

export function correoTecnicoSANTELMO(usuario) {
  const limpio = normalizarUsuarioSANTELMO(usuario);
  if (!limpio) throw new Error("Ingresá un nombre de usuario válido.");

  // Alias diferenciados para las dos cuentas cuyo nombre visible es Kevin.
  // Los correos se escriben completos porque el dominio indicado en Firebase
  // Authentication para estas cuentas no lleva el guion de "san-telmo".
  const correosEspeciales = {
    "kevin": "kevin@santelmo-f2155.firebaseapp.com",
    "kevin_": "kevin_@santelmo-f2155.firebaseapp.com"
  };

  return correosEspeciales[limpio] || (limpio + "@san-telmo-f2155.firebaseapp.com");
}

export async function obtenerPerfilSANTELMO(user) {
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

export async function iniciarSesionSANTELMO(usuario, contrasena) {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    console.warn("SANTELMO: no se pudo fijar la persistencia local; se usará la persistencia disponible de Firebase.", error);
  }
  const credencial = await signInWithEmailAndPassword(auth, correoTecnicoSANTELMO(usuario), contrasena);
  let perfil;
  try {
    perfil = await obtenerPerfilSANTELMO(credencial.user);
  } catch (error) {
    await signOut(auth);
    throw new Error("La cuenta inició sesión, pero no se pudo consultar su perfil en Firestore. Revisá los permisos de la colección usuarios.");
  }
  if (!perfil) {
    await signOut(auth);
    limpiarSesionSANTELMO();
    throw new Error("La cuenta todavía no tiene un perfil activo en SANTELMO. Contactá al administrador del club.");
  }
  guardarPerfilLocalSANTELMO(perfil, usuario);
  return { user: credencial.user, perfil };
}

export function guardarPerfilLocalSANTELMO(perfil, usuarioAlternativo = "") {
  const categorias = Array.isArray(perfil?.categorias)
    ? perfil.categorias
    : (perfil?.categoria ? [perfil.categoria] : []);
  const rol = String(perfil?.rol || perfil?.tipo || "").trim().toLowerCase();
  const usuario = String((rol === "jugadora" ? (perfil?.jugadora || perfil?.nombre) : perfil?.usuario) || usuarioAlternativo || perfil?.nombre || "").trim();
  try {
    localStorage.setItem("usuarioSANTELMO", usuario);
    localStorage.setItem("nombreSANTELMO", String(perfil?.nombre || usuario).trim());
    localStorage.setItem("rolSANTELMO", String(perfil?.rol || perfil?.tipo || "").trim().toLowerCase());
    localStorage.setItem("categoriasSANTELMO", JSON.stringify(categorias));
    localStorage.setItem("jugadoraSANTELMO", String(perfil?.jugadora || ""));
    localStorage.setItem("puedeEditarSANTELMO", String(perfil?.puedeEditar === true));
    localStorage.setItem("puedeEliminarSANTELMO", String(perfil?.puedeEliminar === true));
    localStorage.setItem("puedeGestionarUsuariosSANTELMO", String(perfil?.puedeGestionarUsuarios === true));
    if (Array.isArray(perfil?.paginasPermitidas)) localStorage.setItem("paginasPermitidasSANTELMO", JSON.stringify(perfil.paginasPermitidas));
    else localStorage.removeItem("paginasPermitidasSANTELMO");
  } catch (error) {
    console.warn("SANTELMO: no se pudo guardar el perfil de compatibilidad.", error);
  }
}

export function limpiarSesionSANTELMO() {
  try {
    ["usuarioSANTELMO","nombreSANTELMO","rolSANTELMO","categoriasSANTELMO","jugadoraSANTELMO","puedeEditarSANTELMO","puedeEliminarSANTELMO","puedeGestionarUsuariosSANTELMO","paginasPermitidasSANTELMO"].forEach(key => localStorage.removeItem(key));
  } catch (_) {}
}

export async function observarSesionSANTELMO(callback) {
  if (typeof auth.authStateReady === "function") await auth.authStateReady();
  return onAuthStateChanged(auth, callback);
}

export async function cerrarSesionSANTELMO() {
  await signOut(auth);
  limpiarSesionSANTELMO();
}
