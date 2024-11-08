document.addEventListener('DOMContentLoaded', fetchUnreleasedVersions);

const jiraDomain = 'https://syncrocal.atlassian.net'; // Replace with your Jira domain
const email =  process.env.MY_EMAIL;
const apiToken = process.env.JIRA_API_KEY;

const headers = new Headers();
headers.append('Authorization', 'Basic ' + btoa(email + ':' + apiToken));
headers.append('Content-Type', 'application/json');

// Function to log messages to the console log area in HTML
function logToPage(message) {
    const logArea = document.getElementById('consoleLog');
    logArea.textContent += message + '\n'; // Append the message to the log area
}

// Modified fetchUnreleasedVersions function with logging to the page console
async function fetchUnreleasedVersions() {
    const versionsEndpoint = `${jiraDomain}/rest/api/3/project/YOUR_PROJECT_KEY/version`;

    try {
        const response = await fetch(versionsEndpoint, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const versions = await response.json();
        logToPage('Fetched versions successfully');
        console.log(versions); // Logs to browser console
        logToPage(JSON.stringify(versions, null, 2)); // Logs to page console

        const unreleasedVersions = versions.filter(version => !version.released);
        displayVersions(unreleasedVersions);
    } catch (error) {
        console.error('Error fetching versions:', error); // Logs to browser console
        logToPage('Error fetching versions: ' + error.message); // Logs to page console
    }
}

// Example usage of logToPage in generateReport
async function generateReport(versionName) {
    logToPage(`Generating report for version: ${versionName}`);
    const issuesEndpoint = `${jiraDomain}/rest/api/3/search?jql=fixVersion="${versionName}"&fields=status,customfield_10004`;

    try {
        const response = await fetch(issuesEndpoint, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        logToPage('Fetched issues data successfully');
        logToPage(JSON.stringify(data, null, 2)); // Logs issues data

        const totalIssues = data.issues.length;
        let completedIssues = 0;
        let totalPoints = 0;
        let completedPoints = 0;

        data.issues.forEach(issue => {
            const status = issue.fields.status.name;
            const points = issue.fields.customfield_10004 || 0;

            totalPoints += points;
            if (status === 'Done') {
                completedIssues++;
                completedPoints += points;
            }
        });

        renderChart(totalIssues, completedIssues, totalPoints, completedPoints);
    } catch (error) {
        console.error('Error fetching data:', error); // Logs to browser console
        logToPage('Error fetching data: ' + error.message); // Logs to page console
    }
}
