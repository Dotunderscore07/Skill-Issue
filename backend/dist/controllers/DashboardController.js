"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const DashboardService_1 = require("../services/DashboardService");
const apiResponse_1 = require("../utils/apiResponse");
class DashboardController {
    static async getCoordinatorSummary(req, res) {
        try {
            const summary = await DashboardService_1.DashboardService.getCoordinatorSummary();
            (0, apiResponse_1.sendSuccess)(res, summary);
        }
        catch (err) {
            console.error(err);
            (0, apiResponse_1.sendError)(res, 'Internal server error');
        }
    }
}
exports.DashboardController = DashboardController;
