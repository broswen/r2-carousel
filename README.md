
# r2-carousel

This is a simple Cloudflare Workers project that will loop through an R2 bucket of images and display them on a webpage.

### How To Use
Modify `wrangler.toml` to specify the name of the bucket you want to use, the prefix of your images (if you want to use a sub folder), the hostname your R2 bucket is publicly exposed an and the route you want to run the project on.

The project is currently set up for running on `example.com` with the R2 bucket exposed at `images.example.com` and not using any bucket prefix.
