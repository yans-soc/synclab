import * as service from './service.js';
import { success, fail } from '../../utils/response.js';

function toPositiveInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export async function listPublic(req, res) {
  const { category, sort } = req.query;
  const page = toPositiveInt(req.query.page, 1);
  const limit = Math.min(toPositiveInt(req.query.limit, 10), 50);
  const { data, meta } = await service.listPublic({ category, page, limit, sort });
  return success(res, 'Article list retrieved', data, 200, meta);
}

export async function getPublic(req, res) {
  const data = await service.getPublicBySlug(req.params.slug, {
    userAgent: String(req.headers['user-agent'] || ''),
  });
  if (!data) return fail(res, 'Article not found', 404);
  return success(res, 'Article detail found', data);
}

export async function trending(req, res) {
  const limit = Math.min(toPositiveInt(req.query.limit, 6), 24);
  const data = await service.listTrending(limit);
  return success(res, 'Trending articles from the last 7 days retrieved', data);
}

export async function listAdmin(req, res) {
  const page = toPositiveInt(req.query.page, 1);
  const limit = Math.min(toPositiveInt(req.query.limit, 10), 100);
  const { data, meta } = await service.listAdmin({
    status: req.query.status,
    search: req.query.search,
    page,
    limit,
  });
  return success(res, 'Article list loaded', data, 200, meta);
}

export async function getAdminById(req, res) {
  const data = await service.getAdminById(req.params.id);
  if (!data) return fail(res, 'Article not found', 404);
  return success(res, 'Article detail loaded', data);
}

export async function create(req, res) {
  const data = await service.create(req.body, req.user.id);
  return success(res, 'Article created', data, 201);
}

export async function update(req, res) {
  const data = await service.update(req.params.id, req.body);
  if (!data) return fail(res, 'Article not found', 404);
  return success(res, 'Article updated', data);
}

export async function remove(req, res) {
  const data = await service.remove(req.params.id);
  if (!data) return fail(res, 'Article not found', 404);
  return success(res, 'Article deleted', { id: data.id });
}
