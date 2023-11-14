FROM --platform=$BUILDPLATFORM node:18.12-alpine3.16 AS client-builder
WORKDIR /ui

COPY ui/package.json /ui/package.json
COPY ui/package-lock.json /ui/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci
COPY ui /ui
RUN npm run build

FROM alpine

ARG EXTENSION_NAME='JMeter'
ARG DESCRIPTION='Execute JMeter tests in Docker'
ARG DESCRIPTION_LONG="<h1>Apache JMeter Docker Extension</h1> \
<h2>⚡️ Features</h2><ul> \
<li>Includes base image 'qainsights/jmeter:latest by default</li> \
<li>Light-weight and secured container</li> \
<li>Interactive charts</li> \
<li>Supports JMeter plugins</li> \
<li>Mount volume for easy management</li> \
<li>Supports property files</li> \
<li>Supports proxy configuration</li> \
<li>Supports container memory and CPU configuration</li> \
<li>Generates logs and results</li> \
<li>Intuitive HTML report</li> \
<li>Displays runtime console logs</li> \
<li>Timely notifications</li> \
</ul> \
"
ARG VENDOR='QAInsights'
ARG LICENSE='Apache License 2.0'

ARG ICON_URL='https://raw.githubusercontent.com/QAInsights/jmeter-docker-extension/main/feather.svg'
ARG SCREENSHOTS_URLS='[ { "alt": "Apache JMeter Docker Extension", "url": "https://raw.githubusercontent.com/QAInsights/jmeter-docker-extension/main/assets/JMeter-Docker-Extension.png" }, \
                        { "alt": "Output Logs", "url": "https://raw.githubusercontent.com/QAInsights/jmeter-docker-extension/main/assets/JMeter-Docker-Extension-Home-Light.png" }, \
                        { "alt": "Output Logs", "url": "https://raw.githubusercontent.com/QAInsights/jmeter-docker-extension/main/assets/Interactive-Charts.png" }, \
                        { "alt": "Output Logs", "url": "https://raw.githubusercontent.com/QAInsights/jmeter-docker-extension/main/assets/Output-Logs.png" } \
                    ]'
ARG PUBLISHER_URL='https://qainsights.com/'

ARG ADDITIONAL_URLS='[ \
                    { "title": "QAInsights", "url": "https://qainsights.com?utm_source=dockerextension" }, \
                    { "title": "GitHub", "url": "https://github.com/QAInsights/jmeter-docker-extension?utm_source=dockerextension" }, \
                    { "title": "Community", "url": "https://community.qainsights.com?utm_source=dockerextension" }, \
                    { "title": "YouTube", "url": "https://youtube.com/qainsights?utm_source=dockerextension" } \
                    { "title": "Sponsor", "url": "https://www.buymeacoffee.com/qainsights?utm_source=dockerextension" } \
                    ]'
ARG CHANGELOG='<p>Extension changelog:</p> <ul> \
<li>📦 NEW: Interactive charts</li> \
<li>✅ UPDATE: Home page</li> \
</ul>'

ARG CATEGORIES='testing-tools'
ARG DD_VERSION='>=0.2.3'
ARG DD_API_VERSION=">= 0.2.3"

LABEL org.opencontainers.image.title="${EXTENSION_NAME}" 
LABEL org.opencontainers.image.description="${DESCRIPTION}" 
LABEL org.opencontainers.image.vendor="${VENDOR}" 
LABEL com.docker.desktop.extension.api.version="${DD_API_VERSION}" 
LABEL com.docker.extension.screenshots="${SCREENSHOTS_URLS}" 
LABEL com.docker.desktop.extension.icon="${ICON_URL}" 
LABEL com.docker.extension.detailed-description="${DESCRIPTION_LONG}" 
LABEL com.docker.extension.publisher-url="${PUBLISHER_URL}" 
LABEL com.docker.extension.additional-urls="${ADDITIONAL_URLS}" 
LABEL com.docker.extension.categories="${CATEGORIES}" 
LABEL com.docker.extension.changelog="${CHANGELOG}"

COPY docker-compose.yaml .
COPY metadata.json .
COPY feather.svg .
COPY --from=client-builder /ui/build ui
CMD /service -socket /run/guest-services/backend.sock
