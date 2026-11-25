<script>
	// A render that takes a while, as one awaiting data does. It never calls fetch.
	await new Promise((resolve) => setTimeout(resolve, 2000));
</script>

<p>rendered</p>
