import { useState, useEffect, useRef, useCallback } from 'react';
import { StepTrackerData } from '../types';

const INITIAL_STEPS_KEY = 'omnipulse_steps_data';

export function useStepCounter() {
  const [tracker, setTracker] = useState<StepTrackerData>(() => {
    try {
      const saved = localStorage.getItem(INITIAL_STEPS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          cadence: 0,
          status: 'idle',
          isSensorActive: false,
        };
      }
    } catch {}
    return {
      steps: 3420,
      dailyGoal: 10000,
      cadence: 0,
      distanceKm: +(3420 * 0.000762).toFixed(2),
      calories: Math.round(3420 * 0.04),
      activeMinutes: 38,
      status: 'idle',
      isAutoSimulating: true,
      isSensorSupported: typeof window !== 'undefined' && 'DeviceMotionEvent' in window,
      isSensorActive: false,
    };
  });

  const lastStepTimeRef = useRef<number>(0);
  const stepIntervalsRef = useRef<number[]>([]);
  const lastAccelMagRef = useRef<number>(9.8);
  const peakDetectedRef = useRef<boolean>(false);
  const simTimerRef = useRef<any>(null);

  // Helper to add steps
  const recordStep = useCallback((count = 1) => {
    const now = Date.now();
    if (lastStepTimeRef.current > 0) {
      const deltaMs = now - lastStepTimeRef.current;
      if (deltaMs > 250 && deltaMs < 2500) {
        // Human step cadence
        stepIntervalsRef.current.push(deltaMs);
        if (stepIntervalsRef.current.length > 5) {
          stepIntervalsRef.current.shift();
        }
      }
    }
    lastStepTimeRef.current = now;

    setTracker((prev) => {
      const newSteps = prev.steps + count;
      const newDistance = +(newSteps * 0.000762).toFixed(2);
      const newCalories = Math.round(newSteps * 0.04);
      
      // Calculate cadence
      let cadence = prev.cadence;
      if (stepIntervalsRef.current.length > 0) {
        const avgMs =
          stepIntervalsRef.current.reduce((a, b) => a + b, 0) / stepIntervalsRef.current.length;
        cadence = Math.round(60000 / avgMs);
      } else {
        cadence = 100;
      }

      const status: 'walking' | 'running' | 'idle' = cadence > 140 ? 'running' : 'walking';

      const updated: StepTrackerData = {
        ...prev,
        steps: newSteps,
        distanceKm: newDistance,
        calories: newCalories,
        cadence,
        status,
        activeMinutes: prev.activeMinutes + (newSteps % 100 === 0 ? 1 : 0),
      };

      try {
        localStorage.setItem(
          INITIAL_STEPS_KEY,
          JSON.stringify({
            steps: updated.steps,
            dailyGoal: updated.dailyGoal,
            distanceKm: updated.distanceKm,
            calories: updated.calories,
            activeMinutes: updated.activeMinutes,
            isAutoSimulating: updated.isAutoSimulating,
          })
        );
      } catch {}

      return updated;
    });
  }, []);

  // Physical motion sensor handler (Accelerometer peak detection)
  useEffect(() => {
    let active = false;

    const handleMotion = (event: DeviceMotionEvent) => {
      const accel = event.accelerationIncludingGravity || event.acceleration;
      if (!accel || accel.x === null || accel.y === null || accel.z === null) return;

      const mag = Math.sqrt(accel.x * accel.x + accel.y * accel.y + accel.z * accel.z);
      const diff = mag - lastAccelMagRef.current;
      lastAccelMagRef.current = mag;

      // Peak threshold for walking motion (typical threshold 1.2 to 2.5 m/s^2 delta)
      const THRESHOLD = 1.6;
      const now = Date.now();

      if (diff > THRESHOLD && !peakDetectedRef.current) {
        if (now - lastStepTimeRef.current > 300) {
          peakDetectedRef.current = true;
          recordStep(1);
        }
      } else if (diff < -THRESHOLD) {
        peakDetectedRef.current = false;
      }

      if (!active) {
        active = true;
        setTracker((prev) => ({ ...prev, isSensorActive: true }));
      }
    };

    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => {
      if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
        window.removeEventListener('devicemotion', handleMotion);
      }
    };
  }, [recordStep]);

  // Automatic Step Simulator for continuous tracking / testing
  useEffect(() => {
    if (!tracker.isAutoSimulating) {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
      setTracker((prev) => ({ ...prev, cadence: 0, status: 'idle' }));
      return;
    }

    // Steady walking pace (~96 steps/min = ~625ms per step)
    const intervalMs = 620 + Math.floor(Math.random() * 80);
    simTimerRef.current = setInterval(() => {
      recordStep(1);
    }, intervalMs);

    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, [tracker.isAutoSimulating, recordStep]);

  // Request permission for iOS 13+ devices
  const requestSensorPermission = async () => {
    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof (DeviceMotionEvent as any).requestPermission === 'function'
    ) {
      try {
        const response = await (DeviceMotionEvent as any).requestPermission();
        if (response === 'granted') {
          setTracker((prev) => ({ ...prev, isSensorSupported: true, isSensorActive: true }));
        }
      } catch (e) {
        console.warn('Sensor permission error', e);
      }
    }
  };

  const toggleAutoSimulating = () => {
    setTracker((prev) => {
      const next = !prev.isAutoSimulating;
      return { ...prev, isAutoSimulating: next };
    });
  };

  const addManualSteps = (count: number) => {
    recordStep(count);
  };

  const resetSteps = () => {
    stepIntervalsRef.current = [];
    setTracker((prev) => {
      const updated: StepTrackerData = {
        ...prev,
        steps: 0,
        cadence: 0,
        distanceKm: 0,
        calories: 0,
        activeMinutes: 0,
        status: 'idle',
      };
      try {
        localStorage.setItem(INITIAL_STEPS_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  return {
    tracker,
    toggleAutoSimulating,
    addManualSteps,
    resetSteps,
    requestSensorPermission,
  };
}
