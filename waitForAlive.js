#!/usr/bin/env node

const http = require('http')
const { URL } = require('url')

const OK = 'OK'
const CONNECT = 'CONNECT'

function checkCondition([url, condition]) {
  return new Promise((resolve, reject) => {
    const { hostname, port, pathname } = new URL(url)
    http
      .get(
        {
          hostname,
          port,
          path: pathname,
          agent: false,
        },
        ({ statusMessage, statusCode }) => {
          if (condition === OK && statusMessage === OK) {
            resolve()
          } else if (condition !== OK && statusMessage) {
            resolve()
          } else {
            reject(new Error(`Error: ${url} ${statusCode} ${statusMessage}`))
          }
        },
      )
      .on('error', (error) => reject(error))
  })
}

function waitFor(params, delayBetweenCycles = 500) {
  Promise.all(params.map(checkCondition))
    .then(() => {
      console.log('All hosts are ready!')
      process.exit(0)
    })
    .catch((error) => {
      console.log(error.message)
      setTimeout(() => waitFor(params, delayBetweenCycles), delayBetweenCycles)
    })
}

function findArgs(flagName) {
  return process.argv.slice(2).filter((item, index, arr) => arr[index - 1] === flagName)
}

function findNumberArg(flagName) {
  return +findArgs(flagName)[0] || undefined
}

const hostNamesToWaitForConnect = findArgs('-c')
const hostNamesToWaitForOkResponse = findArgs('-o')

const timeout = findNumberArg('-t')
const delay = +findNumberArg('-d')

if (timeout) {
  setTimeout(() => {
    console.error('Timeout!')
    process.exit(1)
  }, timeout)
}

const params = [
  ...hostNamesToWaitForConnect.map((it) => [it, CONNECT]),
  ...hostNamesToWaitForOkResponse.map((it) => [it, OK]),
]
waitFor(params, delay)
