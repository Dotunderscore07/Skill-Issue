"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AttendanceController_1 = require("../controllers/AttendanceController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.auth, AttendanceController_1.AttendanceController.getAll);
router.put('/', auth_1.auth, (0, auth_1.authorizeRole)('teacher', 'coordinator', 'admin'), AttendanceController_1.AttendanceController.update);
exports.default = router;
