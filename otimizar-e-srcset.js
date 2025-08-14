// otimizar-e-srcset.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const pastaRaiz = path.join(__dirname); // Pasta raiz do projeto
const larguras = [500, 1000]; // Larguras que serão geradas

// Ler arquivos recursivamente
function lerArquivosRecursivo(pasta, extensoes = ['.jpg', '.jpeg', '.png', '.webp', '.html']) {
    let arquivos = [];
    const itens = fs.readdirSync(pasta);
    itens.forEach(item => {
        const caminho = path.join(pasta, item);
        const stats = fs.statSync(caminho);
        if (stats.isDirectory()) {
            arquivos = arquivos.concat(lerArquivosRecursivo(caminho, extensoes));
        } else if (extensoes.includes(path.extname(item).toLowerCase())) {
            arquivos.push(caminho);
        }
    });
    return arquivos;
}

// Otimizar imagem
async function otimizarImagem(arquivo) {
    const ext = path.extname(arquivo);
    const nome = path.basename(arquivo, ext);
    const dir = path.dirname(arquivo);

    const versões = [];

    for (const largura of larguras) {
        const novoArquivo = path.join(dir, `${nome}-${largura}${ext}`);
        await sharp(arquivo)
            .resize({ width: largura })
            .toFile(novoArquivo);
        versões.push({ arquivo: novoArquivo, largura });
    }

    return versões;
}

// Atualizar HTML com srcset
async function atualizarHTML(arquivoHtml) {
    const conteudo = fs.readFileSync(arquivoHtml, 'utf-8');
    const dom = new JSDOM(conteudo);
    const document = dom.window.document;
    const imgs = Array.from(document.querySelectorAll('img[src]'));

    for (const img of imgs) {
        const srcOriginal = img.getAttribute('src');
        const caminhoImagem = path.join(path.dirname(arquivoHtml), srcOriginal);

        if (fs.existsSync(caminhoImagem)) {
            const versões = await otimizarImagem(caminhoImagem);

            const srcset = versões
                .map(v => path.relative(path.dirname(arquivoHtml), v.arquivo).replace(/\\/g, '/') + ` ${v.largura}w`)
                .concat(srcOriginal + ' 1920w')
                .join(', ');

            img.setAttribute('src', path.relative(path.dirname(arquivoHtml), versões[0].arquivo).replace(/\\/g, '/'));
            img.setAttribute('srcset', srcset);
            img.setAttribute('sizes', `(max-width: 500px) 500px, (max-width: 1000px) 1000px, 1920px`);
        }
    }

    fs.writeFileSync(arquivoHtml, dom.serialize(), 'utf-8');
    console.log(`Atualizado HTML: ${arquivoHtml}`);
}

async function main() {
    const htmls = lerArquivosRecursivo(pastaRaiz, ['.html']);
    for (const html of htmls) {
        await atualizarHTML(html);
    }
    console.log('Processo concluído! Todas as imagens foram otimizadas e HTML atualizado com srcset.');
}

main().catch(err => console.error(err));
