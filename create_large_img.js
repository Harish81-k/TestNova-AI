const fs = require('fs');

const generateLargeImage = () => {
    // Generate a ~3MB fake image file
    const buffer = Buffer.alloc(3 * 1024 * 1024, 'a');
    fs.writeFileSync('C:\\Users\\haris\\.gemini\\antigravity-ide\\brain\\fb6ba4d9-3eb4-4b2b-a71d-c9b90a5e3620\\browser\\large_image.jpg', buffer);
    console.log('Created large_image.jpg');
};

generateLargeImage();
