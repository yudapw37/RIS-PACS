import fs from 'fs';
const vueFiles = [
  'src/views/Patients.vue',
  'src/views/Doctors.vue',
  'src/views/Modalities.vue',
  'src/views/ModalityLogs.vue'
];

vueFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/hover:bg-slate-50\/70/g, 'hover:bg-slate-50/70 dark:hover:bg-slate-800/50');
  content = content.replace(/hover:bg-slate-50(?![\/\d])(?! dark:)/g, 'hover:bg-slate-50 dark:hover:bg-slate-800/50');
  
  // badge-pink
  content = content.replace(/background:#fdf2f8; color:#ec4899;.*border:1px solid #fce7f3;/g, '@apply bg-pink-50 text-pink-500 border border-pink-100 dark:bg-pink-900/40 dark:text-pink-400 dark:border-pink-800/50;');
  // toast
  content = content.replace(/background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0;/g, '@apply bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-900;');
  content = content.replace(/background:var\(--color-red-50\); color:#dc2626; border:1px solid #fecaca;/g, '@apply bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/80 dark:text-red-400 dark:border-red-900;');
  
  // btn-icon overrides for dark inline styles
  content = content.replace(/var\(--color-blue-50\)/g, 'var(--color-blue-50); @apply dark:bg-blue-900/40 dark:text-blue-400');
  content = content.replace(/var\(--color-red-50\)/g, 'var(--color-red-50); @apply dark:bg-red-900/40 dark:text-red-400');

  fs.writeFileSync(file, content);
  console.log('Fixed hover and badges in ' + file);
});
