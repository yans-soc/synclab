import * as service from './service.js';
import { success, fail } from '../../utils/response.js';

export async function getPublic(req, res) {
  const data = await service.getPublicBySlug(req.params.slug);
  if (!data) return fail(res, 'Page not found', 404);
  return success(res, 'Page loaded', data);
}

export async function list(req, res) {
  const data = await service.listAdmin();
  return success(res, 'Page list loaded', data);
}

export async function create(req, res) {
  const data = await service.create(req.body, req.user.id);
  return success(res, 'Page created', data, 201);
}

export async function update(req, res) {
  const data = await service.update(req.params.id, req.body);
  if (!data) return fail(res, 'Page not found', 404);
  return success(res, 'Page updated', data);
}

export async function remove(req, res) {
  const data = await service.remove(req.params.id);
  if (!data) return fail(res, 'Page not found', 404);
  return success(res, 'Page deleted', { id: data.id });
}
