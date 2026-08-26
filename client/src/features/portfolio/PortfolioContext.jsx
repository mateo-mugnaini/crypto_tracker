import { jsx as _jsx } from "react/jsx-runtime";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ApiError, api, isRequestCancelled } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useMarket } from "../market/MarketContext";
const PortfolioContext = createContext(undefined);
function getErrorMessage(caughtError, fallback) {
  return caughtError instanceof ApiError ? caughtError.message : fallback;
}
export function PortfolioProvider({ children }) {
  const { status, token } = useAuth();
  const { lastUpdated } = useMarket();
  const [portfolio, setPortfolio] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [operations, setOperations] = useState([]);
  const [isOperationsLoading, setIsOperationsLoading] = useState(false);
  const [isOperationSaving, setIsOperationSaving] = useState(false);
  const [operationsSummary, setOperationsSummary] = useState(null);
  const refresh = useCallback(
    async (options = {}) => {
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
  const refreshOperations = useCallback(
    async (options = {}) => {
      if (!token) {
        setOperations([]);
        setOperationsSummary(null);
        return;
      }
      setIsOperationsLoading(true);
      try {
        const response = await api.getPortfolioOperations(token, options);
        setOperations(response.data);
        setOperationsSummary(await api.getPortfolioOperationsSummary(token, options));
      } catch (caughtError) {
        if (!isRequestCancelled(caughtError)) {
          setError(
            getErrorMessage(caughtError, "No se pudieron cargar las operaciones."),
          );
        }
      } finally {
        if (!options.signal?.aborted) setIsOperationsLoading(false);
      }
    },
    [token],
  );
  useEffect(() => {
    if (status === "authenticated") {
      const controller = new AbortController();
      void refresh({ signal: controller.signal });
      void refreshOperations({ signal: controller.signal });
      return () => controller.abort();
    }
    setPortfolio(null);
    setOperations([]);
    setOperationsSummary(null);
    setError(null);
  }, [lastUpdated, refresh, refreshOperations, status]);
  const saveHolding = useCallback(
    async (input) => {
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
    async (coinId) => {
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
  const createOperation = useCallback(
    async (input) => {
      if (!token) return false;
      setIsOperationSaving(true);
      setError(null);
      try {
        const operation = await api.createPortfolioOperation(input, token);
        setOperations((current) => [operation, ...current]);
        setOperationsSummary(await api.getPortfolioOperationsSummary(token));
        return true;
      } catch (caughtError) {
        setError(getErrorMessage(caughtError, "No se pudo registrar la operación."));
        return false;
      } finally {
        setIsOperationSaving(false);
      }
    },
    [token],
  );
  const updateOperation = useCallback(
    async (id, input) => {
      if (!token) return false;
      setIsOperationSaving(true);
      setError(null);
      try {
        const operation = await api.updatePortfolioOperation(id, input, token);
        setOperations((current) =>
          current.map((item) => (item.id === id ? operation : item)),
        );
        setOperationsSummary(await api.getPortfolioOperationsSummary(token));
        return true;
      } catch (caughtError) {
        setError(getErrorMessage(caughtError, "No se pudo editar la operación."));
        return false;
      } finally {
        setIsOperationSaving(false);
      }
    },
    [token],
  );
  const removeOperation = useCallback(
    async (id) => {
      if (!token) return false;
      setIsOperationSaving(true);
      setError(null);
      try {
        await api.removePortfolioOperation(id, token);
        setOperations((current) => current.filter((item) => item.id !== id));
        setOperationsSummary(await api.getPortfolioOperationsSummary(token));
        return true;
      } catch (caughtError) {
        setError(getErrorMessage(caughtError, "No se pudo eliminar la operación."));
        return false;
      } finally {
        setIsOperationSaving(false);
      }
    },
    [token],
  );
  const value = useMemo(
    () => ({
      portfolio,
      error,
      isLoading,
      isSaving,
      operations,
      isOperationsLoading,
      isOperationSaving,
      operationsSummary,
      refresh,
      refreshOperations,
      saveHolding,
      removeHolding,
      createOperation,
      updateOperation,
      removeOperation,
    }),
    [
      createOperation,
      error,
      isLoading,
      isOperationSaving,
      isOperationsLoading,
      isSaving,
      operations,
      operationsSummary,
      portfolio,
      refresh,
      refreshOperations,
      removeHolding,
      removeOperation,
      saveHolding,
      updateOperation,
    ],
  );
  return _jsx(PortfolioContext.Provider, { value: value, children: children });
}
export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio debe utilizarse dentro de PortfolioProvider.");
  }
  return context;
}
