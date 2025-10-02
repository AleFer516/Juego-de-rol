import React, { useEffect, useState } from "react";
import { Catalogo } from "../api";
import Header from "../components/Header";

/** Paleta compartida */
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

const inputBase =
  "w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1";
const inputTheme = `border-[${c[200]}] text-[#103731] placeholder:text-[#257E71]/50 focus-visible:ring-[${c[400]}] focus-visible:border-[${c[400]}] bg-white`;

function Button({ children, onClick, variant = "primary", type = "button", disabled }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: `bg-[${c[600]}] text-white hover:bg-[${c[700]}] focus-visible:ring-[${c[500]}]`,
    subtle: `bg-[${c[50]}] text-[${c[900]}] hover:bg-[${c[100]}] focus-visible:ring-[${c[300]}]`,
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
    style={{ boxShadow: "0 1px 2px rgba(16,55,49,0.05), 0 8px 24px rgba(37,126,113,0.08)" }}
  >
    {children}
  </div>
);

function Caja({ titulo, lista, placeholder, valor, onChange, onAdd }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-semibold text-[#103731]">{titulo}</h4>
        <span className="text-xs text-[#257E71]">{lista.length} ítem(s)</span>
      </div>

      <ul className={`mb-4 max-h-40 overflow-auto rounded-xl border border-[${c[100]}] bg-[${c[50]}]`}>
        {lista.length === 0 ? (
          <li className="px-3 py-2 text-sm text-[#257E71]">Sin registros</li>
        ) : (
          lista.map((x) => (
            <li key={x.id} className="px-3 py-2 text-sm text-[#103731] border-b border-[rgba(16,55,49,0.06)] last:border-none">
              {x.nombre}
            </li>
          ))
        )}
      </ul>

      <div className="flex gap-2">
        <input
          className={`${inputBase} ${inputTheme}`}
          placeholder={placeholder}
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          maxLength={50}
          pattern="^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]+$"
        />
        <Button onClick={onAdd}>Agregar</Button>
      </div>
    </Card>
  );
}

export default function CatalogoGM() {
  const [razas, setRazas] = useState([]);
  const [habilidades, setHabilidades] = useState([]);
  const [poderes, setPoderes] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [nuevo, setNuevo] = useState({ raza: "", habilidad: "", poder: "", equipo: "" });
  const [msg, setMsg] = useState("");

  async function cargar() {
    try {
      const [r, h, p, e] = await Promise.all([
        Catalogo.listarRazas(),
        Catalogo.listarHabilidades(),
        Catalogo.listarPoderes(),
        Catalogo.listarEquipamientos(),
      ]);
      setRazas(r);
      setHabilidades(h);
      setPoderes(p);
      setEquipos(e);
    } catch (e) {
      setMsg("No autorizado (¿rol GM?)");
    }
  }
  useEffect(() => {
    cargar();
  }, []);

  async function crear(tipo) {
    setMsg("");
    try {
      if (tipo === "raza" && nuevo.raza) await Catalogo.crearRaza(nuevo.raza);
      if (tipo === "habilidad" && nuevo.habilidad) await Catalogo.crearHabilidad(nuevo.habilidad);
      if (tipo === "poder" && nuevo.poder) await Catalogo.crearPoder(nuevo.poder);
      if (tipo === "equipo" && nuevo.equipo) await Catalogo.crearEquipamiento(nuevo.equipo);
      setNuevo({ ...nuevo, [tipo]: "" });
      await cargar();
    } catch (e) {
      setMsg("Error creando ítem (ver consola)");
      console.error(e);
    }
  }

  return (
    <>
      <Header />

      {/* Encabezado */}
      <div className={`w-full bg-[${c[50]}] border-b border-[${c[100]}]`}>
        <div className="mx-auto max-w-5xl px-4 py-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#103731]">Catálogo (solo GM)</h2>
          <span className="ml-2 inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
  En desarrollo
</span>

          <p className="mt-1 text-sm text-[#257E71]">
            Administra las opciones globales que luego se usan al crear/editar personajes.
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="mx-auto max-w-5xl px-4 py-6">
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


        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Caja
            titulo="Razas"
            lista={razas}
            placeholder="Nueva raza"
            valor={nuevo.raza}
            onChange={(v) => setNuevo({ ...nuevo, raza: v })}
            onAdd={() => crear("raza")}
          />
          <Caja
            titulo="Habilidades"
            lista={habilidades}
            placeholder="Nueva habilidad"
            valor={nuevo.habilidad}
            onChange={(v) => setNuevo({ ...nuevo, habilidad: v })}
            onAdd={() => crear("habilidad")}
          />
          <Caja
            titulo="Poderes"
            lista={poderes}
            placeholder="Nuevo poder"
            valor={nuevo.poder}
            onChange={(v) => setNuevo({ ...nuevo, poder: v })}
            onAdd={() => crear("poder")}
          />
          <Caja
            titulo="Equipamientos"
            lista={equipos}
            placeholder="Nuevo equipamiento"
            valor={nuevo.equipo}
            onChange={(v) => setNuevo({ ...nuevo, equipo: v })}
            onAdd={() => crear("equipo")}
          />
        </div>
      </div>
    </>
  );
}
