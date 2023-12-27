const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const mkdirp = require('mkdirp');
const harvest = require('./harvest');

async function enhanceProjectsWithManagers(projects) {
  // Iterate through projects and enhance them with manager information
  for (const project of projects) {
    const projectManagers = await harvest.getProjectManagers(project.id);

    // Initialize the fields with null values
    project['project_manager_1'] = { name: null, email: null };
    project['project_manager_2'] = { name: null, email: null };

    if (projectManagers.length >= 1) {
      project['project_manager_1'].name = projectManagers[0].user.name;
      const userId = projectManagers[0].user.id;
      // Fetch the email for the first project manager
      const userResponse = await harvest.getUser(userId);
      project['project_manager_1'].email = userResponse.email;
    }

    if (projectManagers.length >= 2) {
      project['project_manager_2'].name = projectManagers[1].user.name;
      const userId = projectManagers[1].user.id;
      // Fetch the email for the second project manager
      const userResponse = await harvest.getUser(userId);
      project['project_manager_2'].email = userResponse.email;
    }
  }

  return projects;
}

async function enhanceUsersWithTimeData(users) {
  // TODO: Iterate through users and enhance them with latest time entry date
  for (const user of users) {
    const latestTimeEntryDate = await harvest.getLatestTimeEntryByUser(user.id);
    user['last_time_entry_date'] = latestTimeEntryDate;
  }

  return users;
}

async function saveTimeEntriesToCSV(timeEntries, filePath) {
  // Ensure that the directory structure leading to the file path exists
  mkdirp.sync(filePath.substring(0, filePath.lastIndexOf('/')));

  // Flatten the nested objects within each time entry
  const flattenedTimeEntries = timeEntries.map((entry) => {
    return {
      'ID': entry.id,
      'Spent Date': entry.spent_date,
      'Hours': entry.hours,
      'Notes': entry.notes,
      'Is Locked': entry.is_locked,
      'Locked Reason': entry.locked_reason,
      'Is Closed': entry.is_closed,
      'Billable': entry.billable,
      'Budgeted': entry.budgeted,
      'Billable Rate': entry.billable_rate,
      'Cost Rate': entry.cost_rate,
      'Updated At': entry.updated_at,
      'User ID': entry.user.id,
      'User Name': entry.user.name,
      'Client Name': entry.client.name,
      'Project Name': entry.project.name,
      'Task Name': entry.task.name
    };
  });

  // Create a writable stream and write the CSV data to the file
  const csvWriter = createCsvWriter({
    path: filePath,
    header: Object.keys(flattenedTimeEntries[0]).map((key) => ({ id: key, title: key })),
  });

  try {
    await csvWriter.writeRecords(flattenedTimeEntries);
    console.log('CSV file has been written successfully.');
  } catch (error) {
    throw error;
  }
}

async function saveProjectsToCSV(projects, filePath) {
  // Ensure that the directory structure leading to the file path exists
  mkdirp.sync(filePath.substring(0, filePath.lastIndexOf('/')));

  // Flatten the nested objects within each project
  const flattenedProjects = projects.map((project) => {
    return {
      'ID': project.id,
      'Name': project.name,
      'Client ID': project.client.id,
      'Client Name': project.client.name,
      'Is Active': project.is_active,
      'Code': project.code,
      'Budget By': project.budget_by,
      'Is Billable': projects.is_billable,
      'Is Fixed Fee':projects.is_fixed_fee,
      'Bill By': projects.bill_by,
      'Budget': project.budget,
      'Budget Spent': project.budget_spent,
      'Budget Burn Rate': project.budget_burn_rate,
      'Budget Burn Rate Per Day': project.budget_burn_rate_per_day,
      'Budget Burn Rate Per Week': project.budget_burn_rate_per_week,
      'Cost Budget': project.cost_budget,
      'Cost Budget Include Expenses': project.cost_budget_include_expenses,
      'Cost Budget Include Hours': project.cost_budget_include_hours,
      'Notify When Over Budget': project.notify_when_over_budget,
      'Over Budget Notification Percentage': project.over_budget_notification_percentage,
      'Over Budget Notification Date': project.over_budget_notification_date,
      'Show Budget To All': project.show_budget_to_all,
      'Created At': project.created_at,
      'Updated At': project.updated_at,
      'PM 1 Name': project.project_manager_1.name,
      'PM 1 Email': project.project_manager_1.email,
      'PM 2 Name': project.project_manager_2.name,
      'PM 2 Email': project.project_manager_2.email
      // Add more fields as needed
    };
  });

  // Create a writable stream and write the CSV data to the file
  const csvWriter = createCsvWriter({
    path: filePath,
    header: Object.keys(flattenedProjects[0]).map((key) => ({ id: key, title: key })),
  });

  try {
    await csvWriter.writeRecords(flattenedProjects);
    console.log('Projects have been saved to CSV successfully.');
  } catch (error) {
    throw error;
  }
}

async function saveUsersToCSV(users, filePath) {
  // Ensure that the directory structure leading to the file path exists
  mkdirp.sync(filePath.substring(0, filePath.lastIndexOf('/')));

  // Flatten the nested objects within each user
  const flattenedUsers = users.map((user) => {
    return {
      'ID': user.id,
      'First Name': user.first_name,
      'Last Name': user.last_name,
      'Email': user.email,
      'Telephone': user.telephone,
      'Timezone': user.timezone,
      'Has Access To All Future Projects': user.has_access_to_all_future_projects,
      'Can Create Projects': user.can_create_projects,
      'Is Contractor': user.is_contractor,
      'Is Active': user.is_active,
      'Weekly Capacity': user.weekly_capacity,
      'Default Hourly Rate': user.default_hourly_rate,
      'Cost Rate': user.cost_rate,
      'Roles': user.roles,
      'Access Roles': user.access_roles,
      'Permissions Claims': user.permissions_claims,
      'Created At': user.created_at,
      'Updated At': user.updated_at,
      'Last Time Entry Date': user.last_time_entry_date
    };
  });

  // Create a writable stream and write the CSV data to the file
  const csvWriter = createCsvWriter({
    path: filePath,
    header: Object.keys(flattenedUsers[0]).map((key) => ({ id: key, title: key })),
  });

  try {
    await csvWriter.writeRecords(flattenedUsers);
    console.log('Users have been saved to CSV successfully.');
  } catch (error) {
    throw error;
  }
}

module.exports = {
  saveTimeEntriesToCSV,
  saveProjectsToCSV,
  saveUsersToCSV,
  enhanceProjectsWithManagers,
  enhanceUsersWithTimeData
};