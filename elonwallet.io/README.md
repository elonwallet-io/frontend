# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# yarn
yarn install

# npm
npm install

# pnpm
pnpm install
```

## Development Server

Start the development server on http://localhost:3000

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.


## Build and Run with docker (Example)

Build the container image locally

```bash
docker build -t frontend .
```

Create a volume for the certificates

```bash
docker volume create caddy_data
```

Replace the hardcoded domain inside the webflow index page and caddy config with one you own
```bash
sed -i 's/https:\/\/elonwallet\.io/<REPLACE_WITH_YOUR_DOMAIN>/g' ./public/index.html
sed -i 's/elonwallet\.io/<REPLACE_WITH_YOUR_DOMAIN>/g' Caddyfile
```

Run the image

```bash
docker run -d -p 80:80 -p 443:443 -p 443:443/udp -v caddy_data:/data frontend
```

