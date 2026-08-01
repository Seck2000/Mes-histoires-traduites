export const PENDING_STORY_KEY = 'pending_story_id';

export function setPendingStoryId(storyId) {
    if (!storyId) return;
    try {
        sessionStorage.setItem(PENDING_STORY_KEY, String(storyId));
    } catch {
        /* ignore */
    }
}

export function consumePendingStoryId() {
    try {
        const id = sessionStorage.getItem(PENDING_STORY_KEY);
        sessionStorage.removeItem(PENDING_STORY_KEY);
        return id || null;
    } catch {
        return null;
    }
}
