// Makes no fetch: says whether globalThis.fetch is still the one the server started with.
export function GET() {
	return new Response(globalThis.fetch === globalThis.__original_fetch ? 'original' : 'WRAPPED');
}
