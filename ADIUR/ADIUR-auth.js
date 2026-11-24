/* ADIUR FEMENINO · AUTENTICACIÓN CENTRALIZADA FIREBASE
   El usuario escribe solo su nombre de usuario. El correo técnico
   se deriva internamente y nunca se muestra en pantalla. */
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCc0dPIEkaKxbHoRC2CgZK412dXVGPOdTI",
  authDomain: "adiur-b1913.firebaseapp.com",
  projectId: "adiur-b1913",
  storageBucket: "adiur-b1913.firebasestorage.app",
  messagingSenderId: "884643321144",
  appId: "1:884643321144:web:ba3c314de3a1c9e3545dcd",
  measurementId: "G-58LL26YXPM"
};
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export function normalizarUsuarioADIUR(usuario) {
  return String(usuario || "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
}
export function correoTecnicoADIUR(usuario) {
  const limpio = normalizarUsuarioADIUR(usuario);
  if (!limpio) throw new Error("Ingresá un nombre de usuario válido.");
  return limpio + "@adiur-b1913.firebaseapp.com";
}
export async function iniciarSesionADIUR(usuario, contrasena) {
  // Mantener la sesión al navegar entre páginas y al cerrar/abrir el navegador.
  // Si el navegador restringe el almacenamiento, se conserva la persistencia por defecto de Firebase.
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    console.warn("No se pudo fijar la persistencia local de la sesión; se usará la persistencia disponible de Firebase:", error);
  }
  const credencial = await signInWithEmailAndPassword(auth, correoTecnicoADIUR(usuario), contrasena);
  const referencia = doc(db, "usuarios", credencial.user.uid);
  const perfil = await getDoc(referencia);
  if (!perfil.exists() || perfil.data().activo !== true) {
    await signOut(auth);
    try { localStorage.removeItem("usuarioADIUR"); localStorage.removeItem("rolADIUR"); localStorage.removeItem("categoriasADIUR"); } catch (_) {}
    throw new Error("La cuenta todavía no tiene un perfil habilitado. Contactá al administrador del club.");
  }
  const datosPerfil = perfil.data();
  // Compatibilidad temporal con las páginas que todavía leen el usuario local.
  // La identidad real y la autorización siguen dependiendo de Firebase Auth y Firestore.
  try {
    localStorage.setItem("usuarioADIUR", String(datosPerfil.usuario || usuario).trim());
    if (datosPerfil.rol) localStorage.setItem("rolADIUR", String(datosPerfil.rol).trim().toLowerCase());
    if (Array.isArray(datosPerfil.categorias)) localStorage.setItem("categoriasADIUR", JSON.stringify(datosPerfil.categorias));
  } catch (error) {
    console.warn("No se pudo guardar el nombre de usuario para compatibilidad:", error);
  }
  return { user: credencial.user, perfil: datosPerfil };
}
export async function obtenerPerfilADIUR(user) {
  if (!user) return null;
  const snapshot = await getDoc(doc(db, "usuarios", user.uid));
  if (!snapshot.exists() || snapshot.data().activo === false) return null;
  return snapshot.data();
}
export async function observarSesionADIUR(callback) {
  // No escuchar el primer estado hasta que Firebase termine de restaurar
  // la sesión persistida. Evita interpretar el estado inicial como usuario desconectado.
  if (typeof auth.authStateReady === "function") await auth.authStateReady();
  return onAuthStateChanged(auth, callback);
}
export async function cerrarSesionADIUR() {
  await signOut(auth);
  try { localStorage.removeItem("usuarioADIUR"); localStorage.removeItem("rolADIUR"); localStorage.removeItem("categoriasADIUR"); } catch (_) {}
}
