FROM node:alpine

ENV PATH "$PATH:/root/.local/bin/"

RUN apk add --update python python-dev py-pip build-base terraform && \
  pip install awscli --upgrade --user && \
  apk --purge -v del py-pip && \
  rm -rf /var/cache/apk/*
