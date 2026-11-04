/* SEMRESERVAS MVP — protótipo local, não código de produção. Sem autenticação real. */
(()=>{
'use strict';
const KEY='SEMRESERVAS_DEMO_MVP_V1_20261104';
const channel=typeof BroadcastChannel==='function'?new BroadcastChannel('semreservas-demo-v1'):null;
const id=()=>{try{return crypto.randomUUID()}catch{return 'd'+Date.now()+'-'+Math.floor(Math.random()*1e7)}};
const money=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const escape=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const A='/assets/';
function product(id,cat,name,price,img,desc,type='image',media=null){return {id,category:cat,name,price,img:A+img,description:desc,ingredients:desc,mediaType:type,media:media?A+media:null,available:true};}
function seed(){
 return {version:1,updatedAt:new Date().toISOString(),tenants:{
  restopub:{id:'restopub',name:'SEMRESERVAS RESTOPUB',short:'RESTOPUB',tagline:'Gastronomia, drinks e boa companhia.',heading:'Sua experiência começa aqui.',subheading:'Descubra pratos, peça com facilidade e aproveite vantagens.',primary:'#290b4f',accent:'#fa7d2b',hero:A+'burger.webp',logo:null,instagram:'https://www.instagram.com/',googleReviewUrl:null,wifiSsid:'RESTOPUB-CONVIDADOS',wifiPass:'demo2026',type:'demonstração fictícia',contact:'Contato institucional a configurar',features:{feed:true,loyalty:true,waiter:true,instagram:true,google:true,wifi:true,photos:true,survey:true,comments:true,feedback:true,campaigns:true},homeBlocks:['primary','social','experience'],tagStatus:'Ativa (simulada)',products:[
   product('r01','Burgers','Burger Restopub',42.9,'burger.webp','Pão brioche, blend artesanal, cheddar, bacon, cebola caramelizada e molho especial.','video','burger-demo.mp4'),
   product('r02','Burgers','Cheddar Bacon',45.9,'burger.webp','Pão brioche, cheddar cremoso, bacon e molho defumado.'),
   product('r03','Burgers','Smash Duplo',39.9,'burger.webp','Dois discos smash, queijo, picles e molho da casa.'),
   product('r04','Burgers','Veggie Burger',36.9,'burger.webp','Hambúrguer vegetal, tomate, rúcula e maionese de ervas.'),
   product('r05','Entradas','Batata Rústica',24.9,'fries.webp','Batatas douradas, páprica defumada e molho de ervas.'),
   product('r06','Entradas','Anéis de Cebola',21.9,'fries.webp','Anéis empanados crocantes e molho especial.'),
   product('r07','Entradas','Dadinho de Tapioca',26.9,'fries.webp','Dadinho de tapioca e queijo com geleia de pimenta.'),
   product('r08','Entradas','Bruschetta da Casa',22.9,'pizza.webp','Pão tostado, tomate, queijo e manjericão.'),
   product('r09','Drinks','Spritz da Casa',28.9,'drink.webp','Bebida cítrica refrescante com laranja e alecrim.'),
   product('r10','Drinks','Gin Tropical',31.9,'drink.webp','Gin, frutas e tônica premium.'),
   product('r11','Drinks','Mojito Restopub',27.9,'drink.webp','Hortelã, limão e toque de rum.'),
   product('r12','Drinks','Caipirinha de Limão',19.9,'drink.webp','Limão, gelo e cachaça.'),
   product('r13','Sobremesas','Brownie com Gelato',26.9,'dessert.webp','Brownie, calda quente e gelato de baunilha.'),
   product('r14','Sobremesas','Cheesecake',24.9,'dessert.webp','Cheesecake cremoso com frutas vermelhas.'),
   product('r15','Sobremesas','Mousse de Chocolate',18.9,'dessert.webp','Mousse aerada de chocolate intenso.'),
   product('r16','Sobremesas','Gelato de Pistache',22.9,'gelato.webp','Gelato de pistache, crocante e calda.')
  ]},
  pulpo:{id:'pulpo',name:'PULPO Cozinha Criativa',short:'PULPO',tagline:'Pizzas autorais e experiências gastronômicas.',heading:'Descubra os sabores da Pulpo.',subheading:'Pizzas e sabores criativos em uma experiência digital.',primary:'#371c28',accent:'#e2a15f',hero:A+'pizza.webp',logo:null,instagram:'https://www.instagram.com/pulpocozinhacriativa/',googleReviewUrl:null,wifiSsid:'PULPO-CONVIDADOS-DEMO',wifiPass:'demopulpo',type:'simulação conceitual; não é publicação oficial',contact:'A confirmar',features:{feed:true,loyalty:true,waiter:true,instagram:true,google:true,wifi:true,photos:true,survey:true,comments:true,feedback:true,campaigns:true},homeBlocks:['primary','social','experience'],tagStatus:'Planejamento (simulado)',products:[
   product('p01','Pizzas','Pizza de Cordeiro Defumado',76.9,'pizza.webp','Pizza autoral ilustrativa com cordeiro defumado, queijo, tomate e ervas.'),
   product('p02','Pizzas','Margherita Artesanal',58.9,'pizza.webp','Massa napolitana, tomate, mozzarella e manjericão.'),
   product('p03','Pizzas','Quattro Formaggi',64.9,'pizza.webp','Massa leve, quatro queijos e toque de azeite.'),
   product('p04','Pizzas','Pancetta & Mel',69.9,'pizza.webp','Pancetta crocante e mel aromático.'),
   product('p05','Entradas','Croquetas da Casa',28.9,'fries.webp','Croquetas artesanais e molho da estação.'),
   product('p06','Entradas','Focaccia',31.9,'pizza.webp','Focaccia de fermentação longa e azeite.'),
   product('p07','Entradas','Arancini',29.9,'fries.webp','Bolinhos italianos de arroz e queijo.'),
   product('p08','Entradas','Bruschetta',24.9,'pizza.webp','Pão tostado, tomate e queijo.'),
   product('p09','Drinks','Spritz da Casa',29.9,'drink.webp','Drink cítrico com laranja e toque herbal.'),
   product('p10','Drinks','Tônica Botânica',24.9,'drink.webp','Tônica aromática e especiarias.'),
   product('p11','Drinks','Clericot',32.9,'drink.webp','Bebida leve e refrescante com frutas.'),
   product('p12','Drinks','Mule Cítrico',27.9,'drink.webp','Drink com gengibre e limão.'),
   product('p13','Gelatos','Gelato de Pistache',22.9,'gelato.webp','Gelato artesanal com pistache.'),
   product('p14','Gelatos','Chocolate',21.9,'gelato.webp','Gelato cremoso de chocolate.'),
   product('p15','Gelatos','Baunilha e Frutas',19.9,'gelato.webp','Gelato de baunilha com frutas.'),
   product('p16','Gelatos','Doce de Leite',20.9,'gelato.webp','Gelato de doce de leite.')
  ]}
 },serviceRequests:[],eventLog:[],comments:[],orders:[],loyalty:[],reportRuns:[],profiles:[],tagRegistry:[
 {id:'TAG-DEMO-001',tenantId:'restopub',url:'/r/demo-001',locked:true,active:true},
 {id:'TAG-DEMO-002',tenantId:'pulpo',url:'/r/demo-002',locked:true,active:false}
 ]};
}
function read(){try{const raw=localStorage.getItem(KEY);if(!raw){const v=seed();localStorage.setItem(KEY,JSON.stringify(v));return v;}const data=JSON.parse(raw);return data.version===1?data:seed();}catch{return seed()}}
function write(data){data.updatedAt=new Date().toISOString();try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){console.warn('Falha localStorage',e)};if(channel)channel.postMessage({kind:'update',id:id()});window.dispatchEvent(new CustomEvent('sr-updated'))}
function update(mutator){const data=read();const result=mutator(data);write(data);return result;}
function track(tenantId,type,props={}){update(d=>{d.eventLog.push({id:id(),tenantId,type,props,at:new Date().toISOString()});if(d.eventLog.length>2500)d.eventLog=d.eventLog.slice(-2500)})}
function subscribe(fn){if(channel)channel.addEventListener('message',fn);window.addEventListener('storage',e=>{if(e.key===KEY)fn(e)});window.addEventListener('sr-updated',fn)}
function toast(msg){const el=document.getElementById('toast');if(!el)return;el.textContent=msg;el.hidden=false;clearTimeout(toast._timer);toast._timer=setTimeout(()=>el.hidden=true,3900)}
function tenantOptions(selected){return Object.values(read().tenants).map(t=>`<option value="${escape(t.id)}" ${t.id===selected?'selected':''}>${escape(t.name)}</option>`).join('')}
function img(src,alt,cls=''){return `<img src="${escape(src)}" alt="${escape(alt)}" class="${escape(cls)}" loading="lazy">`}
const uniqueId=id;
const m={KEY,seed,read,write,update,track,subscribe,toast,tenantOptions,img,money,escape,uniqueId};
window.SR=m;
})();
