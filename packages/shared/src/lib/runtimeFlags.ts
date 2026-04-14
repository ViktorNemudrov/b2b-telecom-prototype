let missedCallsSeen = false;

export function markMissedCallsSeen() {
  missedCallsSeen = true;
}

export function isMissedCallsSeen() {
  return missedCallsSeen;
}
