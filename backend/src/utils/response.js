export function berhasil(res, pesan, data = null, status = 200, meta) {
  const body = { sukses: true, pesan, data };
  if (meta) body.meta = meta;
  return res.status(status).json(body);
}

export function gagal(res, pesan, status = 400, data = null) {
  return res.status(status).json({ sukses: false, pesan, data });
}
