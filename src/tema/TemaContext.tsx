import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { claro, escuro, Paleta } from './cores';

const CHAVE = 'dexwish:tema';

type TemaCtx = {
  modoEscuro: boolean;
  cores: Paleta;
  pronto: boolean;
  alternar: () => void;
  definir: (escuro: boolean) => void;
};

const Ctx = createContext<TemaCtx | null>(null);

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const [modoEscuro, setModoEscuro] = useState(true);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE)
      .then((v) => {
        if (v === 'claro') setModoEscuro(false);
      })
      .finally(() => setPronto(true));
  }, []);

  const definir = useCallback((e: boolean) => {
    setModoEscuro(e);
    AsyncStorage.setItem(CHAVE, e ? 'escuro' : 'claro').catch(() => {});
  }, []);

  const alternar = useCallback(() => definir(!modoEscuro), [definir, modoEscuro]);

  const valor = useMemo(
    () => ({ modoEscuro, cores: modoEscuro ? escuro : claro, pronto, alternar, definir }),
    [modoEscuro, pronto, alternar, definir],
  );
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useTema() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTema precisa estar dentro de TemaProvider');
  return v;
}
