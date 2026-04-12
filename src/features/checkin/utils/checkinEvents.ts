/**
 * Custom event system for triggering check-in prompt after food logging
 *
 * This allows the food logging system to notify the check-in prompt
 * without tight coupling between the modules.
 */

const FOOD_LOGGED_EVENT = 'bodycoach:food-logged';

/**
 * Dispatch event when food is logged
 * Call this after successfully logging a food item
 */
export function dispatchFoodLoggedEvent() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(FOOD_LOGGED_EVENT));
  }
}

/**
 * Subscribe to food logged events
 * Returns an unsubscribe function
 */
export function onFoodLogged(callback: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener(FOOD_LOGGED_EVENT, callback);
  return () => window.removeEventListener(FOOD_LOGGED_EVENT, callback);
}
