import express from "express";
const router = express.Router();

const isValidUrl = (url) => {
  try {
    if (!url) return false;
    const u = new URL(url);
    return ["http:", "https:"].includes(u.protocol);
  } catch {
    return false;
  }
};

router.get("/", (req, res) => {
  const DEFAULT_WHATSAPP_LINK = "https://wa.me/22241530965";
  const cfg = {
    facebook: process.env.FACEBOOK_URL,
    tiktok: process.env.TIKTOK_URL,
    whatsapp: DEFAULT_WHATSAPP_LINK,
  };
  const safe = Object.fromEntries(
    Object.entries(cfg).filter(([_, v]) => isValidUrl(v))
  );
  return res.json(safe);
});

export default router;
