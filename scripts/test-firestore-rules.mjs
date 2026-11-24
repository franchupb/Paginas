import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";

const projectId = "demo-adiur-rules";
const env = await initializeTestEnvironment({ projectId });

try {
  await env.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    const categorias = ["Sub 10", "Sub 12", "Sub 14", "Sub 16", "Primera"];
    await setDoc(doc(db, "usuarios", "admin"), { activo: true, rol: "admin", categorias });
    await setDoc(doc(db, "usuarios", "coordinadora"), { activo: true, rol: "coordinadora", categorias });
    await setDoc(doc(db, "usuarios", "coach16"), { activo: true, rol: "cuerpo_tecnico", categorias: ["Sub 16"] });
    await setDoc(doc(db, "usuarios", "coach14"), { activo: true, rol: "cuerpo_tecnico", categorias: ["Sub 14"] });
    await setDoc(doc(db, "usuarios", "player16"), { activo: true, rol: "jugadora", categorias: ["Sub 16"], jugadora: "Jugadora Prueba" });

    await setDoc(doc(db, "planificacionADIUR", "sub_16"), { categoria: "Sub 16", datos: { semana: 1 } });
    await setDoc(doc(db, "planificacionADIUR", "primera"), { categoria: "Primera", datos: { semana: 2 } });
    await setDoc(doc(db, "planificacionADIUR", "principal"), { datos: { "Sub 16": {} } });
    await setDoc(doc(db, "gimnasioADIUR", "sub_16"), { categoria: "Sub 16", tipo: "categoria", datos: {} });
    await setDoc(doc(db, "calculadoraADIUR", "sub_16"), { categoria: "Sub 16", plans: {} });
    await setDoc(doc(db, "calendarioADIUR", "sub_16"), { categoria: "Sub 16", actividades: {} });
    await setDoc(doc(db, "jugadoras", "j16"), { categoria: "Sub 16", nombre: "Jugadora Prueba" });
    await setDoc(doc(db, "jugadoras", "j1"), { categoria: "Primera", nombre: "Otra Jugadora" });
    await setDoc(doc(db, "plantel", "jugadoras"), { lista: [] });
    await setDoc(doc(db, "encuestas_periodos", "abierta"), { categoria: "Sub 16", estado: "abierta" });
    await setDoc(doc(db, "encuestas_periodos", "cerrada"), { categoria: "Sub 16", estado: "cerrada" });
    await setDoc(doc(db, "pizarrasADIUR", "coach16"), { uid: "coach16", players: [], drawings: [] });
  });

  const coach16 = env.authenticatedContext("coach16").firestore();
  const coach14 = env.authenticatedContext("coach14").firestore();
  const player16 = env.authenticatedContext("player16").firestore();
  const admin = env.authenticatedContext("admin").firestore();
  const coordinator = env.authenticatedContext("coordinadora").firestore();
  const anonymous = env.unauthenticatedContext().firestore();

  await assertSucceeds(getDoc(doc(coach16, "planificacionADIUR", "sub_16")));
  await assertFails(getDoc(doc(coach16, "planificacionADIUR", "primera")));
  await assertFails(getDoc(doc(coach14, "planificacionADIUR", "sub_16")));
  await assertSucceeds(getDocs(query(collection(coach16, "planificacionADIUR"), where("categoria", "in", ["Sub 16"]))));
  await assertSucceeds(setDoc(doc(coach16, "planificacionADIUR", "sub_16_new"), { categoria: "Sub 16", datos: {} }));
  await assertFails(setDoc(doc(coach16, "planificacionADIUR", "primera_new"), { categoria: "Primera", datos: {} }));
  const moverRef = doc(coach16, "planificacionADIUR", "mover");
  await assertSucceeds(setDoc(moverRef, { categoria: "Sub 16", datos: {} }));
  await assertFails(setDoc(moverRef, { categoria: "Primera", datos: {} }));
  await assertFails(getDocs(collection(coach16, "planificacionADIUR")));

  await assertSucceeds(getDoc(doc(player16, "jugadoras", "j16")));
  await assertSucceeds(getDocs(query(collection(coach16, "jugadoras"), where("categoria", "in", ["Sub 16"]))));
  await assertFails(getDocs(collection(coach16, "jugadoras")));
  await assertFails(getDoc(doc(player16, "jugadoras", "j1")));
  await assertFails(setDoc(doc(player16, "jugadoras", "jugadora_nueva"), { categoria: "Sub 16", nombre: "Otra" }));
  await assertSucceeds(getDoc(doc(player16, "gimnasioADIUR", "sub_16")));
  await assertSucceeds(getDoc(doc(player16, "calendarioADIUR", "sub_16")));
  await assertFails(setDoc(doc(player16, "calendarioADIUR", "sub_16"), { categoria: "Sub 16", actividades: {} }));
  await assertSucceeds(setDoc(doc(coach16, "calendarioADIUR", "sub_16"), { categoria: "Sub 16", actividades: {} }));
  await assertFails(setDoc(doc(coach16, "calendarioADIUR", "primera"), { categoria: "Primera", actividades: {} }));
  await assertFails(getDoc(doc(player16, "calculadoraADIUR", "sub_16")));

  await assertSucceeds(getDoc(doc(admin, "planificacionADIUR", "principal")));
  await assertFails(getDoc(doc(coach16, "planificacionADIUR", "principal")));
  await assertSucceeds(getDoc(doc(admin, "plantel", "jugadoras")));
  await assertFails(getDoc(doc(coach16, "plantel", "jugadoras")));

  await assertSucceeds(getDoc(doc(coach16, "pizarrasADIUR", "coach16")));
  await assertSucceeds(setDoc(doc(coach16, "pizarrasADIUR", "coach16"), { uid: "coach16", players: [], drawings: [] }));
  await assertFails(setDoc(doc(coach16, "pizarrasADIUR", "coach14"), { uid: "coach14", players: [], drawings: [] }));
  await assertFails(getDoc(doc(coach16, "pizarrasADIUR", "coach14")));
  await assertFails(getDoc(doc(player16, "pizarrasADIUR", "player16")));

  await assertSucceeds(getDoc(doc(player16, "encuestas_periodos", "abierta")));
  await assertSucceeds(getDoc(doc(anonymous, "encuestas_periodos", "abierta")));
  await assertFails(getDoc(doc(anonymous, "encuestas_periodos", "cerrada")));
  await assertSucceeds(setDoc(doc(player16, "encuestas_respuestas", "respuesta-propia"), {
    uid: "player16", categoria: "Sub 16", periodoId: "abierta", respuesta: "sí"
  }));
  await assertFails(setDoc(doc(player16, "encuestas_respuestas", "respuesta-ajena"), {
    uid: "coach16", categoria: "Sub 16", periodoId: "abierta", respuesta: "sí"
  }));
  await assertSucceeds(setDoc(doc(anonymous, "encuestas_respuestas", "respuesta-publica"), {
    uid: null, categoria: "Sub 16", periodoId: "abierta", respuesta: "sí"
  }));
  await assertFails(setDoc(doc(anonymous, "encuestas_respuestas", "respuesta-cerrada"), {
    uid: null, categoria: "Sub 16", periodoId: "cerrada", respuesta: "sí"
  }));

  await assertSucceeds(setDoc(doc(coordinator, "jugadoras", "borrar-coord"), { categoria: "Sub 16", nombre: "Temporal" }));
  await assertSucceeds(deleteDoc(doc(coordinator, "jugadoras", "borrar-coord")));
  await assertSucceeds(setDoc(doc(coach16, "jugadoras", "borrar-coach"), { categoria: "Sub 16", nombre: "Temporal" }));
  await assertFails(deleteDoc(doc(coach16, "jugadoras", "borrar-coach")));

  console.log("Firestore rules tests passed.");
} finally {
  await env.cleanup();
}
