const harvest = require('./harvest');
const smartsheet = require('./smartsheet');
const dataOperations = require('./dataOperations');

async function testHarvestAndSmartsheetAuthentication() {
  harvest.testAuthentication();
  smartsheet.testAuthentication();
}

async function importHarvestTimeEntriesToSmartsheets(startDate, endDate, folderId, sheetName) {
  const filePath = './output/time_entries.csv';

  // Retrieve time entries from Harvest
  const timeEntries = await harvest.getTimeEntries(startDate, endDate);

  // Save time entries to a CSV file
  await dataOperations.saveTimeEntriesToCSV(timeEntries, filePath);

  // Import the CSV data to Smartsheet
  await smartsheet.importDataToSmartsheetCSV(folderId, sheetName, filePath);
}

async function importHarvestProjectsToSmartsheets(folderId, sheetName) {
  const filePath = './output/projects.csv';
  
  // Get all projects from Harvest
  const projects = await harvest.getAllProjects();

  // Attach PM data to projects
  const projectsWithPMData = await dataOperations.enhanceProjectsWithManagers(projects);

  // Save projects to a CSV file
  await dataOperations.saveProjectsToCSV(projectsWithPMData, './output/projects.csv');

  // Import the CSV data to Smartsheet
  await smartsheet.importDataToSmartsheetCSV(folderId, sheetName, filePath);
}

module.exports = {
  testHarvestAndSmartsheetAuthentication,
  importHarvestTimeEntriesToSmartsheets,
  importHarvestProjectsToSmartsheets, 
};