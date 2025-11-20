// Run on new Git commit: builds webpages necessary for static blog hosting
const fs = require('node:fs');
const { marked } = require('marked');

const HEADER = `<html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet">
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
            html, body {
                font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                padding: 48px;
                color: #c6d0f5;
                background: #303446;
            }

            small {
                color: #737994;
            }

            a, a * {
                color: #ea999c;
            }

            table {
                border-collapse: collapse;
                background-color: #303446;
                color: #c6d0f5;
                font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                border: 1px solid #414559;
                border-radius: 8px;
                overflow: hidden;
            }

            table th,
            table td {
                padding: 12px 16px;
                border-bottom: 1px solid #414559;
            }

            table th {
                background-color: #414559;
                color: #babbf1;
                font-weight: 600;
                text-align: left;
            }

            table tbody tr:nth-child(odd) {
                background-color: #303446;
            }

            table tbody tr:nth-child(even) {
                background-color: #414559;
            }

            table td:first-child {
                color: #8caaee;
                font-weight: 500;
            }
        </style>
    </head>
    <body>`;

const FOOTER = `
    </body>
</html>`

function buildPage(fileContent, metadata) {
    return `${HEADER}
        ${marked(fileContent)}
        <hr/>
        <br/>
        <div style="display: flex; flex-direction: row-reverse; gap: 12px; align-items: center;">
            <img 
                src="https://rana.transfemme.dev/static/pfps/${metadata.author}.png" 
                style="border-radius: 16px; width: 48px; height: auto;"
                alt="${metadata.author}'s profile picture / face claim"
            />
            <div style="text-align: right;">
                authored by<br>
                <strong>${metadata.author.split('').map((x, i) => i == 0 ? x.toUpperCase() : x.toLowerCase()).join('')} Nightfall</strong>
            </div>
        </div>
        ${metadata.ps ? `<small>P.S. ${metadata.ps}</small>` : ``}
        ${FOOTER}`.trim().split('\n').join('')
}

// List all Markdown files
const blogs = fs.readdirSync('.').filter(x => x.endsWith(".md") && x !== "README.md");

fs.mkdirSync('build')
for (const fileName of blogs) {
    const fileContents = fs.readFileSync(fileName, 'utf-8');

    const [_, rawMetadata, ...data] = fileContents.split('---\n');

    const metadata = JSON.parse(rawMetadata.trim());
    const contents = data.join('---\n');

    fs.writeFileSync('build/' + fileName.replace('.md', '.html'), buildPage(contents, metadata))
}

fs.writeFileSync('build/index.html', `
${HEADER}
${marked(fs.readFileSync('README.md', 'utf-8').replace('.md', '.html'))}
${FOOTER}
`.trim().split('\n').join(''))
