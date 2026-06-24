import { useState, useEffect } from 'react';

/**
 * Hook customizado para persistência de dados no localStorage
 * Salva automaticamente quando o estado muda e carrega ao montar
 * Sincroniza entre abas abertas do mesmo navegador
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Erro ao carregar localStorage para ${key}:`, error);
      return initialValue;
    }
  });

  // Atualiza localStorage quando o estado muda
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Dispara evento customizado para sincronizar entre abas
        window.dispatchEvent(new Event('local-storage-changed'));
      }
    } catch (error) {
      console.error(`Erro ao salvar localStorage para ${key}:`, error);
    }
  };

  // Sincroniza entre abas quando outro tab muda o localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(`Erro ao sincronizar localStorage para ${key}:`, error);
      }
    };

    window.addEventListener('local-storage-changed', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('local-storage-changed', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}
