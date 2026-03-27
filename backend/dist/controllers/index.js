"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./UserController"), exports);
__exportStar(require("./StudentController"), exports);
__exportStar(require("./AnnouncementController"), exports);
__exportStar(require("./ActivityController"), exports);
__exportStar(require("./AttendanceController"), exports);
__exportStar(require("./MessageController"), exports);
__exportStar(require("./ClassController"), exports);
__exportStar(require("./RoutineController"), exports);
__exportStar(require("./DashboardController"), exports);
__exportStar(require("./AuthController"), exports);
