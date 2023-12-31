const harvest = require('./harvest');
const smartsheet = require('./smartsheet');
const dataOperations = require('./dataOperations');

async function testHarvestAndSmartsheetAuthentication() {
  return (harvest.testAuthentication() && smartsheet.testAuthentication()) ? true : false;
}

async function importHarvestTimeEntriesToLocalCSV(startDate, endDate, folderId, sheetName) {
  const filePath = './output/Harvest-Time-Entries.csv';

  try {
    // Retrieve time entries from Harvest
    const timeEntries = await harvest.getTimeEntries(startDate, endDate);

    // Save time entries to a CSV file
    await dataOperations.saveTimeEntriesToCSV(timeEntries, filePath);

    // If all steps are successful, resolve the Promise with a success message
    return 'Import completed successfully';
  } catch (error) {
    // If an error occurs at any step, reject the Promise with an error message
    throw error;
  }
}

async function importHarvestProjectsToSmartsheets(folderId, sheetName) {
  const filePath = './output/projects.csv';
  
  try {
    // Get all projects from Harvest
    const projects = await harvest.getAllProjects();

    // Attach PM data to projects
    const projectsWithPMData = await dataOperations.enhanceProjectsWithManagers(projects);

    // Save projects to a CSV file
    await dataOperations.saveProjectsToCSV(projectsWithPMData, filePath);

    // Import the CSV data to Smartsheet
    await smartsheet.importDataToSmartsheetCSV(folderId, sheetName, filePath);

    // If all steps are successful, resolve the Promise with a success message
    return 'Import completed successfully';
  } catch (error) {
    // If an error occurs at any step, reject the Promise with an error message
    throw error;
  }
}

async function importHarvestUsersToLocalCSV() {
  const filePath = './output/users.csv';
  
  try {
    // Get all users from Harvest
    const users = await harvest.getAllUsers();

    // Attach last time entry date to users
    const usersWithTimeData = await dataOperations.enhanceUsersWithTimeData(users);

    // Save projects to a CSV file
    await dataOperations.saveUsersToCSV(usersWithTimeData, filePath);

    // If all steps are successful, resolve the Promise with a success message
    return 'Import completed successfully';
  } catch (error) {
    // If an error occurs at any step, reject the Promise with an error message
    throw error;
  }
}

module.exports = {
  testHarvestAndSmartsheetAuthentication,
  importHarvestTimeEntriesToLocalCSV,
  importHarvestProjectsToSmartsheets,
  importHarvestUsersToLocalCSV
};