import db from './database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

const users = [
    {
        id: uuidv4(),
        name: 'Test Analyst',
        email: 'analyst@example.com',
        password_hash: bcrypt.hashSync('analyst123', saltRounds),
        role: 'analyst'
    },
    {
        id: uuidv4(),
        name: 'Test Viewer',
        email: 'viewer@example.com',
        password_hash: bcrypt.hashSync('viewer123', saltRounds),
        role: 'viewer'
    }
];

const admin = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');

if (!admin) {
    console.log('No admin user found. Run the server first to create the default admin.');
    process.exit(1);
}

const incomeCategories = ['Salary', 'Freelance', 'Investments', 'Refunds'];
const expenseCategories = ['Rent', 'Utilities', 'Groceries', 'Transportation', 'Entertainment', 'Healthcare'];

const records = [];

for (let month = 1; month <= 6; month++) {
    for (let i = 0; i < 3; i++) {
        const cat = incomeCategories[Math.floor(Math.random() * incomeCategories.length)];
        const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const monthStr = String(month).padStart(2, '0');

        records.push({
            id: uuidv4(),
            amount: Math.round((Math.random() * 50000 + 10000) * 100) / 100,
            type: 'income',
            category: cat,
            date: `2025-${monthStr}-${day}`,
            description: `${cat} payment for month ${month}`,
            created_by: admin.id
        });
    }

    for (let i = 0; i < 7; i++) {
        const cat = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
        const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
        const monthStr = String(month).padStart(2, '0');

        records.push({
            id: uuidv4(),
            amount: Math.round((Math.random() * 15000 + 500) * 100) / 100,
            type: 'expense',
            category: cat,
            date: `2025-${monthStr}-${day}`,
            description: `${cat} payment`,
            created_by: admin.id
        });
    }
}

const seedData = db.transaction(() => {
    const insertUser = db.prepare(`
        INSERT OR IGNORE INTO users (id, name, email, password_hash, role, status)
        VALUES (?, ?, ?, ?, ?, 'active')
    `);

    const insertRecord = db.prepare(`
        INSERT INTO financial_records (id, amount, type, category, date, description, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const user of users) {
        insertUser.run(user.id, user.name, user.email, user.password_hash, user.role);
    }

    for (const record of records) {
        insertRecord.run(record.id, record.amount, record.type, record.category, record.date, record.description, record.created_by);
    }
});

seedData();

console.log(`Seeded ${users.length} users and ${records.length} financial records`);