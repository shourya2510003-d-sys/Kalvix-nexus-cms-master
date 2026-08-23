'use client';

import { useEffect } from 'react';
import { db, ref, set } from '../lib/firebase';

export default function LiveTracker() {
  useEffect(() => {
    let sessionId = sessionStorage.getItem('nexus_session_id');
    if (!sessionId) {
      sessionId = `v_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
      sessionStorage.setItem('nexus_session_id', sessionId);
    }

    const pingVisit = async () => {
      try {
        await set(ref(db, `live_visits/${sessionId}`), {
          sessionId,
          timestamp: Date.now(),
          url: window.location.pathname
        });
      } catch (err) {
        console.error('Failed to log live visit', err);
      }
    };

    pingVisit();
    const interval = setInterval(pingVisit, 60000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
