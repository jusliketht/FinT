const { Client } = require('pg');
require('dotenv').config();

// First connect to default 'postgres' database to check if our target DB exists
const checkDBConnection = async () => {
  // Hard-coded default connection for initial checks
  const mainClient = new Client({
    connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres',
    ssl: false
  });

  try {
    await mainClient.connect();
    console.log('Connected to default PostgreSQL database');
    
    // Check if fint_db exists
    const res = await mainClient.query(`
      SELECT 1 FROM pg_database WHERE datname = 'fint_db'
    `);
    
    if (res.rowCount === 0) {
      console.log('Database fint_db does not exist, creating...');
      await mainClient.query(`CREATE DATABASE fint_db`);
      console.log('Database fint_db created successfully');
    } else {
      console.log('Database fint_db already exists');
    }
    
    await mainClient.end();
    
    // Now connect to the target database
    // Use hardcoded connection string for testing since .env might not be loading correctly
    const connectionString = "postgresql://postgres:postgres@localhost:5432/fint_db";
    console.log('Trying to connect with:', connectionString);
    
    const targetClient = new Client({
      connectionString,
      ssl: false
    });
    
    await targetClient.connect();
    console.log('Successfully connected to fint_db');
    
    const timeResult = await targetClient.query('SELECT NOW()');
    console.log('Database is responsive:', timeResult.rows[0].now);
    
    await targetClient.end();
    
    return true;
  } catch (err) {
    console.error('Database connection error:', err);
    return false;
  }
};

checkDBConnection()
  .then(success => {
    if (success) {
      console.log('Database check completed successfully');
      process.exit(0);
    } else {
      console.error('Database check failed');
      process.exit(1);
    }
  }); 