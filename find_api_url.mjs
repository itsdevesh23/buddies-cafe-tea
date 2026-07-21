async function findApiUrl() {
  const html = await fetch('https://danjoteas.com').then(r => r.text());
  const scriptRegex = /<script[^>]+src="([^">]+)"/g;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    const src = match[1];
    if (src.endsWith('.js')) {
      const jsUrl = new URL(src, 'https://danjoteas.com').href;
      const jsContent = await fetch(jsUrl).then(r => r.text());
      const apiUrlMatch = jsContent.match(/https?:\/\/[a-zA-Z0-9.-]+(?:render\.com|railway\.app|herokuapp\.com|danjoteas\.com)/);
      if (apiUrlMatch) {
        console.log('Found API URL:', apiUrlMatch[0]);
      }
    }
  }
}
findApiUrl();
