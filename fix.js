const fs=require('fs');  
const f='D:/pmix/tsconfig.json';  
const c=fs.readFileSync(f,'utf8');  
const n=c.replace(/\" "ignoreDeprecations\: \6.0\/g,'\ignoreDeprecations\: 6.0');  
fs.writeFileSync(f,n);  
console.log('OK'); 
