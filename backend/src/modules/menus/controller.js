import * as service from './service.js';
import { success, fail } from '../../utils/response.js';

export async function getPublic(req, res) {
  const data = await service.listByLocation(req.params.location);
  return success(res, `Menu for location "${req.params.location}" loaded`, data);
}

export async function list(req, res) {
  const data = await service.listMenus();
  return success(res, 'Menu list loaded', data);
}

export async function create(req, res) {
  const data = await service.createMenu(req.body);
  return success(res, 'Menu created', data, 201);
}

export async function addItem(req, res) {
  const data = await service.addItem(req.params.id, req.body);
  return success(res, 'Menu item added', data, 201);
}

export async function updateItem(req, res) {
  const data = await service.updateItem(req.params.itemId, req.body);
  if (!data) return fail(res, 'Menu item not found', 404);
  return success(res, 'Menu item updated', data);
}

export async function deleteItem(req, res) {
  const data = await service.deleteItem(req.params.itemId);
  if (!data) return fail(res, 'Menu item not found', 404);
  return success(res, 'Menu item deleted', { id: data.id });
}
