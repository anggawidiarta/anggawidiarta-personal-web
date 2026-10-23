// Messages for the Studio sign-in form. Wrong credentials and "not an admin" share
// one message so the form never reveals which accounts exist; only failures the
// visitor should act on differently (wait, or try later) get their own wording.

export const LOGIN_FAILED = "Email or password is incorrect.";
export const LOGIN_RATE_LIMITED = "Too many attempts. Wait a minute, then try again.";
export const LOGIN_UNAVAILABLE = "Sign-in is unavailable right now. Try again shortly.";

type ErrorLike = { status?: number; code?: string; name?: string } | null | undefined;

export function loginErrorMessage(error: ErrorLike): string {
  if (!error) return LOGIN_FAILED;

  const { status, code = "", name = "" } = error;
  if (status === 429 || code.startsWith("over_") || code.endsWith("rate_limit")) {
    return LOGIN_RATE_LIMITED;
  }
  // Network failures surface as AuthRetryableFetchError (status 0); a paused or
  // failing project answers 5xx.
  if (name === "AuthRetryableFetchError" || status === 0 || (status ?? 0) >= 500) {
    return LOGIN_UNAVAILABLE;
  }
  return LOGIN_FAILED;
}
