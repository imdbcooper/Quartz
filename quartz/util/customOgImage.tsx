import { defaultImage, SocialImageOptions } from "./og"
import { getFontSpecificationName } from "./theme"

export const smirnoffSocialImage: SocialImageOptions["imageStructure"] = (options) => {
  const { cfg, title, description, fileData, iconBase64, avatarBase64 } = options

  if (fileData.slug !== "index" || !avatarBase64) {
    return defaultImage(options)
  }

  const headerFont = getFontSpecificationName(cfg.theme.typography.header)
  const bodyFont = getFontSpecificationName(cfg.theme.typography.body)
  const heroBlue = "#60a5fa"
  const heroBlueSoft = "#bfdbfe"
  const heroOrange = "#fb923c"
  const heroBackground = "#080b12"
  const heroText = "#f8fafc"
  const heroMuted = "#a8b3c7"
  const heroSurface = "rgba(15, 23, 42, 0.72)"

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        padding: "42px",
        overflow: "hidden",
        borderRadius: 32,
        border: `1px solid ${heroBlue}2e`,
        backgroundColor: heroBackground,
        backgroundImage:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.055), transparent 34%), radial-gradient(circle at 76% 18%, rgba(59, 130, 246, 0.22), transparent 34%), radial-gradient(circle at 14% 86%, rgba(251, 146, 60, 0.16), transparent 30%), radial-gradient(circle at 58% 52%, rgba(96, 165, 250, 0.12), transparent 28%)",
        boxShadow: "0 36px 100px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
        fontFamily: bodyFont,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(96, 165, 250, 0.065) 1px, transparent 1px), linear-gradient(90deg, rgba(96, 165, 250, 0.055) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
          opacity: 0.2,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "13%",
          left: "56%",
          width: "33%",
          height: "64%",
          backgroundImage:
            "linear-gradient(115deg, transparent 0 18%, rgba(96, 165, 250, 0.16) 18.4%, transparent 19%), linear-gradient(28deg, transparent 0 62%, rgba(255, 255, 255, 0.12) 62.3%, transparent 63%), radial-gradient(circle at 22% 26%, rgba(255, 255, 255, 0.32) 1px, transparent 2px), radial-gradient(circle at 82% 72%, rgba(96, 165, 250, 0.42) 1px, transparent 2px)",
          opacity: 0.42,
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          padding: "8px 6px",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            paddingRight: "34px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              color: heroMuted,
              fontSize: 26,
            }}
          >
            {iconBase64 && (
              <img
                src={iconBase64}
                width={40}
                height={40}
                style={{
                  borderRadius: 12,
                  backgroundColor: heroText,
                  padding: "6px",
                }}
              />
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span
                style={{
                  display: "flex",
                  color: heroText,
                  fontWeight: 700,
                }}
              >
                {cfg.pageTitle}
              </span>
              <span
                style={{
                  display: "flex",
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: "rgba(148, 163, 184, 0.42)",
                }}
              />
              <span style={{ display: "flex" }}>{cfg.baseUrl}</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "22px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "10px 18px",
                borderRadius: 999,
                border: `1px solid ${heroBlue}47`,
                backgroundColor: heroSurface,
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
                color: heroBlueSoft,
                fontSize: 20,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Telegram · Web · AI
            </div>
            <h1
              style={{
                margin: 0,
                color: heroText,
                fontFamily: headerFont,
                fontSize: 64,
                fontWeight: 700,
                lineHeight: 1.06,
                letterSpacing: "-0.03em",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 3,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </h1>
            <p
              style={{
                margin: 0,
                maxWidth: "92%",
                color: heroMuted,
                fontSize: 29,
                lineHeight: 1.38,
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 4,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {description}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              color: heroMuted,
              fontSize: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "10px 16px",
                borderRadius: 999,
                border: "1px solid rgba(148, 163, 184, 0.18)",
                backgroundColor: "rgba(15, 23, 42, 0.58)",
                boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.045)",
                color: heroBlueSoft,
              }}
            >
              Проектирую под задачу бизнеса
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: 340,
            minWidth: 340,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 316,
              height: 316,
              padding: "4px",
              borderRadius: 999,
              backgroundImage: `linear-gradient(140deg, rgba(96, 165, 250, 0.44), rgba(255, 255, 255, 0.08) 52%, ${heroOrange}57)`,
              boxShadow: "0 30px 80px rgba(2, 6, 23, 0.48)",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                borderRadius: 999,
                border: "1px solid rgba(255, 255, 255, 0.08)",
                backgroundColor: "#0f172a",
              }}
            >
              <img
                src={avatarBase64}
                width={300}
                height={300}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 999,
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
