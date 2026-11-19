/**
 * The address of the conversation that is open now, without the query string
 * or hash, so a thread or message link isn't opened again in the new window.
 */
export function currentConversationUrl(
  location: Pick<Location, "origin" | "pathname"> = window.location
): string {
  return `${location.origin}${location.pathname}`;
}

/**
 * Opens the conversation that is open now in a new browser tab or window.
 * `noopener` keeps the new page from controlling this one.
 */
export function openConversationInNewWindow() {
  window.open(currentConversationUrl(), "_blank", "noopener,noreferrer");
}
