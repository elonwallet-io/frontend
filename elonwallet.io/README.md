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


## Build and Run with docker

Build the container image locally

```bash
docker build -t frontend .
```

Run the image

```bash
docker run -d -p 80:80 -p 443:443 -v certs:/certs frontend
```

Attention: Be sure you have saved the server certificate as __elonwallet.io.pem__ and the key as __elonwallet.io-key.pem__ inside the __certs__ volume.
