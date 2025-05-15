const fs = require('fs');
const path = require('path');
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

async function setupEnvironment() {
  console.log("Setting up environment variables...\n");

  // Default configuration
  const defaultConfig = {
    PORT: "5000",
    NODE_ENV: "development",
    DATABASE_URL: "postgresql://username:password@localhost:5432/fint_db?schema=public",
    REACT_APP_API_URL: "http://localhost:5000",
    REACT_APP_ENV: "development"
  };

  // Get user input for critical variables
  const dbUrl = await question(
    "Enter your database URL (or press enter for default): "
  );

  // Combine defaults with user input
  const config = {
    ...defaultConfig,
    ...(dbUrl && { DATABASE_URL: dbUrl })
  };

  // Create .env file content
  const envContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  // Write to .env file
  try {
    fs.writeFileSync(path.join(__dirname, "../.env"), envContent);
    console.log("\nEnvironment file (.env) has been created successfully!");

    // Create a copy for development if needed
    if (!fs.existsSync(path.join(__dirname, "../.env.development"))) {
      fs.writeFileSync(path.join(__dirname, "../.env.development"), envContent);
      console.log("Development environment file (.env.development) has been created.");
    }

    console.log("\nNext steps:");
    console.log("1. Review the .env file and adjust values as needed");
    console.log("2. Make sure your database is running and accessible");
    console.log("3. Run `npm install` if you haven't already");
    console.log("4. Run `npx prisma migrate dev` to set up the database");
    console.log("5. Start the application with `npm run dev`\n");
  } catch (error) {
    console.error("Error creating environment files:", error);
  }

  rl.close();
}

setupEnvironment().catch(console.error);
