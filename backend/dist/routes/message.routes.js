"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MessageController_1 = require("../controllers/MessageController");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.auth, MessageController_1.MessageController.getThread);
router.post('/', auth_1.auth, MessageController_1.MessageController.send);
exports.default = router;
