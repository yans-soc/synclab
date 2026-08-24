import * as service from './service.js';
import { success } from '../../utils/response.js';

export async function getPublic(req, res) {
  const data = await service.getAll();
  return success(res, 'Global settings loaded', data);
}

export async function list(req, res) {
  const data = await service.listFull();
  return success(res, 'Settings list loaded', data);
}

export async function saveBulk(req, res) {
  const data = await service.saveBulk(req.body.settings);
  return success(res, 'Settings saved', data);
}
