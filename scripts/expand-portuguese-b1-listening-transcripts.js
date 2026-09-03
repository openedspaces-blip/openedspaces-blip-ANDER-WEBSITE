#!/usr/bin/env node
/* Expands the short Portuguese B1 listening scripts while retaining the
 * original sentences referenced by the existing comprehension questions. */
const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '..', 'src', 'worlds', 'portuguese', 'content.js');
const slugs = [
  'portuguese-b1-trabalho-e-planos-listening', 'portuguese-b1-viagens-com-respeito-listening',
  'portuguese-b1-saude-e-equilibrio-listening', 'portuguese-b1-cultura-e-informacao-listening',
  'portuguese-b1-ambiente-no-bairro-listening', 'portuguese-b1-historias-e-memorias-listening',
  'portuguese-b1-projeto-coletivo-listening', 'portuguese-b1-tecnologia-no-dia-a-dia-listening',
  'portuguese-b1-cidade-e-mobilidade-listening', 'portuguese-b1-planos-para-o-futuro-listening',
  'portuguese-b1-relacoes-e-comunicacao-listening', 'portuguese-b1-cidadania-e-participacao-listening'
];
const extension = 'Depois, os participantes comparam as ideias com uma situação concreta do bairro. Uma pessoa explica que prefere ouvir quem é afetado antes de escolher uma solução. Outra lembra que é importante dizer por que uma decisão foi tomada e combinar um próximo passo. Assim, o grupo faz uma lista simples, divide as tarefas e marca uma nova conversa para verificar o resultado. Todos percebem que colaborar com respeito ajuda a encontrar respostas mais úteis para a comunidade.';

let source = fs.readFileSync(sourcePath, 'utf8');
for (const slug of slugs) {
  const start = source.indexOf(`"slug": "${slug}"`);
  if (start < 0) throw new Error(`Lesson not found: ${slug}`);
  const tail = source.slice(start);
  const match = tail.match(/("transcript":\s*)("(?:\\.|[^"\\])*")/);
  if (!match) throw new Error(`Transcript not found: ${slug}`);
  const original = JSON.parse(match[2]);
  const expanded = original.includes('Depois, os participantes comparam as ideias') ? original : `${original} ${extension}`;
  const replacement = `${match[1]}${JSON.stringify(expanded)}`;
  source = source.slice(0, start) + tail.replace(match[0], replacement);
}
fs.writeFileSync(sourcePath, source, 'utf8');
console.log(`Expanded ${slugs.length} Portuguese B1 listening transcripts.`);
