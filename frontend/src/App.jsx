import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Personajes from "./pages/Personajes";
import Catalogo from "./pages/Catalogo";
import { almacenamientoToken } from "./api";

// Componente para proteger rutas con token
function Protegida({ children }) {
  const token = almacenamientoToken.leer();
  return token ? children : <Navigate to="/login" replace />;
}

// Componente para proteger rutas solo de GM
function SoloGM({ children }) {
  const rol = localStorage.getItem("rol") || "";
  return rol === "GM" ? children : <Navigate to="/personajes" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirigir raíz al login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas */}
        <Route
          path="/personajes"
          element={
            <Protegida>
              <Personajes />
            </Protegida>
          }
        />
        <Route
          path="/catalogo"
          element={
            <Protegida>
              <SoloGM>
                <Catalogo />
              </SoloGM>
            </Protegida>
          }
        />

        {/* Cualquier ruta no válida redirige */}
        <Route path="*" element={<Navigate to="/personajes" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
