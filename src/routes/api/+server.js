// An endpoint, not a render: its fetch is none of a component's business.
export async function GET() {
	const res = await fetch('data:text/plain,hello');
	return new Response(await res.text());
}
