declare module "serve-handler" {
  import type { IncomingMessage, ServerResponse } from "node:http"

  type Header = {
    key: string
    value: string
  }

  type HeaderRule = {
    source: string
    headers: Header[]
  }

  type Options = {
    public?: string
    directoryListing?: boolean
    headers?: HeaderRule[]
  }

  export default function serveHandler(
    request: IncomingMessage,
    response: ServerResponse,
    options?: Options,
  ): Promise<void>
}
