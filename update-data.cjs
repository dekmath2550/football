const fs=require('node:fs'),path=require('node:path'),source=require('./data-source.js');
source.load().then(data=>{fs.writeFileSync(path.join(__dirname,'matches.js'),'window.MATCH_SNAPSHOT = '+JSON.stringify(data)+';\n');console.log(JSON.stringify({count:data.rows.length,latest:data.rows.at(-1)?.date,failures:data.failures,leagues:[...new Set(data.rows.map(r=>r.league))]}))}).catch(e=>{console.error(e.message);process.exitCode=1});

