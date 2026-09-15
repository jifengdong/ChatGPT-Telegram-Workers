FROM node:26-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Node >=25 no longer bundles corepack, so install the pnpm version pinned in
# package.json's packageManager field directly.
RUN npm install -g pnpm@12.4.1

COPY . /app
WORKDIR /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build:server

FROM node:26-slim AS prod

WORKDIR /app

COPY --from=build /app/packages/apps/server/dist/node.js /app/dist/node.js
COPY --from=build /app/packages/apps/server/dist/vercel.js /app/dist/vercel.js
COPY --from=build /app/packages/apps/server/package-docker.json /app/package.json

# sqlite3 may fall back to node-gyp when no prebuilt binary matches; keep the
# toolchain only for the install step, then purge it to keep the image small.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && npm install \
    && apt-get purge -y python3 make g++ \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*
EXPOSE 8787

CMD ["node", "/app/dist/node.js"]
