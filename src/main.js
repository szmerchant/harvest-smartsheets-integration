require('dotenv').config();
const services = require('./services');

const HARVEST_TEST_FOLDER_ID = process.env.HARVEST_TEST_FOLDER_ID;

async function main() {
  const folderId = HARVEST_TEST_FOLDER_ID;
  const sheetName = 'TestImport';

  // Uncomment below to test Harvest time entry sheet generation
  // const startDate = '2023-01-01';
  // const endDate = '2023-12-31';
  // services.importHarvestTimeEntriesToSmartsheets(startDate, endDate, folderId, sheetName)

  // Uncomment below to test Harvest project sheet generation
  // services.importHarvestProjectsToSmartsheets(folderId, sheetName)

  // Uncomment below to test Harvest and Smartsheet API authentication
  services.testHarvestAndSmartsheetAuthentication();
}

main().catch((error) => {
  console.error('An error occurred:', error);
});
