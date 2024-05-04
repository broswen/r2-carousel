
function carouselHTML(delay: number): string {
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
</style>
</head>
<body>
	<img id="image" src="" alt="image">
	<script>
		let image = document.getElementById("image");
		let urls = fetch("/images")
		.then((res) => res.json())
		.then((urls) => {
			if (urls.length === 0) return;
			let index = Math.floor(Math.random() * urls.length);
			image.setAttribute("src", urls[index]);
			setInterval(() => {
				index = (index + 1) % urls.length;
				image.setAttribute("src", urls[index]);
			}, ${delay});
		});

	</script>
</body>
</html>
`;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname === "/") {
			return new Response(carouselHTML(env.DELAY_MS), {
				headers: {
					"Content-Type": "text/html"
				}
			});
		} else if (url.pathname === "/images") {
			// check for cached response and return it
			let cache = await caches.open("r2-carousel");
			let res = await cache.match("https://localhost/images");
			if (res) {
				return res;
			}

			// query R2 and cache the response if it doesn't exist
			let images = await env.IMAGES.list({
				limit: 1000,
				prefix: env.BUCKET_PREFIX
			});
			let urls = images.objects.map(image => `${env.BUCKET_HOST}/${image.key}`);
			res = Response.json(urls);
			res?.headers.append("Cache-Control", "s-maxage=60");
			ctx.waitUntil(cache.put("https://localhost/images", res?.clone()))
			return res;
		}
		return new Response("not found", {status: 404});
	},
};
