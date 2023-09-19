FROM tnk4on/yt-dlp:alpine-static AS ytdlp

# pnpm docker
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY --from=ytdlp /usr/local/bin/ffmpeg /bin/ffmpeg
COPY --from=ytdlp /usr/local/bin/yt-dlp /bin/yt-dlp

EXPOSE 3000

HEALTHCHECK CMD curl --fail http://localhost:3000/healthcheck || exit 1

CMD [ "pnpm", "start" ]
