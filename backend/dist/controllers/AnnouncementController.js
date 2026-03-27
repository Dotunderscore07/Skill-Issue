"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementController = void 0;
const AnnouncementService_1 = require("../services/AnnouncementService");
const apiResponse_1 = require("../utils/apiResponse");
class AnnouncementController {
    static async getAll(req, res) {
        try {
            const announcements = await AnnouncementService_1.AnnouncementService.getAll();
            (0, apiResponse_1.sendSuccess)(res, announcements);
        }
        catch (err) {
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
    static async create(req, res) {
        try {
            const announcement = await AnnouncementService_1.AnnouncementService.create(req.body);
            (0, apiResponse_1.sendSuccess)(res, announcement, 201);
        }
        catch (err) {
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
    static async update(req, res) {
        try {
            const { id } = req.params;
            const announcement = await AnnouncementService_1.AnnouncementService.update(id, req.body);
            if (!announcement) {
                return (0, apiResponse_1.sendError)(res, 'Announcement not found', 404);
            }
            (0, apiResponse_1.sendSuccess)(res, announcement);
        }
        catch (err) {
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
    static async delete(req, res) {
        try {
            const { id } = req.params;
            const deleted = await AnnouncementService_1.AnnouncementService.delete(id);
            if (!deleted) {
                return (0, apiResponse_1.sendError)(res, 'Announcement not found', 404);
            }
            (0, apiResponse_1.sendSuccess)(res, { deleted: true, id: Number(id) });
        }
        catch (err) {
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
}
exports.AnnouncementController = AnnouncementController;
