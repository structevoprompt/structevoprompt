module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (process.env.STRUCTEVO_IMAGE_API_ENABLED !== "true") {
    return res.status(503).json({
      error: "Image generation is disabled. Set STRUCTEVO_IMAGE_API_ENABLED=true in Vercel."
    });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "OPENAI_API_KEY is missing in Vercel."
    });
  }

  const allowedOrigins = [
    "https://structevo.com",
    "https://www.structevo.com",
    process.env.STRUCTEVO_ALLOWED_ORIGIN
  ].filter(Boolean);

  if (req.headers.origin && !allowedOrigins.includes(req.headers.origin)) {
    return res.status(403).json({
      error: "Open the generator from https://www.structevo.com"
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(503).json({
      error: "Connect Supabase authentication before enabling image generation."
    });
  }

  const authorization = req.headers.authorization || "";
  if (!authorization.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Log in to generate images." });
  }

  try {
    const userResponse = await fetch(
      `${supabaseUrl}/auth/v1/user`,
      {
        headers: {
          Authorization: authorization,
          apikey: supabaseKey
        }
      }
    );

    if (!userResponse.ok) {
      return res.status(401).json({
        error: "Your session expired. Log in again."
      });
    }

    const { prompt, ratio, quality } = req.body || {};

    if (
      typeof prompt !== "string" ||
      prompt.trim().length < 20 ||
      prompt.length > 8000
    ) {
      return res.status(400).json({
        error: "Enter a design prompt between 20 and 8000 characters."
      });
    }

    const size =
      ratio === "portrait" ? "1024x1536" :
      ratio === "square" ? "1024x1024" :
      "1536x1024";

    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: process.env.STRUCTEVO_IMAGE_MODEL || "gpt-image-2",
          prompt: prompt.trim(),
          size,
          quality: ["low", "medium", "high"].includes(quality)
            ? quality : "medium",
          n: 1
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Image generation failed."
      });
    }

    const image = data?.data?.[0]?.b64_json;
    if (!image) {
      return res.status(502).json({
        error: "No image was returned."
      });
    }

    return res.status(200).json({
      image: `data:image/png;base64,${image}`
    });
  } catch {
    return res.status(500).json({
      error: "Could not reach the image service. Try again later."
    });
  }
};
