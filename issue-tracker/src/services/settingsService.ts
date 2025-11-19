import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from './firebase.ts';
import type { RoutingSettings } from '../types/settings.ts';
import { defaultRoutingSettings } from '../types/settings.ts';

const routingSettingsRef = doc(db, 'settings', 'routing');

export const subscribeToRoutingSettings = (
  onChange: (settings: RoutingSettings) => void,
  onError: (error: Error) => void
) => {
  return onSnapshot(
    routingSettingsRef,
    (snapshot) => {
      const data = snapshot.data() as RoutingSettings | undefined;
      onChange(data ?? defaultRoutingSettings);
    },
    (error) => onError(error as Error)
  );
};

export const updateRoutingSettings = async (settings: Partial<RoutingSettings>) => {
  await setDoc(routingSettingsRef, settings, { merge: true });
};
