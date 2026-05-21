import { QuartzComponent, QuartzComponentConstructor } from "./types"
import style from "./styles/siteGeometryBackground.scss"
// @ts-ignore
import script from "./scripts/siteGeometryBackground.inline"

export interface SiteGeometryBackgroundConfig {
  enabled: boolean
  speed: number
  density: number
  connectionDistance: number
  lineOpacity: number
  nodeOpacity: number
}

const defaultConfig: SiteGeometryBackgroundConfig = {
  enabled: true,
  speed: 1.35,
  density: 1.12,
  connectionDistance: 176,
  lineOpacity: 1.08,
  nodeOpacity: 1.14,
}

export default ((userConfig?: Partial<SiteGeometryBackgroundConfig>) => {
  const config = { ...defaultConfig, ...userConfig }

  const SiteGeometryBackground: QuartzComponent = () => {
    return (
      <div
        class="site-geometry-background-resources"
        aria-hidden="true"
        data-site-geometry-config="true"
        data-site-geometry-enabled={config.enabled ? "true" : "false"}
        data-site-geometry-speed={String(config.speed)}
        data-site-geometry-density={String(config.density)}
        data-site-geometry-connection-distance={String(config.connectionDistance)}
        data-site-geometry-line-opacity={String(config.lineOpacity)}
        data-site-geometry-node-opacity={String(config.nodeOpacity)}
      ></div>
    )
  }

  SiteGeometryBackground.css = style
  SiteGeometryBackground.afterDOMLoaded = script

  return SiteGeometryBackground
}) satisfies QuartzComponentConstructor<Partial<SiteGeometryBackgroundConfig> | undefined>
