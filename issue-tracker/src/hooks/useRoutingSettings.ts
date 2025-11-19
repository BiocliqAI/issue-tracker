import { useEffect, useState } from 'react';
import type { RoutingSettings } from '../types/settings.ts';
import { defaultRoutingSettings } from '../types/settings.ts';
import { subscribeToRoutingSettings } from '../services/settingsService.ts';

export const useRoutingSettings = () => {
  const [settings, setSettings] = useState<RoutingSettings>(defaultRoutingSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToRoutingSettings(
      (data) => {
        setSettings(data);
        setLoading(false);
      },
      (subscribeError) => {
        setError(subscribeError);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  return { settings, loading, error };
};
