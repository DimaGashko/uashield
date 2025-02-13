import ua from 'universal-analytics'
import uuid4 from 'uuid4'

import { Engine } from './src-worker/engine'

import { parseArguments } from './src-lib/context'
import { AutomaticStrategy } from './src-worker/planing/automaticStrategy'

const arg = parseArguments()

let workers = arg.workers
let useProxy = arg.withProxy

if (process.env.WORKERS) {
  workers = Number(process.env.WORKERS)
}
if (process.env.USEPROXY) {
  useProxy = process.env.USEPROXY === 'true'
}

console.log(`Using ${workers} workers, proxy - ${String(useProxy)}`)

const engine = new Engine()
engine.setExecutorStartegy(arg.planer as 'manual' | 'automatic')
engine.config.useRealIP = !useProxy
engine.start()

if (engine.executionStartegy.type === 'automatic') {
  (engine.executionStartegy as AutomaticStrategy).setMaxExecutorsCount(arg.maxWorkers)
}
engine.executionStartegy.setExecutorsCount(workers)

engine.config.logTimestamp = arg.logTimestamp
engine.config.logRequests = arg.logRequests

const usr = ua('UA-222593827-1', uuid4())

const pageviewFn = () => {
  try {
    usr.pageview('/headless', (err) => {
      if (err) {
        console.log(err)
      }
    })
  } catch (e) { console.log(e) }
}
pageviewFn()
setInterval(pageviewFn, 90000)

process.on('uncaughtException', function (err) {
  console.error(err)
})
