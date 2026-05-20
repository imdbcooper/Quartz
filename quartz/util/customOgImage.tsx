import { defaultImage, SocialImageOptions } from "./og"
import { getFontSpecificationName } from "./theme"

export const smirnoffSocialImage: SocialImageOptions["imageStructure"] = (options) => {
  const { cfg, userOpts, title, description, fileData, iconBase64, avatarBase64 } = options

  if (fileData.slug !== "index" || !avatarBase64) {
    return defaultImage(options)
  }

  const colors = cfg.theme.colors[userOpts.colorScheme]
  const headerFont = getFontSpecificationName(cfg.theme.typography.header)
  const bodyFont = getFontSpecificationName(cfg.theme.typography.body)

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: "42px",
        backgroundColor: colors.light,
        backgroundImage:
          "radial-gradient(circle at 18% 22%, rgba(40, 75, 99, 0.12), transparent 34%), radial-gradient(circle at 86% 78%, rgba(132, 165, 157, 0.12), transparent 30%)",
        fontFamily: bodyFont,
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: "34px 36px",
          borderRadius: 32,
          border: `1px solid ${colors.lightgray}`,
          backgroundColor: "rgba(255,255,255,0.7)",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            paddingRight: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              color: colors.darkgray,
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
                  color: colors.dark,
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
                  backgroundColor: colors.gray,
                }}
              />
              <span style={{ display: "flex" }}>{cfg.baseUrl}</span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "10px 18px",
                borderRadius: 999,
                backgroundColor: colors.highlight,
                color: colors.secondary,
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
                color: colors.dark,
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
                color: colors.darkgray,
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
              color: colors.darkgray,
              fontSize: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "10px 16px",
                borderRadius: 999,
                backgroundColor: "rgba(40, 75, 99, 0.08)",
                color: colors.secondary,
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
              width: 300,
              height: 300,
              overflow: "hidden",
              borderRadius: 36,
              border: `1px solid ${colors.lightgray}`,
              backgroundColor: "#ffffff",
              boxShadow: "0 24px 80px rgba(15, 23, 42, 0.12)",
            }}
          >
            <img
              src={avatarBase64}
              width={300}
              height={300}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
