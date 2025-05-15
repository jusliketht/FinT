import accountTypeService from './accountTypeService';
import accountCategoryService from './accountCategoryService';
import accountService from './accountService';
import journalEntryService from './journalEntryService';
import ledgerService from './ledgerService';

/**
 * Test all service connections to backend
 * @returns {Promise<Object>} - Results of connection tests
 */
export async function testAllConnections() {
  const results = {
    accountTypes: { success: false, data: null, error: null },
    accountCategories: { success: false, data: null, error: null },
    accounts: { success: false, data: null, error: null },
    journalEntries: { success: false, data: null, error: null },
    ledger: { success: false, data: null, error: null }
  };

  // Test account types connection
  try {
    const accountTypes = await accountTypeService.getAll();
    results.accountTypes = { 
      success: true, 
      data: accountTypes, 
      error: null 
    };
    console.log('✅ Account Types API connected successfully', accountTypes);
  } catch (error) {
    results.accountTypes = { 
      success: false, 
      data: null, 
      error: error.message || 'Failed to connect to Account Types API'
    };
    console.error('❌ Account Types API connection failed', error);
  }

  // Test account categories connection
  try {
    const accountCategories = await accountCategoryService.getAll();
    results.accountCategories = { 
      success: true, 
      data: accountCategories, 
      error: null 
    };
    console.log('✅ Account Categories API connected successfully', accountCategories);
  } catch (error) {
    results.accountCategories = { 
      success: false, 
      data: null, 
      error: error.message || 'Failed to connect to Account Categories API'
    };
    console.error('❌ Account Categories API connection failed', error);
  }

  // Test accounts connection
  try {
    const accounts = await accountService.getAll();
    results.accounts = { 
      success: true, 
      data: accounts, 
      error: null 
    };
    console.log('✅ Accounts API connected successfully', accounts);
  } catch (error) {
    results.accounts = { 
      success: false, 
      data: null, 
      error: error.message || 'Failed to connect to Accounts API'
    };
    console.error('❌ Accounts API connection failed', error);
  }

  // Test journal entries connection 
  try {
    const journalEntries = await journalEntryService.getAll();
    results.journalEntries = { 
      success: true, 
      data: journalEntries, 
      error: null 
    };
    console.log('✅ Journal Entries API connected successfully', journalEntries);
  } catch (error) {
    results.journalEntries = { 
      success: false, 
      data: null, 
      error: error.message || 'Failed to connect to Journal Entries API'
    };
    console.error('❌ Journal Entries API connection failed', error);
  }

  return results;
}

export default testAllConnections; 