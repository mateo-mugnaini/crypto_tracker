import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ApiError, api, isRequestCancelled } from "../../api/client";
import type { RequestOptions } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useMarket } from "../market/MarketContext";
import type { PortfolioHoldingInput, PortfolioResponse } from "../../api/types";

interface PortfolioContextValue {
  portfolio: PortfolioResponse | null;
  error: string | null;
  isLoading: boolean;
  isSaving: boolean;
  refresh(): Promise<void>;
  saveHolding(input: PortfolioHoldingInput): Promise<boolean>;
  removeHolding(coinId: string): Promise<boolean>;
}

const PortfolioContext = createContext<PortfolioContextValue | undefined>(undefined);

function getErrorMessage(caughtError: unknown, fallback: string) {
  return caughtError instanceof ApiError ? caughtError.message : fallback;
}

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const { status, token } = useAuth();
  const { lastUpdated } = useMarket();
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const refresh = useCallback(
    async (options: RequestOptions = {}) => {
      if (!token) {
        setPortfolio(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        setPortfolio(await api.getPortfolio(token, options));
      } catch (caughtError) {
        if (!isRequestCancelled(caughtError)) {
          setError(getErrorMessage(caughtError, "No se pudo cargar la cartera."));
        }
      } finally {
        if (!options.signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [token],
  );

  useEffect(() => {
    if (status === "authenticated") {
      const controller = new AbortController();
      void refresh({ signal: controller.signal });

      return () => controller.abort();
    }

    setPortfolio(null);
    setError(null);
  }, [lastUpdated, refresh, status]);

  const saveHolding = useCallback(
    async (input: PortfolioHoldingInput) => {
      if (!token) return false;

      setIsSaving(true);
      setError(null);

      try {
        setPortfolio(await api.savePortfolioHolding(input, token));
        return true;
      } catch (caughtError) {
        setError(getErrorMessage(caughtError, "No se pudo guardar la posición."));
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [token],
  );

  const removeHolding = useCallback(
    async (coinId: string) => {
      if (!token) return false;

      setError(null);

      try {
        await api.removePortfolioHolding(coinId, token);
        await refresh();
        return true;
      } catch (caughtError) {
        setError(getErrorMessage(caughtError, "No se pudo eliminar la posición."));
        return false;
      }
    },
    [refresh, token],
  );

  const value = useMemo(
    () => ({
      portfolio,
      error,
      isLoading,
      isSaving,
      refresh,
      saveHolding,
      removeHolding,
    }),
    [error, isLoading, isSaving, portfolio, refresh, saveHolding, removeHolding],
  );

  return (
    <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);

  if (!context) {
    throw new Error("usePortfolio debe utilizarse dentro de PortfolioProvider.");
  }

  return context;
}
