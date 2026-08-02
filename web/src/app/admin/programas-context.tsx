"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { PROGRAMAS_EJEMPLO, type Programa } from "@/lib/programas";

type ProgramasContextValue = {
  programas: Programa[];
  agregarPrograma: (p: Programa) => void;
  actualizarPrograma: (id: string, cambios: Partial<Programa>) => void;
  obtenerPrograma: (id: string) => Programa | undefined;
};

const ProgramasContext = createContext<ProgramasContextValue | null>(null);

// Estado en memoria, solo para la sesión del navegador — sin localStorage ni Supabase todavía.
// Se comparte entre las rutas de /admin (lista, wizard de creación, edición) vía Context.
export function ProgramasProvider({ children }: { children: ReactNode }) {
  const [programas, setProgramas] = useState<Programa[]>(PROGRAMAS_EJEMPLO);

  function agregarPrograma(p: Programa) {
    setProgramas((prev) => [p, ...prev]);
  }

  function actualizarPrograma(id: string, cambios: Partial<Programa>) {
    setProgramas((prev) => prev.map((p) => (p.id === id ? { ...p, ...cambios } : p)));
  }

  function obtenerPrograma(id: string) {
    return programas.find((p) => p.id === id);
  }

  return (
    <ProgramasContext.Provider value={{ programas, agregarPrograma, actualizarPrograma, obtenerPrograma }}>
      {children}
    </ProgramasContext.Provider>
  );
}

export function useProgramas() {
  const ctx = useContext(ProgramasContext);
  if (!ctx) throw new Error("useProgramas debe usarse dentro de <ProgramasProvider>");
  return ctx;
}
