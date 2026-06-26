const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDB() {
  const connectionParams = {
    host:     process.env.DB_HOST || 'localhost',
    port:     process.env.DB_PORT || 3307,
    user:     process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };

  console.log(`Connecting to MySQL at ${connectionParams.host}:${connectionParams.port} as ${connectionParams.user}...`);

  let connection;
  try {
    connection = await mysql.createConnection(connectionParams);
  } catch (err) {
    console.error(' Connection failed! Please make sure your MySQL service is running and credentials in .env are correct.');
    console.error('Error details:', err.message);
    process.exit(1);
  }

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    console.log(`Reading schema.sql from ${schemaPath}...`);
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Split schemaSql into individual statements
    // We need to be careful with statement boundaries. A simple split by ';' works for standard schemas,
    // but we need to watch out for trigger/delimiter definitions if any.
    // In our schema.sql, there are no special DELIMITER blocks, so splitting by ';' works fine.
    const statements = schemaSql
      .split(/;\s*$/m)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await connection.query(statement);
      } catch (sqlErr) {
        // Suppress "Database exists" warnings or similar if appropriate, but print other errors
        if (!statement.toLowerCase().startsWith('create database') && !statement.toLowerCase().startsWith('use')) {
          console.warn(` Warning executing statement ${i + 1}: ${sqlErr.message}`);
        } else {
          console.log(`Executed: ${statement.substring(0, 50)}...`);
        }
      }
    }

    console.log(' Database initialized successfully!');
  } catch (err) {
    console.error(' Database initialization failed:', err);
  } finally {
    await connection.end();
  }
}

initDB();
