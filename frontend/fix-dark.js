import fs from 'fs';

const stylePath = 'src/style.css';
let styleContent = fs.readFileSync(stylePath, 'utf8');
styleContent = styleContent.replace(/\.dark \{[\s\S]*?color-scheme: dark;\n\}/, '.dark { color-scheme: dark; }');
// Also restore original variables that we mapped
styleContent = styleContent.replace(/@apply bg-\[var\(--color-surface-dark\)\] text-slate-800 m-0 p-0 overflow-x-hidden transition-colors duration-300;/, '@apply bg-slate-50 text-slate-800 m-0 p-0 overflow-x-hidden transition-colors duration-300 dark:bg-slate-950 dark:text-slate-200;');

fs.writeFileSync(stylePath, styleContent);

const vueFiles = [
  'src/views/AdminLayout.vue',
  'src/views/Patients.vue',
  'src/views/Doctors.vue',
  'src/views/Modalities.vue',
  'src/views/ModalityLogs.vue',
  'src/components/Pagination.vue'
];

const replacements = [
  [/bg-white(?! dark:)/g, 'bg-white dark:bg-slate-900'],
  [/bg-slate-50(?! dark:)(?!\/)/g, 'bg-slate-50 dark:bg-slate-800/50'],
  [/bg-slate-200(?! dark:)/g, 'bg-slate-200 dark:bg-slate-700'],
  [/bg-slate-100(?! dark:)/g, 'bg-slate-100 dark:bg-slate-800'],
  [/text-slate-800(?! dark:)/g, 'text-slate-800 dark:text-slate-100'],
  [/text-slate-700(?! dark:)/g, 'text-slate-700 dark:text-slate-200'],
  [/text-slate-600(?! dark:)/g, 'text-slate-600 dark:text-slate-300'],
  [/text-slate-500(?! dark:)/g, 'text-slate-500 dark:text-slate-400'],
  [/text-slate-400(?! dark:)/g, 'text-slate-400 dark:text-slate-500'],
  [/border-slate-100(?! dark:)/g, 'border-slate-100 dark:border-slate-800'],
  [/border-slate-200(?! dark:)/g, 'border-slate-200 dark:border-slate-700'],
  [/divide-slate-50(?! dark:)/g, 'divide-slate-50 dark:divide-slate-800/50'],
  [/shadow-sm(?! dark:)/g, 'shadow-sm dark:shadow-none'],
  [/background:var\(--color-white\);/g, '@apply bg-white dark:bg-slate-900;'],
  [/background:var\(--color-slate-50\);/g, '@apply bg-slate-50 dark:bg-slate-800/50;'],
  [/background:var\(--color-slate-100\);/g, '@apply bg-slate-100 dark:bg-slate-800;'],
  [/border:1px solid var\(--color-slate-200\);/g, '@apply border border-slate-200 dark:border-slate-700;'],
  [/border:1\.5px solid var\(--color-slate-200\);/g, '@apply border-[1.5px] border-slate-200 dark:border-slate-700;'],
  [/color:var\(--color-slate-600\);/g, '@apply text-slate-600 dark:text-slate-300;'],
  [/color:var\(--color-slate-500\);/g, '@apply text-slate-500 dark:text-slate-400;'],
  [/color:var\(--color-slate-800\);/g, '@apply text-slate-800 dark:text-slate-100;']
];

vueFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  replacements.forEach(([regex, replacement]) => {
    content = content.replace(regex, replacement);
  });
  
  // Highlighting specific badge backgrounds
  content = content.replace(/bg-([a-z]+)-50(?! dark:)(?!\/)/g, 'bg-$1-50 dark:bg-$1-900/40');
  content = content.replace(/text-([a-z]+)-700(?! dark:)/g, 'text-$1-700 dark:text-$1-400');
  content = content.replace(/text-([a-z]+)-600(?! dark:)/g, 'text-$1-600 dark:text-$1-400');
  content = content.replace(/text-([a-z]+)-500(?! dark:)/g, 'text-$1-500 dark:text-$1-400');
  content = content.replace(/border-([a-z]+)-100(?! dark:)/g, 'border-$1-100 dark:border-$1-800/50');
  content = content.replace(/border-([a-z]+)-200(?! dark:)/g, 'border-$1-200 dark:border-$1-800/50');
  
  // Handle some stray hardcoded ones
  content = content.replace(/bg-\[var\(--color-surface-dark\)\]/g, 'bg-slate-50 dark:bg-slate-950');

  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
});
