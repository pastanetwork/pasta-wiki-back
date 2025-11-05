const fs = require('fs').promises;
const path = require('path');

const client_langs = {};

async function importsClientLangs() {
    const folderPath = path.join(__dirname, '/client-langs');
    const files = await fs.readdir(folderPath);
    const jsonFiles = files.filter(file => path.extname(file) === '.json');
    
    const langData = {};
    
    await Promise.all(jsonFiles.map(async (file) => {
        const filePath = path.join(folderPath, file);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const fileName = path.basename(file, '.json');
        langData[fileName] = JSON.parse(fileContent);    
    }));
    
    Object.keys(client_langs).forEach(key => delete client_langs[key]);
    
    for (const [lang, translations] of Object.entries(langData)) {
        for (const [key, value] of Object.entries(translations)) {
            if (!client_langs[key]) {
                client_langs[key] = {};
            }
            client_langs[key][lang] = value;
        }
    }
}

module.exports = { importsClientLangs, client_langs }