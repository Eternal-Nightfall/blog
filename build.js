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

            @media (max-width: 768px) {
                html, body {
                    padding: 36px; /* tablet */
                }
            }

            @media (max-width: 480px) {
                html, body {
                    padding: 24px; /* mobile */
                }
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
        {META_TAGS}
    </head>
    <body>`;

const FOOTER = `
    </body>
</html>`

function buildPage(fileContent, metadata, permalink) {
    const META_TAGS = `
<meta property="og:title" content="${metadata.title}" />
<meta property="og:description" content="${metadata.summary}" />
<meta property="og:url" content="${permalink}" />
<meta property="og:type" content="article" />
<meta property="article:published_time" content="${metadata.date}" />
<meta property="article:author" content="${metadata.author.split('').map((x, i) => i == 0 ? x.toUpperCase() : x.toLowerCase()).join('')} Nightfall" />
<meta property="og:site_name" content="Nightfall's Blog" />
<meta name="theme-color" content="#ea999c" />
    `.trim()

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
        ${FOOTER}`.trim().split('\n').map(x => x.trim()).join('').replace('{META_TAGS}', META_TAGS);
}

// List all Markdown files
const blogs = fs.readdirSync('.').filter(x => x.endsWith(".md") && x !== "README.md");

try {
    fs.mkdirSync('build')
} catch (_) {}

const posts = [];

for (const fileName of blogs) {
    const fileContents = fs.readFileSync(fileName, 'utf-8');

    const [_, rawMetadata, ...data] = fileContents.split('---\n');

    const metadata = JSON.parse(rawMetadata.trim());
    const contents = data.join('---\n');

    fs.writeFileSync('build/' + fileName.replace('.md', '.html'), buildPage(contents, metadata, `https://eternal-nightfall.github.io/blog/${fileName.replace('.md', '.html')}`))

    posts.push({
        title: metadata.title,
        path: fileName.replace('.md', '.html'),
        time: new Date(metadata.date),
        author: metadata.author,
        summary: metadata.summary
    })
}

fs.writeFileSync('build/index.html', `
${HEADER.replace('{META_TAGS}', `<meta property="og:title" content="Home" />
<meta property="og:description" content="The Nightfall system's blog!" />
<meta property="og:url" content="https://eternal-nightfall.github.io/blog" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Nightfall's Blog" />
<meta name="theme-color" content="#ea999c" />`)}
${marked(fs.readFileSync('README.md', 'utf-8').replace('.md', '.html'))}
${FOOTER}
`.trim().split('\n').map(x => x.trim()).join(''))

fs.writeFileSync('build/feed.xml', `
<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Nightfall's Blog</title>
    <link>https://eternal-nightfall.github.io/blog</link>
    <description>The Nightfall system's blog!</description>
    ${posts.map(post => `
        <item>
            <title><![CDATA[${post.title}]]></title>
            <link>https://eternal-nightfall.github.io/blog/${post.path}</link>
            <pubDate>${post.time.toUTCString()}</pubDate>
            <author><![CDATA[${post.author.split('').map((x, i) => i == 0 ? x.toUpperCase() : x.toLowerCase()).join('')} Nightfall]]></author>
            <description><![CDATA[${post.summary}]]></description>
        </item>
    `)}
  </channel>
</rss>
`.trim().split('\n').map(x => x.trim()).join(''))