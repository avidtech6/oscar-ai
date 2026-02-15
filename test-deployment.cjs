const { chromium } = require('playwright');

async function testDeployment() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    const urls = [
        'https://w9e3srvfidn0.space.minimax.io',
        'https://w9e3srvfidn0.space.minimax.io/'
    ];
    
    for (const url of urls) {
        console.log('\n===================');
        console.log('Testing URL:', url);
        
        try {
            const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            console.log('Status:', response.status());
            
            const content = await page.content();
            console.log('Page length:', content.length);
            
            // Check if it shows Not Found
            if (content.includes('Not Found')) {
                console.log('Result: NOT FOUND');
            } else {
                console.log('Result: FOUND');
                const title = await page.title();
                console.log('Title:', title);
            }
            
        } catch (err) {
            console.error('Error:', err.message);
        }
    }
    
    await browser.close();
}

testDeployment();
