// otimizar-imagens-webp.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const projectDir = path.resolve(__dirname);
const imageExtensions = ['.png', '.jpg', '.jpeg'];

// Função para procurar arquivos recursivamente
function getFiles(dir, extensions) {
    let results = [];
    const list = fs.readdirSync(dir, { withFileTypes: true });
    list.forEach(file => {
        const filePath = path.join(dir, file.name);
        if (file.isDirectory()) {
            results = results.concat(getFiles(filePath, extensions));
        } else if (extensions.includes(path.extname(file.name).toLowerCase())) {
            results.push(filePath);
        }
    });
    return results;
}

// Otimiza e cria versão webp, apagando o original
async function optimizeToWebp(filePath) {
    const ext = path.extname(filePath);
    const webpPath = filePath.replace(ext, '.webp');

    try {
        await sharp(filePath)
            .webp({ quality: 80 })
            .toFile(webpPath);

        // Apaga o arquivo original
        fs.unlinkSync(filePath);

        console.log('Gerado WebP e apagado original:', webpPath);
        return { original: filePath, webp: webpPath };
    } catch (err) {
        console.error('Erro otimizando', filePath, err);
        return null;
    }
}

// Atualiza referências em HTML, CSS e JS
function updateReferences(codeFile, mappings) {
    let content = fs.readFileSync(codeFile, 'utf8');
    mappings.forEach(({ original, webp }) => {
        const relativeOriginal = path.relative(path.dirname(codeFile), original).replace(/\\/g, '/');
        const relativeWebp = path.relative(path.dirname(codeFile), webp).replace(/\\/g, '/');
        content = content.split(relativeOriginal).join(relativeWebp);
    });
    fs.writeFileSync(codeFile, content, 'utf8');
}

// Função principal
async function main() {
    const images = getFiles(projectDir, imageExtensions);
    const mappings = [];

    for (const img of images) {
        const result = await optimizeToWebp(img);
        if (result) mappings.push(result);
    }

    const codeFiles = getFiles(projectDir, ['.html', '.css', '.js']);
    codeFiles.forEach(file => updateReferences(file, mappings));

    console.log('Otimização, exclusão de originais e atualização de referências concluídas!');
}

main();
