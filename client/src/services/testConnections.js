import api from './api';
import accountService from './accountService';
import accountCategoryService from './accountCategoryService';
import accountTypeService from './accountTypeService';
// import ledgerService from './ledgerService';

/**
 * Test all service connections to backend
 * @returns {Promise<Object>} - Results of connection tests
 */
export const testAllConnections = async () => {
  const results = {
    api: false,
    accounts: false,
    categories: false,
    types: false,
    // ledgers: false
  };

  try {
    // Test basic API connection
    await api.get('/users/check');
    results.api = true;
  } catch (error) {
    console.error('API connection failed:', error);
  }

  try {
    // Test accounts service
    await accountService.getAllAccounts();
    results.accounts = true;
  } catch (error) {
    console.error('Accounts service failed:', error);
  }

  try {
    // Test categories service
    await accountCategoryService.getAllCategories();
    results.categories = true;
  } catch (error) {
    console.error('Categories service failed:', error);
  }

  try {
    // Test types service
    await accountTypeService.getAllTypes();
    results.types = true;
  } catch (error) {
    console.error('Types service failed:', error);
  }

  // try {
  //   // Test ledgers service
  //   await ledgerService.getTrialBalance();
  //   results.ledgers = true;
  // } catch (error) {
  //   console.error('Ledgers service failed:', error);
  // }

  return results;
};

export default testAllConnections; 