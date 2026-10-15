const collection = require("./_db");
module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    const key = process.env.ACCESS_KEY; // optional: set it in Vercel to lock the app with a password
    if (key && req.headers["x-access-key"] !== key) return res.status(401).json({ message: "Access key required" });
    const c = await collection();
    if (req.method === "GET") {
      const d = await c.findOne({ _id: "main" });
      return res.status(200).json(d ? d.data : null); // first run: no data yet (null, not an error)
    }
    if (req.method === "PUT") {
      const body = req.body;
      if (!body || typeof body !== "object") return res.status(400).json({ message: "Invalid body" });
      await c.updateOne({ _id: "main" }, { $set: { data: body, updatedAt: new Date() } }, { upsert: true });
      return res.status(200).json({ ok: true });
    }
    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ message: "Method not allowed" });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
