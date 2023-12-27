require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const services = require('./services');

app.get('/integration/auth_status', async (req, res) => {
  try {
    const authStatus = await services.testHarvestAndSmartsheetAuthentication();
    const resultMessage = 'Harvest and Smartsheet API Authentication Status: ' + authStatus;
    res.status(200).json({ message: resultMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Import failed. Check server logs for details.' });
  }
});

app.get('/integration/time_entries', async (req, res) => {
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;
  const folderId = req.query.folderId;
  const sheetName = req.query.sheetName;

  try {
    const resultMessage = await services.importHarvestTimeEntriesToLocalCSV(startDate, endDate, folderId, sheetName);
    res.status(200).json({ message: resultMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Import failed. Check server logs for details.' });
  }
});

app.get('/integration/projects', async (req, res) => {
  const folderId = req.query.folderId;
  const sheetName = req.query.sheetName;

  try {
    const resultMessage = await services.importHarvestProjectsToSmartsheets(folderId, sheetName);
    res.status(200).json({ message: resultMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Import failed. Check server logs for details.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});