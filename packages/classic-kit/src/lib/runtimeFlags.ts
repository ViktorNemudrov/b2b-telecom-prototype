let missedCallsSeen = false;
let feedMissedSeen = false;

export function markMissedCallsSeen() {
  missedCallsSeen = true;
  feedMissedSeen = true;
}

export function isMissedCallsSeen() {
  return missedCallsSeen;
}

export function markFeedMissedSeen() {
  feedMissedSeen = true;
}

export function isFeedMissedSeen() {
  return feedMissedSeen;
}
