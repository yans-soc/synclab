import * as service from './service.js';
import { success, fail } from '../../utils/response.js';

export async function active(req, res) {
  const data = await service.getActiveHomepage({ full: req.query.full === '1' });
  if (!data) return fail(res, 'No active homepage yet', 404);
  return success(res, 'Active homepage loaded', data);
}

export async function list(req, res) {
  const data = await service.listHomepages();
  return success(res, 'Homepage list loaded', data);
}

export async function getById(req, res) {
  const data = await service.getHomepageById(req.params.id);
  if (!data) return fail(res, 'Homepage not found', 404);
  return success(res, 'Homepage detail loaded', data);
}

export async function create(req, res) {
  const data = await service.createHomepage(req.body.title);
  return success(res, 'Homepage created', data, 201);
}

export async function setActive(req, res) {
  const data = await service.setHomepageActive(req.params.id, req.body.active);
  if (!data) return fail(res, 'Homepage not found', 404);
  return success(
    res,
    data.active ? 'Homepage published' : 'Homepage deactivated',
    data
  );
}

export async function createSection(req, res) {
  const homepage = await service.getHomepageById(req.params.id);
  if (!homepage) return fail(res, 'Homepage not found', 404);
  const data = await service.createSection(req.params.id, req.body);
  return success(res, 'Homepage section added', data, 201);
}

export async function updateSection(req, res) {
  const data = await service.updateSection(req.params.sectionId, req.body);
  if (!data) return fail(res, 'Homepage section not found', 404);
  return success(res, 'Homepage section updated', data);
}

export async function deleteSection(req, res) {
  const data = await service.deleteSection(req.params.sectionId);
  if (!data) return fail(res, 'Homepage section not found', 404);
  return success(res, 'Homepage section deleted', { id: data.id });
}

export async function duplicateSection(req, res) {
  const data = await service.duplicateSection(req.params.sectionId);
  if (!data) return fail(res, 'Homepage section not found', 404);
  return success(res, 'Homepage section duplicated', data, 201);
}

export async function reorder(req, res) {
  const data = await service.reorderSections(req.params.id, req.body.order);
  if (!data) return fail(res, 'Homepage not found', 404);
  return success(res, 'Homepage section order updated', data);
}
