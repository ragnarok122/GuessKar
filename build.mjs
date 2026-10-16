import fs from 'node:fs';
const core=fs.readFileSync('dist/core.js','utf8').replaceAll('export ','');
const app=fs.readFileSync('dist/app.js','utf8').replace(/^import[^\n]+\n/,'');
const css=fs.readFileSync('dist/style.css','utf8');
const html=fs.readFileSync('src/index.html','utf8').replace('<link rel="stylesheet" href="/style.css">',()=>'<style>'+css+'</style>').replace('<script type="module" src="/app.js"></script>',()=>'<script type="module">'+core+'\n'+app+'</script>');
fs.writeFileSync('dist/index.html',html);
