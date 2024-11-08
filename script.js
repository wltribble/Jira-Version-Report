document.addEventListener('DOMContentLoaded', fetchUnreleasedVersions);

const jiraDomain = 'https://your-domain.atlassian.net'; // Replace with your Jira domain
const apiToken = 'YOUR_API_TOKEN'; // Replace with your API token
const email = 'YOUR_EMAIL'; // Replace with your Jira email

const headers = new Headers();
headers.append('Authorization', 'Basic ' + btoa(email + ':' + apiToken));
headers.append('Content-Type', 'application/json');

// Fetch unreleased versions
async function fetchUnreleasedVersions() {
    const versionsEndpoint = `${jiraDomain}/rest/api/3/project/YOUR_PROJECT_KEY/version`; // Replace with your project key

    try {
        const response = await fetch(versionsEndpoint, { headers });
        const versions = await response.json();

        const unreleasedVersions = versions.filter(version => !version.released);
        displayVersions(unreleasedVersions);
    } catch (error) {
        console.error('Error fetching versions:', error);
    }
}

// Display versions in a clickable list
function displayVersions(versions) {
    const versionList = document.getElementById('versionList');
    versionList.innerHTML = '';

    versions.forEach(version => {
        const listItem = document.createElement('li');
        listItem.textContent = version.name;
        listItem.onclick = () => generateReport(version.name);
        versionList.appendChild(listItem);
    });
}

// Generate report for a selected version
async function generateReport(versionName) {
    const issuesEndpoint = `${jiraDomain}/rest/api/3/search?jql=fixVersion="${versionName}"&fields=status,customfield_10004`; // customfield_10004 is an example for Story Points

    try {
        const response = await fetch(issuesEndpoint, { headers });
        const data = await response.json();

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
        console.error('Error fetching data:', error);
    }
}

// Render the chart
function renderChart(totalIssues, completedIssues, totalPoints, completedPoints) {
    const ctx = document.getElementById('versionReportChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Total Issues', 'Completed Issues', 'Total Points', 'Completed Points'],
            datasets: [{
                label: 'Version Report',
                data: [totalIssues, completedIssues, totalPoints, completedPoints],
                backgroundColor: ['rgba(75, 192, 192, 0.2)'],
                borderColor: ['rgba(75, 192, 192, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
