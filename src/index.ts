
function carouselHTML(url: string): string {
return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<meta charset="utf-8">
<meta http-equiv="x-ua-compatible" content="ie=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Carousel</title>
<style>
	* {
		margin: 0;
		padding: 0;
	}
	body {
		background-color: black;
		display: flex;
    justify-content: center;
    align-items: center;
	}
	img {
	  flex-shrink: 0;
    /*min-width: 100%;*/
    /*min-height: 100%*/
		max-width: 100%;
		max-height: 100vh;
		/*margin-left: auto;*/
	}
</style
</head>
<body>
	<img src="${url}" alt="image">
	<script>
		setTimeout(() => location.reload(), 5000);
	</script>
</body>
</html>
`
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		let cache = caches.default;
		// TODO paginate truncated response
		let images = await env.IMAGES.list({
			limit: 1000,
			prefix: env.BUCKET_PREFIX
		});
		// TODO cache url list for a few minutes
		let urls = images.objects.map(image => `${env.BUCKET_HOST}/${image.key}`);
		let url = urls[Math.floor(Math.random() * urls.length)];
		return new Response(carouselHTML(url), {
			headers: {
				"Content-Type": "text/html"
			}
		});
	},
};
