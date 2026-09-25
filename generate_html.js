const fs = require('fs');
const { marked } = require('marked');

const md = fs.readFileSync('presentation_outline.md', 'utf8');
const html = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { 
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
    max-width: 900px; 
    margin: 0 auto; 
    padding: 40px; 
    color: #333;
    line-height: 1.6;
  }
  img { 
    max-width: 100%; 
    border-radius: 12px; 
    box-shadow: 0 8px 16px rgba(0,0,0,0.15); 
    margin: 30px 0; 
  }
  h1 { color: #1e3a8a; font-size: 2.5rem; margin-bottom: 0.5rem; }
  h2 { color: #2563eb; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-top: 50px; }
  h3 { color: #3b82f6; }
  ul { padding-left: 20px; }
  li { margin-bottom: 8px; }
  hr { margin: 60px 0; border: none; border-top: 2px dashed #cbd5e1; }
  
  @media print {
    body { padding: 0; }
    hr { page-break-after: always; border: none; margin: 0; }
    h2 { margin-top: 20px; }
    img { max-height: 500px; object-fit: contain; }
  }
</style>
</head>
<body>
${marked.parse(md)}
</body>
</html>
`;
fs.writeFileSync('presentation_outline.html', html);
console.log('Successfully created HTML presentation');
