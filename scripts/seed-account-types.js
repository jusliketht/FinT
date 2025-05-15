const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const chalk = require('chalk');

/**
 * Seed Account Types
 * This script ensures all required account types exist in the database
 */

async function main() {
  console.log(chalk.blue('==== Seeding Required Account Types ===='));
  
  // Define the required account types
  const requiredTypes = [
    { value: 'asset', label: 'Asset' },
    { value: 'liability', label: 'Liability' },
    { value: 'equity', label: 'Equity' },
    { value: 'revenue', label: 'Revenue' },
    { value: 'expense', label: 'Expense' }
  ];
  
  // Get existing account types
  console.log('Checking existing account types...');
  const existingTypes = await prisma.accountType.findMany();
  const existingTypeValues = existingTypes.map(t => t.value.toLowerCase());
  
  console.log(chalk.gray(`Found existing types: ${existingTypeValues.join(', ')}`));
  
  // Find which types need to be created
  const typesToCreate = requiredTypes.filter(type => 
    !existingTypeValues.includes(type.value.toLowerCase())
  );
  
  console.log(`Types to create: ${typesToCreate.length}`);
  
  // Create missing types
  if (typesToCreate.length > 0) {
    console.log(chalk.yellow('Creating missing account types...'));
    
    for (const type of typesToCreate) {
      try {
        await prisma.accountType.create({
          data: {
            value: type.value,
            label: type.label
          }
        });
        console.log(chalk.green(`✓ Created ${type.label} (${type.value})`));
      } catch (error) {
        console.error(chalk.red(`✗ Error creating ${type.label}: ${error.message}`));
      }
    }
  } else {
    console.log(chalk.green('✓ All required account types already exist'));
  }
  
  // Verify all types now exist
  const finalTypes = await prisma.accountType.findMany();
  console.log(chalk.blue('\n==== Account Types Summary ===='));
  finalTypes.forEach(type => {
    console.log(chalk.gray(`- ${type.label} (${type.value})`));
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