const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<style>
  body {
    margin: 0;
    padding: 0;
    width: 1920px;
    height: 1080px;
    background: #e8e8ed; /* Light gray background matching reference */
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
  }
  .scene {
    width: 2800px;
    height: 2800px;
    display: flex;
    justify-content: center;
    align-items: center;
    transform: rotate(-12deg) scale(1.05); /* Tilted like the reference */
  }
  .masonry {
    display: flex;
    gap: 50px;
    align-items: flex-start;
  }
  .column {
    display: flex;
    flex-direction: column;
    gap: 50px;
    width: 500px;
  }
  /* Stagger columns vertically */
  .column:nth-child(1) { transform: translateY(-200px); }
  .column:nth-child(2) { transform: translateY(150px); }
  .column:nth-child(3) { transform: translateY(-100px); }
  .column:nth-child(4) { transform: translateY(300px); }
  .column:nth-child(5) { transform: translateY(-50px); }
  
  .screenshot {
    width: 100%;
    border-radius: 32px; /* Smoother rounded corners */
    box-shadow: 0 40px 80px rgba(0,0,0,0.15), 0 10px 30px rgba(0,0,0,0.05), inset 0 0 0 2px rgba(255,255,255,0.5); 
    background: #fff;
    overflow: hidden;
    border: 2px solid #222; /* Thinner border as requested */
  }
  .screenshot img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
  }
</style>
</head>
<body>
  <div class="scene">
    <div class="masonry">
      <!-- Column 1 -->
      <div class="column">
        <div class="screenshot"><img src="file://${path.resolve(__dirname, 'public/images/projects/nabung_1.png')}"></div>
        <div class="screenshot"><img src="file://${path.resolve(__dirname, 'public/images/projects/nabung_6.png')}"></div>
        <div class="screenshot"><img src="file://${path.resolve(__dirname, 'public/images/projects/nabung_4.png')}"></div>
      </div>
      <!-- Column 2 -->
      <div class="column">
        <div class="screenshot"><img src="file://${path.resolve(__dirname, 'public/images/projects/nabung_3.png')}"></div>
        <div class="screenshot"><img src="file://${path.resolve(__dirname, 'public/images/projects/nabung_8.png')}"></div>
        <div class="screenshot"><img src="file://${path.resolve(__dirname, 'public/images/projects/nabung_5.png')}"></div>
      </div>
      <!-- Column 3 -->
      <div class="column">
        <div class="screenshot"><img src="file://${path.resolve(__dirname, 'public/images/projects/nabung_7.png')}"></div>
        <div class="screenshot"><img src="file://${path.resolve(__dirname, 'public/images/projects/nabung_1.png')}"></div>
        <div class="screenshot"><img src="file://${path.resolve(__dirname, 'public/images/projects/nabung_6.png')}"></div>
      </div>
      <!-- Column 4 -->
      <div class="column">
        <div class="screenshot"><img src="file://${path.resolve(__dirname, 'public/images/projects/nabung_4.png')}"></div>
        <div class="screenshot"><img src="file://${path.resolve(__dirname, 'public/images/projects/nabung_5.png')}"></div>
        <div class="screenshot"><img src="file://${path.resolve(__dirname, 'public/images/projects/nabung_8.png')}"></div>
      </div>
      <!-- Column 5 -->
      <div class="column">
        <div class="screenshot"><img src="file://${path.resolve(__dirname, 'public/images/projects/nabung_3.png')}"></div>
        <div class="screenshot"><img src="file://${path.resolve(__dirname, 'public/images/projects/nabung_7.png')}"></div>
      </div>
    </div>
  </div>
</body>
</html>
`;

fs.writeFileSync('mockup.html', htmlContent);

(async () => {
  console.log("Starting Puppeteer...");
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 }); // 4K resolution
  console.log("Navigating to HTML file...");
  await page.goto(`file://${path.resolve(__dirname, 'mockup.html')}`);

  // Wait a bit for images to load
  await new Promise(r => setTimeout(r, 2000));

  const outputPath = path.resolve(__dirname, 'public/images/projects/nabung_presentation.png');
  console.log("Taking screenshot...");
  await page.screenshot({ path: outputPath });

  await browser.close();
  console.log("Done! Saved to:", outputPath);
})();
