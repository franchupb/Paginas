import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";

const projectId = "demo-torito-rules";
const rules = await readFile(new URL("../TORITO/firestore.rules", import.meta.url), "utf8");
const env = await initializeTestEnvironment({
  projectId,
  firestore: { rules }
});

try {
  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    const all = ["Sub 10", "Sub 12", "Sub 14", "Sub 16", "Primera"];
    await setDoc(doc(db, "usuarios", "fran-uid"), {
      usuario: "fran", nombre: "Fran", activo: true, rol: "admin",
      categorias: all, puedeEditar: true, puedeEliminar: true, puedeGestionarUsuarios: true
    });
    await setDoc(doc(db, "usuarios", "liana-uid"), {
      usuario: "liana", nombre: "Liana", activo: true, rol: "cuerpo_tecnico",
      categorias: ["Primera"], puedeEditar: false, puedeEliminar: false, puedeGestionarUsuarios: false
    });
    await setDoc(doc(db, "usuarios", "inactivo-uid"), {
      usuario: "inactivo", activo: false, rol: "cuerpo_tecnico",
      categorias: ["Primera"], puedeEditar: false, puedeEliminar: false
    });

    await setDoc(doc(db, "torito_jugadoras", "primera-1"), { categoria: "Primera", nombre: "Registro de prueba" });
    await setDoc(doc(db, "torito_jugadoras", "sub16-1"), { categoria: "Sub 16", nombre: "Registro de prueba" });
    await setDoc(doc(db, "torito_partidos", "primera-1"), { categoria: "Primera", rival: "Prueba" });
    await setDoc(doc(db, "torito_asistenciaTORITO", "primera-2026-01-01"), { categoria: "Primera", fecha: "2026-01-01", asistencias: {} });
    await setDoc(doc(db, "torito_configuracionAsistenciaTORITO", "Primera"), { categoria: "Primera", dias: [1, 3, 5] });
    await setDoc(doc(db, "torito_testeos_torito", "Primera_Enero"), { division: "Primera", mes: "Enero", valores: {} });
    await setDoc(doc(db, "torito_tiemposRendimiento", "primera-1"), { categoria: "Primera", jugadora: "Registro de prueba" });
    await setDoc(doc(db, "torito_informes", "primera-1"), { categoria: "Primera", resumen: "Prueba" });
    await setDoc(doc(db, "torito_lesiones", "primera-1"), { categoria: "Primera", estado: "Prueba" });
    await setDoc(doc(db, "torito_gimnasio_categorias", "primera"), { categoria: "Primera", datos: {} });
    await setDoc(doc(db, "torito_gimnasio_categorias", "sub_16"), { categoria: "Sub 16", datos: {} });
    await setDoc(doc(db, "torito_planificacion_categorias", "primera"), { categoria: "Primera", datos: {} });
    await setDoc(doc(db, "torito_planificacion_categorias", "sub_16"), { categoria: "Sub 16", datos: {} });
    await setDoc(doc(db, "torito_calendario_categorias", "primera"), { categoria: "Primera", actividades: {} });
    await setDoc(doc(db, "torito_calculadora_categorias", "primera"), { categoria: "Primera", planes: {} });
    await setDoc(doc(db, "torito_encuestas_categorias", "primera"), { categoria: "Primera", dias: [] });
    await setDoc(doc(db, "torito_estadisticas_categorias", "primera"), { categoria: "Primera", jornadas: [], partidos: {} });
    await setDoc(doc(db, "torito_estadisticas_categorias", "sub_16"), { categoria: "Sub 16", jornadas: [], partidos: {} });
    await setDoc(doc(db, "torito_planificacionTORITO", "principal"), { datos: { "Primera": {}, "Sub 16": {} } });
    await setDoc(doc(db, "torito_gimnasioTORITO", "principal"), { datos: { "Primera": {}, "Sub 16": {} } });
    await setDoc(doc(db, "torito_plantel", "jugadoras"), { lista: [] });
    await setDoc(doc(db, "coleccion_no_autorizada", "dato"), { categoria: "Primera" });
  });

  const fran = env.authenticatedContext("fran-uid").firestore();
  const liana = env.authenticatedContext("liana-uid").firestore();
  const inactivo = env.authenticatedContext("inactivo-uid").firestore();
  const anonimo = env.unauthenticatedContext().firestore();

  console.log("Prueba: Liana solo puede leer Primera.");
  await assertSucceeds(getDoc(doc(liana, "torito_jugadoras", "primera-1")));
  await assertFails(getDoc(doc(liana, "torito_jugadoras", "sub16-1")));
  await assertSucceeds(getDocs(query(collection(liana, "torito_jugadoras"), where("categoria", "in", ["Primera"]))));
  await assertFails(getDocs(collection(liana, "torito_jugadoras")));
  await assertSucceeds(getDoc(doc(liana, "torito_gimnasio_categorias", "primera")));
  await assertFails(getDoc(doc(liana, "torito_gimnasio_categorias", "sub_16")));
  await assertSucceeds(getDoc(doc(liana, "torito_planificacion_categorias", "primera")));
  await assertSucceeds(getDoc(doc(liana, "torito_estadisticas_categorias", "primera")));
  await assertFails(getDoc(doc(liana, "torito_estadisticas_categorias", "sub_16")));
  await assertFails(getDoc(doc(liana, "torito_planificacion_categorias", "sub_16")));
  await assertSucceeds(getDoc(doc(liana, "torito_testeos_torito", "Primera_Enero")));
  await assertFails(getDoc(doc(liana, "torito_planificacionTORITO", "principal")));
  await assertFails(getDoc(doc(liana, "torito_gimnasioTORITO", "principal")));
  await assertFails(getDoc(doc(liana, "torito_plantel", "jugadoras")));
  await assertFails(setDoc(doc(liana, "torito_jugadoras", "liana-nuevo"), { categoria: "Primera", nombre: "No autorizado" }));
  await assertFails(deleteDoc(doc(liana, "torito_jugadoras", "primera-1")));

  console.log("Prueba: Fran administra todas las categorías.");
  await assertSucceeds(getDoc(doc(fran, "torito_jugadoras", "sub16-1")));
  await assertSucceeds(getDoc(doc(fran, "torito_estadisticas_categorias", "sub_16")));
  await assertSucceeds(getDocs(query(collection(fran, "torito_jugadoras"), where("categoria", "in", ["Sub 10", "Sub 12", "Sub 14", "Sub 16", "Primera"]))));
  await assertSucceeds(getDoc(doc(fran, "torito_planificacionTORITO", "principal")));
  await assertSucceeds(setDoc(doc(fran, "torito_jugadoras", "fran-nuevo"), { categoria: "Primera", nombre: "Registro de prueba" }));
  await assertSucceeds(deleteDoc(doc(fran, "torito_jugadoras", "fran-nuevo")));

  console.log("Prueba: cuentas inactivas y visitantes no acceden.");
  await assertFails(getDoc(doc(inactivo, "torito_jugadoras", "primera-1")));
  await assertFails(getDoc(doc(anonimo, "torito_jugadoras", "primera-1")));
  await assertFails(getDoc(doc(liana, "coleccion_no_autorizada", "dato")));

  console.log("Todas las pruebas de reglas de TORITO finalizaron correctamente.");
} finally {
  await env.cleanup();
}
