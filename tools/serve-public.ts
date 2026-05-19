import { existsSync } from "node:fs"
import http from "node:http"
import path from "node:path"
import serveHandler from "serve-handler"

const args = process.argv.slice(2)
const firstArg = args[0]
const usesCustomDir = firstArg !== undefined && !/^\d+$/.test(firstArg)
const outputDir = path.resolve(process.cwd(), usesCustomDir ? firstArg : "public")
const portValue = usesCustomDir ? args[1] : firstArg
const port = Number(portValue ?? process.env.PORT ?? 4173)

if (!existsSync(outputDir)) {
  throw new Error(`Directory does not exist: ${outputDir}`)
}

if (!Number.isInteger(port) || port <= 0) {
  throw new Error(`Invalid port: ${portValue ?? process.env.PORT ?? "undefined"}`)
}

const headers = [
  {
    source: "**/*.*",
    headers: [{ key: "Content-Disposition", value: "inline" }],
  },
  {
    source: "**/*.webp",
    headers: [{ key: "Content-Type", value: "image/webp" }],
  },
  {
    source: "**/*.avif",
    headers: [{ key: "Content-Type", value: "image/avif" }],
  },
]

const server = http.createServer(async (req, res) => {
  const serve = () =>
    serveHandler(req, res, {
      public: outputDir,
      directoryListing: false,
      headers,
    })

  const redirect = (location: string) => {
    res.writeHead(302, { Location: location })
    res.end()
  }

  const requestPath = req.url?.split("?")[0] ?? "/"

  if (requestPath.endsWith("/")) {
    const indexPath = path.posix.join(requestPath, "index.html")
    if (existsSync(path.join(outputDir, indexPath))) {
      return serve()
    }

    let basePath = requestPath.slice(0, -1)
    if (path.extname(basePath) === "") {
      basePath += ".html"
    }
    if (existsSync(path.join(outputDir, basePath))) {
      return redirect(requestPath.slice(0, -1))
    }
  } else {
    let basePath = requestPath
    if (path.extname(basePath) === "") {
      basePath += ".html"
    }
    if (existsSync(path.join(outputDir, basePath))) {
      return serve()
    }

    const indexPath = path.posix.join(requestPath, "index.html")
    if (existsSync(path.join(outputDir, indexPath))) {
      return redirect(requestPath + "/")
    }
  }

  return serve()
})

server.listen(port, () => {
  console.log(`Serving ${outputDir} at http://localhost:${port}`)
})
