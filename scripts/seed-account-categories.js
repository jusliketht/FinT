const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const chalk = require('chalk');

/**
 * Seed Account Categories
 * This script ensures all required account categories exist in the database
 */

async function main() {
  console.log(chalk.blue('==== Seeding Required Account Categories ===='));
  
  // Define the required account categories
  const requiredCategories = [
    { name: 'Asset', description: 'Assets' },
    { name: 'Liability', description: 'Liabilities' },
    { name: 'Equity', description: 'Equity' },
    { name: 'Revenue', description: 'Revenue' },
    { name: 'Expense', description: 'Expenses' }
  ];
  
  // Get existing account categories
  console.log('Checking existing account categories...');
  const existingCategories = await prisma.accountCategory.findMany();
  const existingCategoryNames = existingCategories.map(c => c.name.toLowerCase());
  
  console.log(chalk.gray(`Found existing categories: ${existingCategoryNames.join(', ')}`));
  
  // Find which categories need to be created
  const categoriesToCreate = requiredCategories.filter(cat => 
    !existingCategoryNames.includes(cat.name.toLowerCase())
  );
  
  console.log(`Categories to create: ${categoriesToCreate.length}`);
  
  // Create missing categories
  if (categoriesToCreate.length > 0) {
    console.log(chalk.yellow('Creating missing account categories...'));
    
    for (const category of categoriesToCreate) {
      try {
        await prisma.accountCategory.create({
          data: {
            name: category.name,
            description: category.description
          }
        });
        console.log(chalk.green(`✓ Created ${category.name}`));
      } catch (error) {
        console.error(chalk.red(`✗ Error creating ${category.name}: ${error.message}`));
      }
    }
  } else {
    console.log(chalk.green('✓ All required account categories already exist'));
  }
  
  // Verify all categories now exist
  const finalCategories = await prisma.accountCategory.findMany();
  console.log(chalk.blue('\n==== Account Categories Summary ===='));
  finalCategories.forEach(cat => {
    console.log(chalk.gray(`- ${cat.name}`));
  });
}

main()
  .catch((e) => {
    console.error('Error running script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 