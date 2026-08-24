import * as service from './service.js';
import { makeSlug } from '../../utils/slug.js';
import { success, fail } from '../../utils/response.js';

export async function list(req, res) {
  const data = await service.list();
  return success(res, 'Category list loaded', data);
}

export async function create(req, res) {
  const data = await service.create({
    ...req.body,
    slug: makeSlug(req.body.slug || req.body.name),
  });
  return success(res, 'Category created', data, 201);
}

export async function update(req, res) {
  const data = await service.update(req.params.id, {
    ...req.body,
    slug: req.body.slug ? makeSlug(req.body.slug) : req.body.slug,
  });
  if (!data) return fail(res, 'Category not found', 404);
  return success(res, 'Category updated', data);
}

export async function remove(req, res) {
  const data = await service.remove(req.params.id);
  if (!data) return fail(res, 'Category not found', 404);
  return success(res, 'Category deleted', { id: data.id });
}
