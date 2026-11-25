<script>
	// What the warning is for: a component fetching while it renders.
	const text = await fetch('data:text/plain,eager').then((res) => res.text());
</script>

<p>{text}</p>
