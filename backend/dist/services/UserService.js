"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const db_1 = require("../db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const selectUsersBase = `
  SELECT
    u.id,
    u.name,
    u.phone,
    u.role,
    u.avatar,
    COALESCE(array_remove(array_agg(ct.class_id), NULL), ARRAY[]::varchar[]) AS "classIds"
  FROM users u
  LEFT JOIN class_teachers ct ON ct.teacher_id = u.id
`;
class UserService {
    static async getAll(role) {
        const params = [];
        const whereClause = role ? ' WHERE u.role = $1' : '';
        if (role) {
            params.push(role);
        }
        const result = await (0, db_1.query)(`${selectUsersBase}
       ${whereClause}
       GROUP BY u.id
       ORDER BY u.name`, params);
        return result.rows;
    }
    static async getById(id) {
        const result = await (0, db_1.query)(`${selectUsersBase}
       WHERE u.id = $1
       GROUP BY u.id`, [id]);
        return result.rows[0];
    }
    static async createTeacher(data) {
        const { name, phone, password, classIds = [], avatar: avatarInput } = data;
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        const id = (0, uuid_1.v4)();
        const avatar = avatarInput || this.buildAvatar(name);
        await (0, db_1.query)('INSERT INTO users (id, name, phone, role, password, avatar) VALUES ($1, $2, $3, $4, $5, $6)', [id, name, phone, 'teacher', hashedPassword, avatar]);
        for (const classId of classIds) {
            await (0, db_1.query)('INSERT INTO class_teachers (class_id, teacher_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [classId, id]);
        }
        return this.getById(id);
    }
    static async updateProfile(id, data) {
        const { name, phone, avatar: avatarInput, password } = data;
        const avatar = avatarInput || this.buildAvatar(name);
        if (password) {
            const salt = await bcrypt_1.default.genSalt(10);
            const hashedPassword = await bcrypt_1.default.hash(password, salt);
            await (0, db_1.query)('UPDATE users SET name = $1, phone = $2, avatar = $3, password = $4 WHERE id = $5', [name, phone, avatar, hashedPassword, id]);
        }
        else {
            await (0, db_1.query)('UPDATE users SET name = $1, phone = $2, avatar = $3 WHERE id = $4', [name, phone, avatar, id]);
        }
        return this.getById(id);
    }
    static async updateTeacher(id, data) {
        const { name, phone, password, classIds = [], avatar: avatarInput } = data;
        const avatar = avatarInput || this.buildAvatar(name);
        await (0, db_1.query)('UPDATE users SET name = $1, phone = $2, avatar = $3 WHERE id = $4 AND role = $5', [
            name,
            phone,
            avatar,
            id,
            'teacher',
        ]);
        if (password) {
            const salt = await bcrypt_1.default.genSalt(10);
            const hashedPassword = await bcrypt_1.default.hash(password, salt);
            await (0, db_1.query)('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, id]);
        }
        await (0, db_1.query)('DELETE FROM class_teachers WHERE teacher_id = $1', [id]);
        for (const classId of classIds) {
            await (0, db_1.query)('INSERT INTO class_teachers (class_id, teacher_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [classId, id]);
        }
        return this.getById(id);
    }
    static async deleteTeacher(id) {
        await (0, db_1.query)('DELETE FROM messages WHERE "fromId" = $1 OR "toId" = $1', [id]);
        await (0, db_1.query)('DELETE FROM users WHERE id = $1', [id]);
        return { deleted: true, id };
    }
    static buildAvatar(name) {
        return name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? '')
            .join('');
    }
}
exports.UserService = UserService;
