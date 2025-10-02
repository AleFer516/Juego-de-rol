import React, { useEffect, useState, useLayoutEffect, useRef} from "react";
import { Catalogo, PersonajesAPI } from "../api";
import Header from "../components/Header";


/** Design tokens (paleta) */
const c = {
  50: "#EBF9F7",
  100: "#C8EFE9",
  200: "#A4E5DB",
  300: "#81DACD",
  400: "#5DD0BF",
  500: "#36BBA7",
  600: "#2FA291",
  700: "#257E71",
  800: "#1A5B51",
  900: "#103731",
  950: "#061412",
};

/** UI — helpers */
function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-[#103731]">{children}</h3>
      {right}
    </div>
  );
}

function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: `bg-[${c[50]}] text-[${c[900]}] ring-1 ring-[${c[100]}]`,
    green: `bg-[${c[100]}] text-[${c[800]}] ring-1 ring-[${c[200]}]`,
    amber:
      "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
    red: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  };
  const cls = tones[tone] || tones.slate;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
}

function Button({ children, onClick, variant = "primary", disabled, type = "button" }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: `bg-[${c[600]}] text-white hover:bg-[${c[700]}] focus-visible:ring-[${c[500]}]`,
    subtle: `bg-[${c[50]}] text-[${c[900]}] hover:bg-[${c[100]}] focus-visible:ring-[${c[300]}]`,
    ghost: `bg-transparent text-[${c[800]}] hover:bg-[${c[50]}] focus-visible:ring-[${c[300]}]`,
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]}`}>
      {children}
    </button>
  );
}

const Card = ({ children }) => (
  <div
    className={`rounded-2xl border border-[${c[100]}] bg-white p-5 shadow-sm`}
    style={{
      boxShadow:
        "0 1px 2px rgba(16,55,49,0.05), 0 8px 24px rgba(37,126,113,0.08)",
    }}
  >
    {children}
  </div>
);

const Panel = ({ children }) => (
  <div
    className={`rounded-2xl bg-[${c[50]}] ring-1 ring-inset ring-[${c[100]}]`}
  >
    {children}
  </div>
);

const Label = ({ children }) => (
  <span className="text-xs font-medium text-[#257E71]">{children}</span>
);

const inputBase =
  "w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1";
const inputTheme = `border-[${c[200]}] text-[#103731] placeholder:text-[#257E71]/50 focus-visible:ring-[${c[400]}] focus-visible:border-[${c[400]}] bg-white`;

const Campo = ({ label, children, col = "col-span-2 md:col-span-1" }) => (
  <label className={`${col} flex flex-col gap-1`}> <Label>{label}</Label> {children} </label>
);

export default function Personajes() {
  const rol = localStorage.getItem("rol") || "";
  const esGM = rol === "GM";

  const [razas, setRazas] = useState([]);
  const [habs, setHabs] = useState([]);
  const [poderes, setPoderes] = useState([]);
  const [equipos, setEquipos] = useState([]);

  const [mis, setMis] = useState([]);
  const [disponibles, setDisponibles] = useState([]);

  const [form, setForm] = useState({ nombre: "", raza: "", poder: "", equipo: "" });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState("");

  const [opSel, setOpSel] = useState({});
  const [seleccion, setSeleccion] = useState({});

  // --- Preservar scroll cuando cambian selects o al guardar ---
const scrollYRef = useRef(null);

// llama esto justo antes de setOpSel o de recargar datos
function keepScrollPosition() {
  scrollYRef.current = window.scrollY;
}

// tras el render, si hay un valor guardado, volvemos al mismo Y
useLayoutEffect(() => {
  if (scrollYRef.current != null) {
    window.scrollTo(0, scrollYRef.current);
    scrollYRef.current = null;
  }
});


  async function cargarGM() {
    const [r, h, p, e, todos, disp] = await Promise.all([
      Catalogo.listarRazas(),
      Catalogo.listarHabilidades(),
      Catalogo.listarPoderes(),
      Catalogo.listarEquipamientos(),
      PersonajesAPI.listar(),
      PersonajesAPI.disponibles(),
    ]);
    setRazas(r);
    setHabs(h);
    setPoderes(p);
    setEquipos(e);
    setMis(todos);
    setDisponibles(disp);

    const initOps = {};
    todos.forEach((pj) => {
      const ids = (pj.opciones || []).map((o) => o.id);
      initOps[pj.id] = { op1: ids[0] || "", op2: ids[1] || "", op3: ids[2] || "" };
    });
    setOpSel(initOps);
  }

  async function cargarJugador() {
    const [misL, disp] = await Promise.all([PersonajesAPI.listar(), PersonajesAPI.disponibles()]);
    setMis(misL);
    setDisponibles(disp);

    const initSel = {};
    misL.forEach((pj) => {
      initSel[pj.id] = (pj.seleccion || []).map((x) => x.id);
    });
    setSeleccion(initSel);
  }

  useEffect(() => {
    setMsg("");
    (async () => {
      try {
        esGM ? await cargarGM() : await cargarJugador();
      } catch (e) {
        console.error(e);
        setMsg("Error cargando datos.");
      }
    })();
  }, [esGM]);

  // --- CRUD GM ---
  async function crear(e) {
    e.preventDefault();
    setMsg("");
    try {
      const payload = {
        nombre: form.nombre,
        raza: form.raza ? Number(form.raza) : null,
        poder: form.poder ? Number(form.poder) : null,
        equipamiento: form.equipo ? Number(form.equipo) : null,
      };
      await PersonajesAPI.crear(payload);
      setForm({ nombre: "", raza: "", poder: "", equipo: "" });
      await cargarGM();
    } catch (e) {
      console.error(e);
      setMsg("Error creando personaje");
    }
  }

  async function guardarCambios(e) {
    e.preventDefault();
    setMsg("");
    try {
      const payload = {
        nombre: form.nombre,
        raza: form.raza ? Number(form.raza) : null,
        poder: form.poder ? Number(form.poder) : null,
        equipamiento: form.equipo ? Number(form.equipo) : null,
      };
      await PersonajesAPI.actualizar(editId, payload);
      setEditId(null);
      setForm({ nombre: "", raza: "", poder: "", equipo: "" });
      await cargarGM();
    } catch (e) {
      console.error(e);
      setMsg("Error guardando cambios");
    }
  }

  function prepararEdicion(p) {
    setEditId(p.id);
    setForm({
      nombre: p.nombre || "",
      raza: String(p.raza || ""),
      poder: String(p.poder || ""),
      equipo: String(p.equipamiento || ""),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function eliminar(id) {
    if (!confirm("¿Eliminar personaje?")) return;
    try {
      await PersonajesAPI.eliminar(id);
      await cargarGM();
    } catch {
      alert("No se pudo eliminar");
    }
  }
  async function subirNivel(id) {
    try {
      await PersonajesAPI.subirNivel(id);
      await cargarGM();
    } catch {
      alert("No se pudo subir nivel");
    }
  }
  async function cambiarEstado(id, estado) {
    try {
      await PersonajesAPI.cambiarEstado(id, estado);
      await cargarGM();
    } catch {
      alert("No se pudo cambiar estado");
    }
  }
  async function guardarOpcionesGM(pjId) {
    const data = opSel[pjId] || {};
    const toInt = (v) => (v === "" || v === undefined ? null : Number(v));
    try {
      await PersonajesAPI.setOpciones(pjId, {
        opcion_hab1: toInt(data.op1),
        opcion_hab2: toInt(data.op2),
        opcion_hab3: toInt(data.op3),
      });
      await cargarGM();
    } catch (e) {
      console.error("set-opciones", e);
      alert("No se pudieron guardar las opciones.");
    }
  }

  // --- Jugador ---
  async function elegir(id) {
    try {
      await PersonajesAPI.elegir(id);
      await cargarJugador();
    } catch (e) {
      const m = e?.response?.data?.detalle || "No se pudo elegir el personaje.";
      alert(m);
    }
  }
  function toggleSeleccion(pid, habId) {
    setSeleccion((prev) => {
      const cur = new Set(prev[pid] || []);
      if (cur.has(habId)) cur.delete(habId);
      else {
        if (cur.size >= 2) return prev;
        cur.add(habId);
      }
      return { ...prev, [pid]: Array.from(cur) };
    });
  }
  async function confirmarEleccion(pid) {
    const arr = (seleccion[pid] || []).map(Number);
    if (arr.length !== 2) {
      alert("Debes elegir exactamente 2 habilidades.");
      return;
    }
    try {
      await PersonajesAPI.elegirHabilidades(pid, { habilidades: arr });
      await cargarJugador();
    } catch (e) {
      const m = e?.response?.data?.detalle || "No se pudo guardar la elección.";
      alert(m);
    }
  }

  const EstadoTone = (estado) => {
    if (estado === "MUERTO") return "red";
    if (estado === "CONGELADO") return "amber";
    return "green";
  };

  /** Item visual */
  const Item = (p) => (
    <li key={p.id} className="mb-3">
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h4 className="text-base font-semibold text-[#103731]">{p.nombre}</h4>
              <Badge tone="slate">Nivel {p.nivel}</Badge>
              <Badge tone={EstadoTone(p.estado)}>{p.estado}</Badge>
            </div>
            <p className="text-sm text-[#257E71]">
              {p.raza_nombre} — {p.poder_nombre} — {p.equipamiento_nombre}
              {p.propietario_username && (
                <span className="ml-2 text-[#1A5B51]">• Propietario: {p.propietario_username}</span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {esGM ? (
              <>
                <Button variant="subtle" onClick={() => prepararEdicion(p)}>Editar</Button>
                <Button variant="danger" onClick={() => eliminar(p.id)}>Eliminar</Button>
                <Button onClick={() => subirNivel(p.id)}>Subir nivel</Button>
                <Button variant="subtle" onClick={() => cambiarEstado(p.id, "VIVO")}>VIVO</Button>
                <Button variant="subtle" onClick={() => cambiarEstado(p.id, "CONGELADO")}>CONGELADO</Button>
                <Button variant="subtle" onClick={() => cambiarEstado(p.id, "MUERTO")}>MUERTO</Button>
                <Button variant="ghost" onClick={() => PersonajesAPI.liberar(p.id).then(() => cargarGM())}>
                  Liberar
                </Button>
              </>
            ) : (
              <>
                {!p.propietario_username ? (
                  <Button onClick={() => elegir(p.id)}>Elegir</Button>
                ) : null}
              </>
            )}
          </div>
        </div>

        {/* Zona inferior */}
        {esGM ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-[#103731]">Opciones (GM):</span>
            <select
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm"
              value={opSel[p.id]?.op1 || ""}
              onChange={e => {
                keepScrollPosition();
                const v = e.target.value;
                setOpSel(prev => ({ ...prev, [p.id]: { ...prev[p.id], op1: v } }));
              }}
            >
              <option value="">(opción 1)</option>
              {habs.map(h => <option key={h.id} value={h.id}>{h.nombre}</option>)}
            </select>

            <select
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm"
              value={opSel[p.id]?.op2 || ""}
              onChange={e => {
                keepScrollPosition();
                const v = e.target.value;
                setOpSel(prev => ({ ...prev, [p.id]: { ...prev[p.id], op2: v } }));
              }}
            >
              <option value="">(opción 2)</option>
              {habs.map(h => <option key={h.id} value={h.id}>{h.nombre}</option>)}
            </select>

            <select
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm"
              value={opSel[p.id]?.op3 || ""}
              onChange={e => {
                keepScrollPosition();
                const v = e.target.value;
                setOpSel(prev => ({ ...prev, [p.id]: { ...prev[p.id], op3: v } }));
              }}
            >
              <option value="">(opción 3)</option>
              {habs.map(h => <option key={h.id} value={h.id}>{h.nombre}</option>)}
</select>

            <Button onClick={() => guardarOpcionesGM(p.id)}>Guardar opciones</Button>
            {p.opciones && p.opciones.length > 0 && (
              <span className="text-sm text-[#257E71]">
                actuales: {p.opciones.map((o) => o.nombre).join(", ")}
              </span>
            )}
          </div>
        ) : (
          <div className="mt-4">
            {p.opciones && p.opciones.length > 0 ? (
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-sm font-medium text-[#103731]">Habilidades:</span>
                {/* A11y: descripción para lectores de pantalla */}
                <p className="sr-only" id={`desc-habs-${p.id}`}>
                  Selecciona exactamente dos habilidades de la lista para el personaje.
                </p>

                {p.opciones.map((o) => (
                  <label key={o.id} className="inline-flex items-center gap-2 text-sm text-[#103731]">
                    <input
                      type="checkbox"
                      aria-describedby={`desc-habs-${p.id}`}
                      className={`h-4 w-4 rounded border-[${c[300]}] text-[${c[600]}] focus:ring-[${c[500]}]`}
                      checked={(seleccion[p.id] || []).includes(o.id)}
                      onChange={() => toggleSeleccion(p.id, o.id)}
                    />
                    {o.nombre}
                  </label>
                ))}
                <Button
                  variant="primary"
                  disabled={!(seleccion[p.id] && seleccion[p.id].length === 2)}
                  onClick={() => confirmarEleccion(p.id)}
                >
                  Guardar elección (2)
                </Button>
                {p.seleccion && p.seleccion.length > 0 && (
                  <span className="text-sm text-[#257E71]">
                    Elegidas: {p.seleccion.map((x) => x.nombre).join(" y ")}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-sm text-[#257E71]">Sin opciones definidas por el GM.</span>
            )}
          </div>
        )}
      </Card>
    </li>
  );

  return (
    <>
      <Header />
      {/* Encabezado con banda temática */}
      <div className={`w-full bg-[${c[50]}] border-b border-[${c[100]}]`}>
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-[#103731]">Personajes</h2>
              <p className="mt-1 text-sm text-[#257E71]">
                {esGM
                  ? "Gestiona el catálogo y define opciones de habilidades por personaje."
                  : "Elige un personaje disponible y selecciona 2 habilidades de las opciones del GM."}
              </p>
            </div>
            <div className="hidden md:flex">
              <Badge tone="green">{esGM ? "Perfil GM" : "Perfil Jugador"}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      {/* A11y: landmark principal de la vista */}
<main id="contenido-principal">
  <div className="mx-auto max-w-5xl px-4 py-6">
        {/* GM: crear/editar */}
        {esGM && (
          <Panel>
            <div className="p-5">
              <SectionTitle
                right={<Badge tone="slate">{editId ? "Editar personaje" : "Crear personaje"}</Badge>}
              >
                Editor (GM)
              </SectionTitle>

              <form onSubmit={editId ? guardarCambios : crear} className="grid grid-cols-2 gap-4">
                <Campo label="Nombre">
                <input
                  className={`${inputBase} ${inputTheme}`}
                  placeholder="Nombre"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  maxLength={50}
                  pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]+$"
                />
                </Campo>

                <Campo label="Raza">
                  <select
                    className={`${inputBase} ${inputTheme}`}
                    value={form.raza}
                    onChange={(e) => setForm({ ...form, raza: e.target.value })}
                  >
                    <option value="">Selecciona...</option>
                    {razas.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </Campo>

                <Campo label="Poder">
                  <select
                    className={`${inputBase} ${inputTheme}`}
                    value={form.poder}
                    onChange={(e) => setForm({ ...form, poder: e.target.value })}
                  >
                    <option value="">Selecciona...</option>
                    {poderes.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </Campo>

                <Campo label="Equipamiento">
                  <select
                    className={`${inputBase} ${inputTheme}`}
                    value={form.equipo}
                    onChange={(e) => setForm({ ...form, equipo: e.target.value })}
                  >
                    <option value="">Selecciona...</option>
                    {equipos.map((eq) => (
                      <option key={eq.id} value={eq.id}>
                        {eq.nombre}
                      </option>
                    ))}
                  </select>
                </Campo>

                <div className="col-span-2 flex flex-wrap gap-3 pt-2">
                  <Button type="submit">{editId ? "Guardar cambios" : "Crear personaje"}</Button>
                  {editId && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setEditId(null);
                        setForm({ nombre: "", raza: "", poder: "", equipo: "" });
                      }}
                    >
                      Cancelar
                    </Button>
                  )}
                  {msg && (
                  // A11y: mensajes de estado como alertas
                  <div
                    role="alert"
                    aria-live="polite"
                    className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700"
                  >
                    {msg}
                  </div>
                )}

                </div>
              </form>
            </div>
          </Panel>
        )}

        {/* Jugador: disponibles */}
        {!esGM && (
          <div className="mt-8">
            <SectionTitle>Personajes disponibles</SectionTitle>
            {!disponibles || disponibles.length === 0 ? (
              <Card>
                <p className="text-sm text-[#257E71]">No hay personajes disponibles por ahora.</p>
              </Card>
            ) : (
              <ul>{disponibles.map((p) => <Item key={p.id} {...p} />)}</ul>
            )}
          </div>
        )}

        {/* Lista principal */}
        <div className="mt-8">
          <SectionTitle>{esGM ? "Todos los personajes" : "Mis personajes"}</SectionTitle>
          {!mis || mis.length === 0 ? (
            !esGM ? (
              <Card>
                <p className="text-sm text-[#257E71]">No tienes personajes asignados aún.</p>
              </Card>
            ) : (
              <Card>
                <p className="text-sm text-[#257E71]">Aún no hay personajes creados.</p>
              </Card>
            )
          ) : (
            <ul>{mis.map((p) => <Item key={p.id} {...p} />)}</ul>
          )}
        </div>
        </div>
      </main>
    </>
  );
}
