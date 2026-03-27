"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth = (req, res, next) => {
    const token = req.cookies?.token || req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        res.status(401).json({ success: false, data: null, error: 'No token, authorization denied' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded.user;
        next();
    }
    catch (err) {
        res.status(401).json({ success: false, data: null, error: 'Token is not valid' });
    }
};
exports.auth = auth;
const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({ success: false, data: null, error: 'Forbidden: Insufficient role permissions' });
            return;
        }
        next();
    };
};
exports.authorizeRole = authorizeRole;
