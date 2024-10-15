// copied from 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework'

import * as fs from "node:fs"
import * as http from "node:http"
import * as path from "node:path"
import * as url from "node:url"

import { Readable } from 'stream'

import { Apath } from "../dist/src/accessor/apath-func.js"

const PORT = 8000

const MIME_TYPES = {
  default: "application/octet-stream",
  html: "text/html; charset=UTF-8",
  js: "application/javascript",
  css: "text/css",
  png: "image/png",
  jpg: "image/jpg",
  gif: "image/gif",
  ico: "image/x-icon",
  svg: "image/svg+xml",
}

const STATIC_PATH = path.join(process.cwd(), "./workbench")

const toBool = [() => true, () => false]

const prepareFile = async (url) => {

  if (url.startsWith('/eval')) {
    const idx = url.indexOf('?')
    const params = new URLSearchParams(url.substring(idx))
    console.log(params)
    const data = JSON.parse(params.get('data'))
    console.log(data)
    console.log(data.input)
    console.log(data.apath)
    console.log(data.sfuncs)
    const found = true
    const ext = ''
    const stream = null
    return { found: true, ext: '', stream: Readable.from('stream') }
  }
  const paths = [STATIC_PATH, url]
  if (url.endsWith("/")) paths.push("index.html")
  let filePath = path.join(...paths)
  const pathTraversal = !filePath.startsWith(STATIC_PATH)
  const idx = filePath.indexOf('?')
  if (idx !== -1) filePath = filePath.substring(0, idx)
  const exists = await fs.promises.access(filePath).then(...toBool)
  const found = !pathTraversal && exists
  const streamPath = found ? filePath : STATIC_PATH + "/404.html"
  const ext = path.extname(streamPath).substring(1).toLowerCase()
  const stream = fs.createReadStream(streamPath)
  return { found, ext, stream }
}

http
  .createServer(async (req, res) => {
    const file = await prepareFile(req.url)
    const statusCode = file.found ? 200 : 404
    const mimeType = MIME_TYPES[file.ext] || MIME_TYPES.default
    res.writeHead(statusCode, { "Content-Type": mimeType })
    file.stream.pipe(res)
    console.log(`${req.method} ${req.url} ${statusCode}`)
  })
  .listen(PORT)

//test
const apath = new Apath()
console.log(apath)
//

console.log(`Server running at http://127.0.0.1:${PORT}/`)
