FROM node:alpine

RUN apk update && apk upgrade && apk add clamav clamav-libunrar
RUN mkdir /run/clamav/ && chown -R clamav:clamav /run/clamav/

WORKDIR /usr/app
COPY ./ /usr/app

RUN npm ci

# RUN sed -i 's/^Foreground .*$/Foreground true/g' /etc/clamav/clamd.conf && \
#   echo "TCPSocket 3310" >> /etc/clamav/clamd.conf && \
#   if [ -n "$HTTPProxyServer" ]; then echo "HTTPProxyServer $HTTPProxyServer" >> /etc/clamav/freshclam.conf; fi && \
#   if [ -n "$HTTPProxyPort"   ]; then echo "HTTPProxyPort $HTTPProxyPort" >> /etc/clamav/freshclam.conf; fi && \
#   sed -i 's/^Foreground .*$/Foreground true/g' /etc/clamav/freshclam.conf