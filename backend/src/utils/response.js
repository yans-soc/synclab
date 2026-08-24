export function success(res, message, data = null, status = 200, meta) {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}

export function fail(res, message, status = 400, data = null) {
  return res.status(status).json({ success: false, message, data });
}
