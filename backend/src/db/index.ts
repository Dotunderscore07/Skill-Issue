import { Pool, Client } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import {
  MOCK_USERS,
  MOCK_STUDENTS,
  MOCK_CLASSES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ACTIVITIES,
  INITIAL_ATTENDANCE,
  INITIAL_MESSAGES,
} from '../models/mockData';

dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:MyDb0720@localhost:5432/kinderconnect';
const parsedUrl = new URL(dbUrl);
const dbName = parsedUrl.pathname.replace('/', '') || 'kinderconnect';
parsedUrl.pathname = '/postgres';
const defaultDbUrl = parsedUrl.toString();

export let pool: Pool;

export const query = async (text: string, params?: any[]) => {
  if (!pool) {
    throw new Error('Pool not initialized');
  }

  return pool.query(text, params);
};

export const initDb = async () => {
  try {
    const client = new Client({ connectionString: defaultDbUrl });
    await client.connect();

    const res = await client.query('SELECT datname FROM pg_catalog.pg_database WHERE datname = $1', [dbName]);

    if (res.rowCount === 0) {
      console.log(`Database '${dbName}' not found, creating it...`);
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database '${dbName}' created successfully.`);
    } else {
      console.log(`Database '${dbName}' already exists.`);
    }

    await client.end();

    pool = new Pool({ connectionString: dbUrl });

    await pool.query(`
      DROP TABLE IF EXISTS messages CASCADE;
      DROP TABLE IF EXISTS attendance_records CASCADE;
      DROP TABLE IF EXISTS activities CASCADE;
      DROP TABLE IF EXISTS announcements CASCADE;
      DROP TABLE IF EXISTS class_teachers CASCADE;
      DROP TABLE IF EXISTS class_subjects CASCADE;
      DROP TABLE IF EXISTS parent_students CASCADE;
      DROP TABLE IF EXISTS subjects CASCADE;
      DROP TABLE IF EXISTS classes CASCADE;
      DROP TABLE IF EXISTS students CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    await pool.query(`
      CREATE TABLE users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) UNIQUE NOT NULL,
        role VARCHAR(50) NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(10) NOT NULL DEFAULT ''
      );

      CREATE TABLE classes (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );

      CREATE TABLE students (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        dob VARCHAR(20) NOT NULL,
        photo TEXT NOT NULL DEFAULT '',
        "classId" VARCHAR(50) REFERENCES classes(id) ON DELETE SET NULL
      );

      CREATE TABLE subjects (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );

      CREATE TABLE class_teachers (
        class_id VARCHAR(50) REFERENCES classes(id) ON DELETE CASCADE,
        teacher_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (class_id, teacher_id)
      );

      CREATE TABLE class_subjects (
        class_id VARCHAR(50) REFERENCES classes(id) ON DELETE CASCADE,
        subject_id VARCHAR(50) REFERENCES subjects(id) ON DELETE CASCADE,
        PRIMARY KEY (class_id, subject_id)
      );

      CREATE TABLE parent_students (
        parent_id VARCHAR(50) REFERENCES users(id) ON DELETE CASCADE,
        student_id VARCHAR(50) REFERENCES students(id) ON DELETE CASCADE,
        PRIMARY KEY (parent_id, student_id)
      );

      CREATE TABLE announcements (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        date VARCHAR(50) NOT NULL,
        author VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        "classId" VARCHAR(50) REFERENCES classes(id) ON DELETE SET NULL
      );

      CREATE TABLE activities (
        id SERIAL PRIMARY KEY,
        "studentId" VARCHAR(50) NOT NULL,
        text TEXT NOT NULL,
        date VARCHAR(50) NOT NULL,
        mood VARCHAR(50) NOT NULL
      );

      CREATE TABLE attendance_records (
        id SERIAL PRIMARY KEY,
        date VARCHAR(50) NOT NULL,
        "studentId" VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL
      );

      CREATE TABLE messages (
        id SERIAL PRIMARY KEY,
        "fromId" VARCHAR(50) NOT NULL,
        "toId" VARCHAR(50),
        text TEXT NOT NULL,
        image TEXT NOT NULL DEFAULT '',
        timestamp VARCHAR(50) NOT NULL,
        read BOOLEAN DEFAULT false,
        kind VARCHAR(50) NOT NULL DEFAULT 'direct'
      );
    `);

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('123', salt);

    for (const user of MOCK_USERS) {
      await pool.query(
        'INSERT INTO users (id, name, phone, role, password, avatar) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
        [user.id, user.name, user.phone, user.role, defaultPassword, user.avatar]
      );
    }

    for (const cls of MOCK_CLASSES) {
      await pool.query(
        'INSERT INTO classes (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
        [cls.id, cls.name]
      );
    }

    for (const student of MOCK_STUDENTS) {
      await pool.query(
        'INSERT INTO students (id, name, dob, photo, "classId") VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [student.id, student.name, student.dob, student.photo, student.classId]
      );
    }

    for (const user of MOCK_USERS.filter((entry) => entry.role === 'teacher')) {
      for (const classId of user.classIds ?? []) {
        await pool.query(
          'INSERT INTO class_teachers (class_id, teacher_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [classId, user.id]
        );
      }
    }

    for (const student of MOCK_STUDENTS) {
      if (student.parentId) {
        await pool.query(
          'INSERT INTO parent_students (parent_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [student.parentId, student.id]
        );
      }
    }

    for (const ann of INITIAL_ANNOUNCEMENTS) {
      await pool.query(
        'INSERT INTO announcements (id, text, date, author, type, "classId") VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
        [ann.id, ann.text, ann.date, ann.author, ann.type, ann.classId ?? null]
      );
    }

    for (const act of INITIAL_ACTIVITIES) {
      await pool.query(
        'INSERT INTO activities (id, "studentId", text, date, mood) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (id) DO NOTHING',
        [act.id, act.studentId, act.text, act.date, act.mood]
      );
    }

    for (const att of INITIAL_ATTENDANCE) {
      await pool.query(
        'INSERT INTO attendance_records (date, "studentId", status) VALUES ($1, $2, $3)',
        [att.date, att.studentId, att.status]
      );
    }

    for (const msg of INITIAL_MESSAGES) {
      await pool.query(
        'INSERT INTO messages (id, "fromId", "toId", text, image, timestamp, read, kind) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING',
        [msg.id, msg.fromId, msg.toId, msg.text, msg.image ?? '', msg.timestamp, msg.read, msg.kind]
      );
    }

    await pool.query(`SELECT setval('activities_id_seq', COALESCE((SELECT MAX(id) FROM activities), 1));`);
    await pool.query(`SELECT setval('announcements_id_seq', COALESCE((SELECT MAX(id) FROM announcements), 1));`);
    await pool.query(`SELECT setval('messages_id_seq', COALESCE((SELECT MAX(id) FROM messages), 1));`);

    console.log('Database initialized with mock data successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};
