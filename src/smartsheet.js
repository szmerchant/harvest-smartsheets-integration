require('dotenv').config();
const fs = require('fs');
const readline = require('readline');
const client = require('smartsheet');

const SMARTSHEET_API_KEY = process.env.SMARTSHEET_API_KEY;

const smartsheet = client.createClient({
  accessToken: SMARTSHEET_API_KEY,
  logLevel: 'info',
});

async function testAuthentication() {
  try {
    // Call the GetCurrentUser endpoint to test authentication
    const user = await smartsheet.users.getCurrentUser();

    // If authentication is successful, this will return user information
    console.log('Smartsheets authenticated user: ', user);

  } catch (error) {
    console.error('Smartsheets authentication failed: ', error.message);
  }
}

async function importDataToSmartsheetCSV(folderId, sheetName, filePath) {
  const options = {
    folderId,
    queryParameters: { sheetName, headerRowIndex: 0 },
    path: filePath,
  };

  try {
    const attachment = await smartsheet.sheets.importCsvSheetIntoFolder(options);
    console.log(attachment);
  } catch (error) {
    console.error(error);
  }
}

// Note: when using this function, ensure multiline cells in csv file are formatted correctly
// Hint: i=0;cat time_entries.csv|while read l;do i=$((($(echo $l|tr -cd '"'|wc -c)+$i)%2));[[ $i = 1 ]] && echo -n "$l " || echo "$l";done >new.csv
async function importDataToSmartsheetBatch(folderId, sheetName, filePath) {
  try {
    // Define the batch size (e.g., 2000 rows per batch)
    const batchSize = 2000;

    // Define a regular expression to split on commas outside of double quotes
    const delimiter = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;

    // Read the CSV file line by line
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    // Read the first line (header) to get column names
    const headerLine = await rl[Symbol.asyncIterator]().next();
    const columnNames = headerLine.value.split(','); // Assuming CSV format

    // Create an array of column objects based on the column names
    const columns = columnNames.map((columnName, index) => ({
      title: columnName,
      type: 'TEXT_NUMBER', // You can adjust the type as needed
      primary: index === 0, // Set the primary property for the first column
    }));

    // Create a new sheet in the specified folder
    var sheetConfig = {
      "name": sheetName,
      "columns": columns
    };
    
    const newSheet = await smartsheet.sheets.createSheetInFolder({
      folderId,
      body: sheetConfig,
    });
    console.log(`Created new sheet ${sheetName} (ID: ${sheetId})`);

    const sheetId = newSheet.result.id;
    const smartsheetColumns = newSheet.result.columns;
    
    // Create an array to hold batch data
    let batchData = [];

    // Read the remaining lines (data) and add rows to the sheet
    for await (const line of rl) {
      const rowValues = line.split(delimiter); // Adjust delimiter as needed

      // Create a new Row object for each row of data
      const row = {
        toBottom: true, // Add rows to the top of the sheet
        cells: rowValues.map((value, index) => ({
          columnId: smartsheetColumns[index].id, // Use the actual column ID
          value: value,
        })),
      };

      batchData.push(row);

      if (batchData.length >= batchSize) {
        await updateSheet(sheetId, batchData);
        batchData = [];
      }
    }

    if (batchData.length > 0) {
      await updateSheet(sheetId, batchData);
    }

    console.log(`Imported data into sheet ${sheetName} (ID: ${sheetId})`);
  } catch (error) {
    console.error(error);
  }
}

async function updateSheet(sheetId, data) {
  try {
    await smartsheet.sheets.addRows({ sheetId, body: data });
    console.log(`Added ${data.length} rows to sheet ${sheetId}`);
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  testAuthentication,
  importDataToSmartsheetCSV,
  importDataToSmartsheetBatch
};
