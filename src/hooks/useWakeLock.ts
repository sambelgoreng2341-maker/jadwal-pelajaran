import { useState, useEffect, useCallback, useRef } from 'react';

// Tiny blank video data URI for fallback keep-awake on kiosk TVs where WakeLock API is missing
const BLANK_VIDEO_URI = 'data:video/mp4;base64,AAAAHGZ0eXBtcDQyAAAAAG1wNDJpc29tYXZjMQAAADFtb292AAAAbG12aGQAAAAA1uN/6Nbjf+gAAAPoAAAFeAABAAABAAAAAAAAAAAAAAAAAAAAAAAAAA==';

export function useWakeLock(initialEnabled: boolean = true) {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const videoFallbackRef = useRef<HTMLVideoElement | null>(null);
  const enabledRef = useRef<boolean>(initialEnabled);

  enabledRef.current = initialEnabled;

  const requestScreenWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) {
      setIsSupported(false);
      // Initialize fallback video loop
      enableFallbackKeepAwake();
      return;
    }

    try {
      if (wakeLockRef.current && !wakeLockRef.current.released) {
        setIsActive(true);
        return;
      }

      const sentinel = await navigator.wakeLock.request('screen');
      wakeLockRef.current = sentinel;
      setIsActive(true);
      setErrorMessage(null);

      sentinel.addEventListener('release', () => {
        setIsActive(false);
        // If it was released not by our manual call, but by OS/tab switch, re-acquire when visible
        if (enabledRef.current && document.visibilityState === 'visible') {
          setTimeout(() => {
            requestScreenWakeLock();
          }, 1000);
        }
      });
    } catch (err: unknown) {
      const error = err as Error;
      console.warn('Wake Lock request failed:', error.message);
      setErrorMessage(error.message);
      setIsActive(false);
      // Fallback
      enableFallbackKeepAwake();
    }
  }, []);

  const releaseScreenWakeLock = useCallback(async () => {
    if (wakeLockRef.current && !wakeLockRef.current.released) {
      try {
        await wakeLockRef.current.release();
      } catch (err) {
        console.warn('Wake lock release error:', err);
      }
      wakeLockRef.current = null;
    }
    disableFallbackKeepAwake();
    setIsActive(false);
  }, []);

  const enableFallbackKeepAwake = () => {
    if (!videoFallbackRef.current) {
      const video = document.createElement('video');
      video.setAttribute('playsinline', '');
      video.setAttribute('loop', '');
      video.setAttribute('muted', '');
      video.muted = true;
      video.style.position = 'fixed';
      video.style.opacity = '0.001';
      video.style.pointerEvents = 'none';
      video.style.width = '1px';
      video.style.height = '1px';
      video.src = BLANK_VIDEO_URI;
      document.body.appendChild(video);
      videoFallbackRef.current = video;
    }
    videoFallbackRef.current.play().catch(() => {});
    setIsActive(true);
  };

  const disableFallbackKeepAwake = () => {
    if (videoFallbackRef.current) {
      videoFallbackRef.current.pause();
      try {
        videoFallbackRef.current.remove();
      } catch {}
      videoFallbackRef.current = null;
    }
  };

  // Re-acquire on visibility change (e.g. user minimized browser or switched tab then returned)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabledRef.current) {
        requestScreenWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [requestScreenWakeLock]);

  // Handle initial activation
  useEffect(() => {
    if (initialEnabled) {
      requestScreenWakeLock();
    } else {
      releaseScreenWakeLock();
    }

    return () => {
      releaseScreenWakeLock();
    };
  }, [initialEnabled, requestScreenWakeLock, releaseScreenWakeLock]);

  const toggleWakeLock = useCallback(() => {
    if (isActive) {
      releaseScreenWakeLock();
    } else {
      requestScreenWakeLock();
    }
  }, [isActive, releaseScreenWakeLock, requestScreenWakeLock]);

  return {
    isActive,
    isSupported,
    errorMessage,
    requestScreenWakeLock,
    releaseScreenWakeLock,
    toggleWakeLock,
  };
}
