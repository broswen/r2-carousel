
function carouselHTML(urls: string[], delay: number = 5000): string {
	return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<meta charset="utf-8">
<meta http-equiv="x-ua-compatible" content="ie=edge">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Junge&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap" rel="stylesheet">
<title>Carousel</title>
<style>
	* {
		margin: 0;
		padding: 0;
	}
	body {
		background-color: black;
	}
	.slide {
		opacity: 0;
		background-size: contain;
		background-repeat: no-repeat;
		background-position: center;
		width: 100%;
		height: 100%;
		position: fixed;
		top: 0;
		left: 0;
		transition: opacity 0.3s;
	}
	.visible {
		opacity: 1;
	}
	.hidden {
		display: none;
	}
	.timer {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		color: white;
		font-family: cursive;
		font-size: xxx-large;
		margin-top: 2rem;
		text-align: center;
		text-shadow: 0 0 4px black;
	}

	.junge-regular {
  font-family: "Junge", cursive;
  font-weight: 400;
  font-style: normal;
}

</style>
</head>
<body>
	${generateSlides(urls)}
	<div id="timer" class="timer junge-regular"></div>
	<script>
		const _second = 1000;
    const _minute = _second * 60;
    const _hour = _minute * 60;
    const _day = _hour * 24;
		const end = new Date("2025-08-09T05:00:00Z");

		let updateTimer = () => {
			let diff = end - new Date();
			let timer = document.getElementById("timer");
			let days = Math.floor(diff / _day);
    	let hours = Math.floor((diff % _day) / _hour);
    	timer.innerHTML = "";
			timer.innerHTML += days + " days ";
			timer.innerHTML += hours + " hours";
		}

		updateTimer();

		setInterval(() => {
			updateTimer();
		}, 1000 * 60 * 30);

		let slides = document.getElementsByClassName("slide");
		if (slides.length !== 0) {
			let index = Math.floor(Math.random() * slides.length);
			// immediately show first slide
			slides[index].classList.remove("hidden");
			slides[index].classList.add("visible");

			setInterval(() => {
				console.log("running")
				let next = (index + 1) % slides.length;
				// start fading out current slide
				slides[index].classList.remove("visible");
				// start loading next slide
				slides[next].classList.remove("hidden");
				let temp = index;
				// delay display: none so transitions are visible
				setTimeout(() => {
					// hide current slide
					slides[temp].classList.add("hidden");
				}, 300);
				setTimeout(() => {
					// start fading in next slide
					slides[next].classList.add("visible");
				}, 300)
				index = next;
			// 	add 600ms for transition 0.3s fade in and out
			}, ${delay+600});
		}
	</script>
</body>
</html>
`;
}

function generateSlides(urls: string[]): string {
	let slides = "";
	for (let url of urls) {
		slides += `<div class="slide hidden" style="background-image: url('${url}');"></div>\n`
	}
	return slides;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname === "/") {
			let urls = await getUrls(env, ctx);
			return new Response(carouselHTML(urls, env.DELAY_MS), {
				headers: {
					"Content-Type": "text/html"
				}
			});
		} else if (url.pathname === "/images") {
			// check for cached response and return it
			return Response.json(await getUrls(env, ctx));
		}
		return new Response("not found", {status: 404});
	},
};

async function getUrls(env: Env, ctx: ExecutionContext): Promise<string[]> {
	let cache = await caches.open("r2-carousel");
	let res = await cache.match("https://localhost/images");
	if (res) {
		return res.json<string[]>();
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
	console.log({urls})
	return urls;
}
