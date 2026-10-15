const collection = require("./_db");
module.exports = async (req, res) => {
  try { const c = await collection(); await c.estimatedDocumentCount(); res.status(200).json({ ok: true, database: "connected", lockedByAccessKey: !!process.env.ACCESS_KEY }); }
  catch (e) { res.status(500).json({ ok: false, message: e.message }); }
};
