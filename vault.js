const unpack=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const pack=b=>btoa(String.fromCharCode(...new Uint8Array(b)));
const rsaParams={name:'RSA-OAEP',hash:'SHA-256'};
const textEncoder=new TextEncoder();
async function unlockKey(password){
  const raw=await crypto.subtle.importKey('raw',textEncoder.encode(password),'PBKDF2',false,['deriveKey']);
  const wrapping=await crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:unpack(envelope.salt),iterations:600000},raw,{name:'AES-GCM',length:256},false,['decrypt']);
  const decoded=await crypto.subtle.decrypt({name:'AES-GCM',iv:unpack(envelope.iv)},wrapping,unpack(envelope.locked));
  return crypto.subtle.importKey('pkcs8',decoded,rsaParams,false,['decrypt']);
}
async function seal(award){
  const key=await crypto.subtle.generateKey({name:'AES-GCM',length:256},true,['encrypt']);
  const iv=crypto.getRandomValues(new Uint8Array(12));
  const pub=await crypto.subtle.importKey('spki',unpack(envelope.pub),rsaParams,false,['encrypt']);
  const wrapped=await crypto.subtle.encrypt(rsaParams,pub,await crypto.subtle.exportKey('raw',key));
  const body=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,textEncoder.encode(JSON.stringify(award)));
  return {sealed:1,wrapped:pack(wrapped),iv:pack(iv),body:pack(body)};
}
async function openAward(record,priv){
  const raw=await crypto.subtle.decrypt(rsaParams,priv,unpack(record.wrapped));
  const key=await crypto.subtle.importKey('raw',raw,'AES-GCM',false,['decrypt']);
  const decoded=await crypto.subtle.decrypt({name:'AES-GCM',iv:unpack(record.iv)},key,unpack(record.body));
  return JSON.parse(new TextDecoder().decode(decoded));
}
