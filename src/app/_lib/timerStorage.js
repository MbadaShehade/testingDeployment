/**
 * Timer Storage Utility
 * Handles persisting timer state across page navigation and refreshes
 */

// Timer storage key prefix
const TIMER_PREFIX = 'airPumpTimer_';

// Save the current air pump timer state to localStorage
export const saveTimerState = (hiveId, isActive, startTime, status) => {
  if (typeof window === 'undefined') return;
  
  try {
    const state = {
      isActive,
      startTime,
      lastUpdate: Date.now(),
      status
    };
    
    localStorage.setItem(`${TIMER_PREFIX}${hiveId}`, JSON.stringify(state));
  } catch (error) {
    console.error('[Timer Storage] Error saving timer state:', error);
  }
};

// Load air pump timer state from localStorage
export const loadTimerState = (hiveId) => {
  if (typeof window === 'undefined') return null;
  
  try {
    const storedState = localStorage.getItem(`${TIMER_PREFIX}${hiveId}`);
    if (!storedState) return null;
    
    const state = JSON.parse(storedState);
    console.log(`[Timer Storage] Loaded timer state for hive ${hiveId}:`, state);
    
    // Check if the state is still valid
    if (state.isActive && state.status === 'ON') {
      // Calculate elapsed time so far
      const elapsedTime = Date.now() - state.startTime;
      
      return {
        isActive: state.isActive,
        startTime: state.startTime,
        elapsedTime: elapsedTime
      };
    }
    
    return null;
  } catch (error) {
    console.error('[Timer Storage] Error loading timer state:', error);
    return null;
  }
};

// Clear timer state when pump is turned off
export const clearTimerState = (hiveId) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(`${TIMER_PREFIX}${hiveId}`);
    console.log(`[Timer Storage] Cleared timer state for hive ${hiveId}`);
  } catch (error) {
    console.error('[Timer Storage] Error clearing timer state:', error);
  }
}; 