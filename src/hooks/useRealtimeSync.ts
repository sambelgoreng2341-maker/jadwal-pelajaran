import { useState, useEffect, useCallback, useRef } from 'react';
import { GradeSchedule, Announcement, KioskSettings } from '../types/schedule';
import {
  DEFAULT_SCHEDULES,
  DEFAULT_ANNOUNCEMENTS,
  DEFAULT_KIOSK_SETTINGS,
} from '../data/defaultSchedule';
import { playSchoolChime, announceViaTTS, showBrowserNotification } from '../utils/audioChime';

const STORAGE_KEY_SCHEDULES = 'iiqbs_schedules_v1';
const STORAGE_KEY_ANNOUNCEMENTS = 'iiqbs_announcements_v1';
const STORAGE_KEY_SETTINGS = 'iiqbs_settings_v1';
const STORAGE_KEY_VERSION = 'iiqbs_data_version_v1';

export type SyncStatus = 'connected' | 'connecting' | 'offline' | 'error';

export function useRealtimeSync() {
  // Offline-first initial state from localStorage
  const [schedules, setSchedules] = useState<Record<'grade1_2' | 'grade3', GradeSchedule>>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_SCHEDULES);
      if (cached) return JSON.parse(cached);
    } catch {}
    return DEFAULT_SCHEDULES;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_ANNOUNCEMENTS);
      if (cached) return JSON.parse(cached);
    } catch {}
    return DEFAULT_ANNOUNCEMENTS;
  });

  const [settings, setSettings] = useState<KioskSettings>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (cached) return JSON.parse(cached);
    } catch {}
    return DEFAULT_KIOSK_SETTINGS;
  });

  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('connecting');
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [serverVersion, setServerVersion] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEY_VERSION) || '1');
    } catch {
      return 1;
    }
  });

  // Track bell callback
  const [remoteBellNotification, setRemoteBellNotification] = useState<{
    type: string;
    message: string;
    time: string;
  } | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Save to localStorage whenever state changes
  const persistLocally = useCallback((
    newSchedules: typeof schedules,
    newAnnouncements: typeof announcements,
    newSettings: typeof settings,
    version?: number
  ) => {
    try {
      localStorage.setItem(STORAGE_KEY_SCHEDULES, JSON.stringify(newSchedules));
      localStorage.setItem(STORAGE_KEY_ANNOUNCEMENTS, JSON.stringify(newAnnouncements));
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(newSettings));
      if (version) {
        localStorage.setItem(STORAGE_KEY_VERSION, version.toString());
      }
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, []);

  // Fetch initial state from server
  const fetchServerSync = useCallback(async () => {
    if (!navigator.onLine) {
      setIsOnline(false);
      setSyncStatus('offline');
      return;
    }

    try {
      setSyncStatus('connecting');
      const res = await fetch('/api/sync');
      if (!res.ok) throw new Error('Sync failed');
      const data = await res.json();

      if (data.schedules) {
        setSchedules(data.schedules);
        if (data.announcements) setAnnouncements(data.announcements);
        if (data.kioskSettings) setSettings(data.kioskSettings);
        if (data.version) setServerVersion(data.version);
        persistLocally(data.schedules, data.announcements || announcements, data.kioskSettings || settings, data.version);
      } else {
        // Server is fresh: push our local default schedules to server
        await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schedules,
            announcements,
            kioskSettings: settings,
          }),
        });
      }

      setSyncStatus('connected');
      setIsOnline(true);
      setLastSyncTime(new Date());
    } catch (err) {
      console.warn('Sync connection error:', err);
      setSyncStatus('offline');
      setIsOnline(navigator.onLine);
    }
  }, [schedules, announcements, settings, persistLocally]);

  // Connect SSE for real-time live push updates
  const connectSSE = useCallback(() => {
    if (!navigator.onLine) {
      setSyncStatus('offline');
      return;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const es = new EventSource('/api/events');
      eventSourceRef.current = es;

      es.addEventListener('open', () => {
        setSyncStatus('connected');
        setIsOnline(true);
      });

      es.addEventListener('sync', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.schedules) setSchedules(payload.schedules);
          if (payload.announcements) setAnnouncements(payload.announcements);
          if (payload.kioskSettings) setSettings(payload.kioskSettings);
          if (payload.version) setServerVersion(payload.version);
          setLastSyncTime(new Date());
          persistLocally(
            payload.schedules || schedules,
            payload.announcements || announcements,
            payload.kioskSettings || settings,
            payload.version
          );
        } catch (parseErr) {
          console.warn('SSE parse error:', parseErr);
        }
      });

      es.addEventListener('bell', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          setRemoteBellNotification({
            type: payload.type || 'pesantren',
            message: payload.message || 'Bel Berbunyi',
            time: new Date().toLocaleTimeString('id-ID'),
          });
          // Play sound
          playSchoolChime(payload.type || 'pesantren', settings.chimeVolume);
          if (settings.ttsAnnouncementEnabled && payload.message) {
            announceViaTTS(payload.message);
          }
          showBrowserNotification('🔔 Bel Pesantren IIQBS', payload.message || 'Bel berbunyi');
        } catch (err) {
          console.warn('SSE bell error:', err);
        }
      });

      es.onerror = () => {
        es.close();
        setSyncStatus('offline');
        // If server is not present (e.g. static hosting on Cloudflare Pages), do not spam reconnects
      };
    } catch (e) {
      setSyncStatus('offline');
    }
  }, [schedules, announcements, settings, persistLocally]);

  // Network listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      fetchServerSync();
      connectSSE();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync
    fetchServerSync();
    connectSSE();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (eventSourceRef.current) eventSourceRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, []);

  // API Mutators
  const saveAllToCentralServer = useCallback(async (
    newSchedules: typeof schedules,
    newAnnouncements: typeof announcements,
    newSettings: typeof settings
  ) => {
    // 1. Update state immediately
    setSchedules(newSchedules);
    setAnnouncements(newAnnouncements);
    setSettings(newSettings);
    // 2. Persist locally for offline safety
    persistLocally(newSchedules, newAnnouncements, newSettings);

    // 3. Sync to central server if online
    if (navigator.onLine) {
      try {
        const res = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schedules: newSchedules,
            announcements: newAnnouncements,
            kioskSettings: newSettings,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setServerVersion(data.version);
          setLastSyncTime(new Date());
          setSyncStatus('connected');
        }
      } catch (err) {
        console.warn('Failed to sync to central server, kept in local storage:', err);
        setSyncStatus('offline');
      }
    }
  }, [persistLocally]);

  const updateSchedule = useCallback((newSchedules: typeof schedules) => {
    saveAllToCentralServer(newSchedules, announcements, settings);
  }, [announcements, settings, saveAllToCentralServer]);

  const updateAnnouncements = useCallback((newAnnouncements: typeof announcements) => {
    saveAllToCentralServer(schedules, newAnnouncements, settings);
  }, [schedules, settings, saveAllToCentralServer]);

  const updateSettings = useCallback((newSettings: typeof settings) => {
    saveAllToCentralServer(schedules, announcements, newSettings);
  }, [schedules, announcements, saveAllToCentralServer]);

  const triggerBroadcastBell = useCallback(async (type: string = 'pesantren', message: string = 'Bel Pelajaran Pesantren') => {
    // Local bell
    playSchoolChime(type as any, settings.chimeVolume);
    if (settings.ttsAnnouncementEnabled) {
      announceViaTTS(message);
    }
    // Remote broadcast to other connected tablets/smart TVs
    if (navigator.onLine) {
      try {
        await fetch('/api/trigger-bell', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, message }),
        });
      } catch (e) {
        console.warn('Could not broadcast bell:', e);
      }
    }
  }, [settings.chimeVolume, settings.ttsAnnouncementEnabled]);

  return {
    schedules,
    announcements,
    settings,
    isOnline,
    syncStatus,
    lastSyncTime,
    serverVersion,
    remoteBellNotification,
    setRemoteBellNotification,
    updateSchedule,
    updateAnnouncements,
    updateSettings,
    triggerBroadcastBell,
    refreshSync: fetchServerSync,
  };
}
