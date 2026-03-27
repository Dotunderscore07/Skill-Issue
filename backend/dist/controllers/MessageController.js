"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageController = void 0;
const MessageService_1 = require("../services/MessageService");
const apiResponse_1 = require("../utils/apiResponse");
class MessageController {
    static async getThread(req, res) {
        try {
            const partnerId = req.query.partnerId;
            const kind = req.query.kind;
            const messages = await MessageService_1.MessageService.getThread(req.user.id, { partnerId, kind });
            (0, apiResponse_1.sendSuccess)(res, messages);
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
    static async send(req, res) {
        try {
            const { kind = 'direct' } = req.body;
            if (kind === 'broadcast' && req.user?.role !== 'coordinator') {
                return (0, apiResponse_1.sendError)(res, 'Forbidden', 403);
            }
            const message = await MessageService_1.MessageService.send({ ...req.body, fromId: req.user.id });
            (0, apiResponse_1.sendSuccess)(res, message, 201);
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
}
exports.MessageController = MessageController;
