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
import type { FavoriteDetails } from "../../api/types";

interface FavoritesContextValue {
  favorites: FavoriteDetails[];
  error: string | null;
  isLoading: boolean;
  updatingCoinIds: string[];
  isFavorite(coinId: string): boolean;
  toggleFavorite(coinId: string): Promise<void>;
  removeFavorite(coinId: string): Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

function getFavoriteError(caughtError: unknown, fallback: string) {
  return caughtError instanceof ApiError ? caughtError.message : fallback;
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { status, token, user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteDetails[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingCoinIds, setUpdatingCoinIds] = useState<string[]>([]);

  const refresh = useCallback(
    async (options: RequestOptions = {}) => {
      if (!user || !token) {
        setFavorites([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.getFavoriteDetails(user.id, token, options);
        setFavorites(response.data);
      } catch (caughtError) {
        if (!isRequestCancelled(caughtError)) {
          setError(
            getFavoriteError(caughtError, "No se pudieron cargar tus favoritos."),
          );
        }
      } finally {
        if (!options.signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [token, user],
  );

  useEffect(() => {
    if (status === "authenticated") {
      const controller = new AbortController();
      void refresh({ signal: controller.signal });

      return () => controller.abort();
    }

    setFavorites([]);
    setError(null);
  }, [refresh, status]);

  const updateFavorite = useCallback(
    async (coinId: string, action: () => Promise<unknown>) => {
      setUpdatingCoinIds((current) =>
        current.includes(coinId) ? current : [...current, coinId],
      );
      setError(null);

      try {
        await action();
        await refresh();
      } catch (caughtError) {
        setError(getFavoriteError(caughtError, "No se pudo actualizar el favorito."));
      } finally {
        setUpdatingCoinIds((current) =>
          current.filter((currentCoinId) => currentCoinId !== coinId),
        );
      }
    },
    [refresh],
  );

  const toggleFavorite = useCallback(
    async (coinId: string) => {
      if (!user || !token) {
        return;
      }

      const favoriteExists = favorites.some((favorite) => favorite.coin_id === coinId);

      if (favoriteExists) {
        await updateFavorite(coinId, () => api.removeFavorite(user.id, coinId, token));
        return;
      }

      await updateFavorite(coinId, () => api.addFavorite(user.id, coinId, token));
    },
    [favorites, token, updateFavorite, user],
  );

  const removeFavorite = useCallback(
    async (coinId: string) => {
      if (!user || !token) {
        return;
      }

      await updateFavorite(coinId, () => api.removeFavorite(user.id, coinId, token));
    },
    [token, updateFavorite, user],
  );

  const value = useMemo(
    () => ({
      favorites,
      error,
      isLoading,
      updatingCoinIds,
      isFavorite: (coinId: string) =>
        favorites.some((favorite) => favorite.coin_id === coinId),
      toggleFavorite,
      removeFavorite,
    }),
    [error, favorites, isLoading, removeFavorite, toggleFavorite, updatingCoinIds],
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites debe utilizarse dentro de FavoritesProvider.");
  }

  return context;
}
