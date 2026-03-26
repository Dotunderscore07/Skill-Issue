"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const DashboardController_1 = require("../controllers/DashboardController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/coordinator', auth_1.auth, (0, auth_1.authorizeRole)('coordinator'), DashboardController_1.DashboardController.getCoordinatorSummary);
exports.default = router;
