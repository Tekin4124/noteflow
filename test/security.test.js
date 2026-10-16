const {test,before,after} = require('node:test');
const assert = require('node:assert/strict');
const fs=require('node:fs'), os=require('node:os'), path=require('node:path'), http=require('node:http'), crypto=require('node:crypto'), jwt=require('jsonwebtoken');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'notebook-security-'));
process.env.DATABASE_PATH=path.join(temp,'test.sqlite');
process.env.JWT_SECRET=crypto.randomBytes(32).toString('hex');
process.env.PUBLIC_ORIGIN='https://defter.muhammet-tekin.dev';
process.env.AUTH_RATE_LIMIT='1000';process.env.REGISTER_RATE_LIMIT='1000';
const {app,db}=require('../server');
const {rateLimit}=require('../security');
let server,url,a,b;
before(async()=>{await new Promise(r=>db.get('SELECT 1',r));await new Promise(r=>server=app.listen(0,'127.0.0.1',r));url='http://127.0.0.1:'+server.address().port;});
after(async()=>{await new Promise(r=>server.close(r));await new Promise(r=>db.close(r));fs.rmSync(temp,{recursive:true,force:true});});
const request=(route,token,method='GET',data,headers={})=>fetch(url+route,{method,headers:{...headers,...(token?{Authorization:'Bearer '+token}:{}),...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{})});
test('sessions expire, browser cookies are HttpOnly, and users cannot read each other’s notes',async()=>{
 const one=await request('/api/register',null,'POST',{fruit_name:'Elma41',password:'long-password'});a=(await one.json()).token;
 const two=await request('/api/register',null,'POST',{fruit_name:'Armut42',password:'long-password'});b=(await two.json()).token;
 const parsed=jwt.decode(a);assert.equal(parsed.exp-parsed.iat,7*86400);assert.match(one.headers.get('set-cookie'),/HttpOnly; SameSite=Strict/);
 const cookie=one.headers.get('set-cookie').split(';')[0];assert.equal((await request('/api/me',null,'GET',null,{Cookie:cookie})).status,200);
 assert.equal((await request('/api/sync',a,'POST',{pages:[{content:'only-A'}]})).status,200);
 assert.equal(await (await request('/api/load',b)).json(),null);
 assert.equal((await (await request('/api/load',a)).json()).pages[0].content,'only-A');
 const expired=jwt.sign({id:parsed.id},process.env.JWT_SECRET,{expiresIn:-1,issuer:'noteflow',audience:'notebook'});
 assert.equal((await request('/api/load',expired)).status,401);
});
test('HTML attack payloads are removed while basic formatting and checklists survive',async()=>{
 const page={content:'<b>safe</b><script>alert(1)</script><img src=x onerror=alert(1)><svg onload=alert(1)></svg><a href="javascript:alert(1)">link</a><input type="text" onfocus="alert(1)"><span style="color:#ff0000;position:fixed">red</span>',stickers:[{id:'emoji_123',type:'emoji',emoji:'⭐',x:20,y:30}]};
 assert.equal((await request('/api/sync',a,'POST',{pages:[page]})).status,200);
 const body=(await (await request('/api/load',a)).json()).pages[0].content;
 assert.match(body,/<b>safe<\/b>/);assert.match(body,/type="checkbox"/);assert.doesNotMatch(body,/script|onerror|onload|javascript:|position|type="text"|<img|<svg/);
});
test('cross-site writes, invalid notebook shapes, oversize payloads and private files are rejected',async()=>{
 assert.equal((await request('/api/sync',a,'POST',{pages:[{}]},{Origin:'https://evil.example'})).status,403);
 assert.equal((await request('/api/me',a,'GET',null,{'Sec-Fetch-Site':'cross-site'})).status,403);
 for(const body of [{pages:Array.from({length:121},()=>({}))},{pages:[{content:4}]},{pages:[{}],settings:{paperPattern:'x"><script>alert(1)</script>'}},{pages:[{stickers:[{type:'sticky',id:'x',x:10,y:10,text:4}]}]}]) assert.equal((await request('/api/sync',a,'POST',body)).status,400);
 assert.equal((await request('/api/sync',a,'POST',{pages:[{content:'x'.repeat(2*1024*1024)}]})).status,413);
 for(const file of ['/server.js','/database.sqlite','/.env','/package.json','/vendor/../../server.js'])assert.equal((await request(file)).status,404);
 assert.equal((await request('/api/fruits')).status,200);assert.deepEqual((await (await request('/api/fruits')).json()).registered,[]);
});
test('account deletion removes notes and invalidates issued tokens',async()=>{
 assert.equal((await request('/api/account',a,'DELETE')).status,200);
 assert.equal((await request('/api/load',a)).status,401);
 assert.equal((await request('/api/login',null,'POST',{fruit_name:'Elma41',password:'long-password'})).status,401);
 assert.equal((await request('/api/me',b)).status,200);
});
test('rate limits return retry hints and bounded maps reject new clients',async()=>{
 const limiter=rateLimit({limit:2,windowMs:60000,maxClients:1});
 const limited=http.createServer((req,res)=>{req.ip=req.headers['x-test-ip']||'one';res.status=function(s){this.statusCode=s;return this};res.json=function(d){this.end(JSON.stringify(d));return this};res.set=function(k,v){this.setHeader(k,v);return this};limiter(req,res,()=>res.end('ok'));});
 await new Promise(r=>limited.listen(0,'127.0.0.1',r));const target='http://127.0.0.1:'+limited.address().port;
 try{assert.equal((await fetch(target)).status,200);assert.equal((await fetch(target)).status,200);const denied=await fetch(target);assert.equal(denied.status,429);assert.ok(denied.headers.get('retry-after'));assert.equal((await fetch(target,{headers:{'x-test-ip':'two'}})).status,429);}finally{await new Promise(r=>limited.close(r));}
});
