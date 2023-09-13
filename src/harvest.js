require('dotenv').config();
const axios = require('axios');

const HARVEST_API_KEY = process.env.HARVEST_API_KEY;
const HARVEST_ACCOUNT_ID = process.env.HARVEST_ACCOUNT_ID;

const harvestApiUrl = 'https://api.harvestapp.com/v2';

const axiosInstance = axios.create({
  baseURL: harvestApiUrl,
  headers: {
    'Authorization': `Bearer ${HARVEST_API_KEY}`,
    'Harvest-Account-ID': HARVEST_ACCOUNT_ID,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'Node.js Harvest API Client',
  },
});

async function testAuthentication() {
  try {
    const response = await axiosInstance.get('/users/me');
    if (response.status === 200) {
      const user = response.data;
      console.log('Harvest authenticated user: ', user);
      return true;
    } else {
      console.error('Harvest authentication failed: ', response.statusText);
      return false;
    }
  } catch (error) {
    throw error;
  }
}

async function getTimeEntries(startDate, endDate, page = 1, perPage = 2000) {
  try {
    const response = await axiosInstance.get(`/time_entries`, {
      params: {
        from: startDate,
        to: endDate,
        page: page,
        per_page: perPage,
      },
    });

    const timeEntries = response.data.time_entries;

    // If there are more pages, recursively fetch them
    if (response.data.total_pages > page) {
      const nextPageTimeEntries = await getTimeEntries(startDate, endDate, page + 1, perPage);
      return timeEntries.concat(nextPageTimeEntries);
    }

    return timeEntries;
  } catch (error) {
    throw error;
  }
}

async function getAllProjects() {
  try {
    const response = await axiosInstance.get('/projects');
    // TODO: remove temporary slice to avoid throttling errors during testing
    return response.data.projects.slice(0, 3);
  } catch (error) {
    throw error;
  }
}

async function getProjectManagers(projectId) {
  const response = await axiosInstance.get(`/projects/${projectId}/user_assignments`);
  const projectManagers = response.data.user_assignments.filter((assignment) => assignment.is_project_manager && assignment.is_active);
  return projectManagers;
}

async function getUser(userId) {
  const response = await axiosInstance.get(`/users/${userId}`);
  return response.data;
}

module.exports = {
  testAuthentication,
  getTimeEntries: getTimeEntries,
  getAllProjects,
  getProjectManagers,
  getUser,
};

