// Compact event-edge recording. Only the moments playerUp flips are stored.
// [t_ms_since_run_start, up]
export type RecordingEvent = [number, boolean];
export type Recording = RecordingEvent[];

export const MAX_RECORDING_EVENTS = 5000;

/** Append an event if it represents an actual change from the last recorded value. */
export function appendEvent(
  recording: Recording,
  t: number,
  up: boolean,
): Recording {
  if (recording.length >= MAX_RECORDING_EVENTS) return recording;
  const last = recording[recording.length - 1];
  if (last && last[1] === up) return recording;
  return [...recording, [Math.max(0, Math.round(t)), up]];
}

/** Resolve which `up` value applies at time t. Returns false if before the first event. */
export function valueAt(recording: Recording, t: number): boolean {
  if (recording.length === 0) return false;
  // Binary search for the largest event with t_event <= t.
  let lo = 0;
  let hi = recording.length - 1;
  let result = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (recording[mid][0] <= t) {
      result = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return result === -1 ? false : recording[result][1];
}

export function recordingDurationMs(recording: Recording): number {
  if (recording.length === 0) return 0;
  return recording[recording.length - 1][0];
}
