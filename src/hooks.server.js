// The fetch the server started with, to tell whether a wrapper was left in its place.
globalThis.__original_fetch ??= globalThis.fetch;
