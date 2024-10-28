/* eslint-disable react/prop-types */
import { GiphyFetch } from "@giphy/js-fetch-api";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

const GifContext = createContext();

const GifProvider = ({ children }) => {
  const [gifs, setGifs] = useState([]);
  const [filter, setFilter] = useState("gifs");
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cache, setCache] = useState({});

  const gf = new GiphyFetch(import.meta.env.VITE_GIPHY_KEY);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favoriteGIFs")) || [];
    setFavorites(favorites);
  }, []);

  // Fetch GIFs based on filter
  const fetchGifs = useCallback(async (searchTerm = "") => {
    setError(null);
    setIsLoading(true);

    // Check cache first
    const cacheKey = `${filter}-${searchTerm}`;
    if (cache[cacheKey]) {
      setGifs(cache[cacheKey]);
      setIsLoading(false);
      return;
    }

    try {
      let result;
      
      switch (filter) {
        case "trending":
          result = await gf.trending({ limit: 20, offset: 0 });
          break;
        case "stickers":
          result = await gf.stickers({ limit: 20, offset: 0 });
          break;
        default:
          // If there's a search term, use search endpoint
          if (searchTerm) {
            result = await gf.search(searchTerm, { limit: 20, offset: 0 });
          } else {
            // Default to trending if no search term
            result = await gf.trending({ limit: 20, offset: 0 });
          }
      }

      setGifs(result.data);
      // Cache the results
      setCache(prev => ({ ...prev, [cacheKey]: result.data }));
    } catch (err) {
      console.error('Error fetching gifs:', err);
      setError('Failed to load GIFs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [filter, gf]);

  // Fetch initial GIFs when filter changes
  useEffect(() => {
    fetchGifs();
  }, [filter, fetchGifs]);

  const addToFavorites = useCallback((id) => {
    setFavorites(prevFavorites => {
      const newFavorites = prevFavorites.includes(id)
        ? prevFavorites.filter(itemId => itemId !== id)
        : [...prevFavorites, id];
      
      localStorage.setItem("favoriteGIFs", JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  // Fetch favorite GIFs data
  const getFavoriteGifs = useCallback(async () => {
    if (favorites.length === 0) return [];
    
    try {
      const favoriteGifs = await Promise.all(
        favorites.map(id => gf.gif(id))
      );
      return favoriteGifs.map(result => result.data);
    } catch (err) {
      console.error('Error fetching favorite gifs:', err);
      return [];
    }
  }, [favorites, gf]);

  return (
    <GifContext.Provider
      value={{
        gf,
        gifs,
        setGifs,
        addToFavorites,
        filter,
        setFilter,
        favorites,
        isLoading,
        error,
        fetchGifs,
        getFavoriteGifs
      }}
    >
      {children}
    </GifContext.Provider>
  );
};

export const GifState = () => {
  return useContext(GifContext);
};

export default GifProvider;