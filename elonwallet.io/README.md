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
docker volume create certs
```

Fill the volume with your certificate files

```bash
docker container create -v certs:/data --name helper busybox true
docker cp frontend-cert.pem helper:/data
docker cp frontend-key.pem helper:/data
docker rm helper
```

Run the image

```bash
docker run -d -p 80:80 -p 443:443 -v certs:/certs frontend
```

Attention: The provided example nginx.conf expects the server to run under the domain elonwallet.io. Change this accordingly if needed.
