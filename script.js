async function generateReport() {
    // const versionName = document.getElementById('versionName').value;
    const versionName = '10003';
    if (!versionName) {
        alert('Please enter a version name.');
        return;
    }

    const jiraDomain = 'https://your-domain.atlassian.net'; // Replace with your Jira domain
    const apiToken = 'ATATT3xFfGF0r-0pLL7hHtgR2mqiA-FEzBVldrnXgoVozbtI11F7FvfGQxJvXGxraNhZO5PiZE5wDfk9JuNT3cqC6pHcpw6wmV-em9A-723IIE3Ep8Q_gCS_67zGCWY1munCEOv2PKSrmfLx0GuLeVO8yFAX96MRL5eReWB8wOoQ79aPGjUmi4Q=D10C6427'; // Replace with your API token
    const email = 'wtribble@wharton.upenn.edu'; // Replace with your email associated with the Jira account

    const headers = new Headers();
    headers.append('Authorization', 'Basic ' + btoa(email + ':' + apiToken));
    headers.append('Content-Type', 'application/json');

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
