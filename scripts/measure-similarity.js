/**
 * Script para medir a similaridade entre páginas de cidades.
 * Extrai texto visível (sem tags HTML e scripts), neutraliza o nome da cidade e slug,
 * e calcula a similaridade média (Jaccard e Overlap) entre os pares de páginas.
 */

const fs = require('fs');
const path = require('path');

const cidades = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/cidades.json'), 'utf8'));

function extractCleanWords(filePath, cidade) {
  if (!fs.existsSync(filePath)) return [];
  let html = fs.readFileSync(filePath, 'utf8');

  // Remove scripts, styles, json-ld
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
  html = html.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, ' ');
  
  // Strip tags
  let text = html.replace(/<[^>]+>/g, ' ');

  // Neutraliza nome da cidade e slug
  const nomeRegex = new RegExp(cidade.nome, 'gi');
  const slugRegex = new RegExp(cidade.slug, 'gi');
  text = text.replace(nomeRegex, 'CIDADE_PLACEHOLDER');
  text = text.replace(slugRegex, 'SLUG_PLACEHOLDER');

  // Tokeniza palavras
  const words = text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);

  return words;
}

function calculateJaccard(wordsA, wordsB) {
  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 1 : intersection / union;
}

function calculateSequenceSimilarity(wordsA, wordsB) {
  // Overlap coefficient / word frequency cosine
  const freqA = {};
  const freqB = {};
  wordsA.forEach(w => freqA[w] = (freqA[w] || 0) + 1);
  wordsB.forEach(w => freqB[w] = (freqB[w] || 0) + 1);

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  const allWords = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);
  for (const w of allWords) {
    const a = freqA[w] || 0;
    const b = freqB[w] || 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Mede similaridade entre as cidades existentes
const outDir = path.resolve(__dirname, '..');
const existingCities = cidades.filter(c => fs.existsSync(path.join(outDir, `revestimento-de-volante-${c.slug}.html`)));

let totalJaccard = 0;
let totalCosine = 0;
let pairs = 0;

for (let i = 0; i < existingCities.length; i++) {
  for (let j = i + 1; j < existingCities.length; j++) {
    // pula Divinópolis e BH que já têm regras próprias
    if (existingCities[i].slug === 'belo-horizonte' || existingCities[j].slug === 'belo-horizonte') continue;
    if (existingCities[i].slug === 'divinopolis' || existingCities[j].slug === 'divinopolis') continue;

    const fileA = path.join(outDir, `revestimento-de-volante-${existingCities[i].slug}.html`);
    const fileB = path.join(outDir, `revestimento-de-volante-${existingCities[j].slug}.html`);

    const wordsA = extractCleanWords(fileA, existingCities[i]);
    const wordsB = extractCleanWords(fileB, existingCities[j]);

    totalJaccard += calculateJaccard(wordsA, wordsB);
    totalCosine += calculateSequenceSimilarity(wordsA, wordsB);
    pairs++;
  }
}

console.log(`Pares analisados: ${pairs}`);
console.log(`Similaridade Jaccard média: ${(totalJaccard / pairs * 100).toFixed(2)}%`);
console.log(`Similaridade Cosseno (frequência de palavras) média: ${(totalCosine / pairs * 100).toFixed(2)}%`);
