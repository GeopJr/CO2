FROM geopjr/co2-node-chromium-pnpm:stable

COPY . .

ENTRYPOINT ["node", "/index.js"]
