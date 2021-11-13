FROM public.ecr.aws/bitnami/node:14.16.0-prod-debian-10-r22
WORKDIR /code
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

ENV NODE_ENV production

RUN apt update \
  && apt install -y libnss3 libatk1.0-0 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libpango1.0-0 libasound2 libxshmfence1 chromium

RUN yarn

RUN yarn next build

CMD [ "node", "index.js" ]