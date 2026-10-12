(()=>{'use strict';
 const board=document.querySelector('.diplomatic-board');if(!board)return;
 const model=JSON.parse(document.querySelector('#department-data').textContent).foreignRelations;
 const groups=new Map(model.groups.map(g=>[g.id,g])),countries=new Map(model.countries.map(c=>[c.tag,c]));
 const map=board.querySelector('.dip-world-map'),paths=[...map.querySelectorAll('[data-dip-country]')];
 let group='international',country=null,movement=false,tab='diplomacy',layer='faction',view='world';
 const text=(selector,value)=>{board.querySelector(selector).textContent=value;};
 const signed=n=>n>0?'+'+n:String(n);
 const color=n=>n===null?'#aab5b1':n>=45?'#4d796a':n>=-20?'#b4a875':n>=-60?'#ad7c55':'#985252';
 const sectionNames={diplomacy:['外交往来','DIPLOMATIE'],economy:['经济概况','ÉCONOMIE'],military:['军务概况','FORCES ARMÉES'],assessment:['本部判断','APPRÉCIATION DU SERVICE'],contacts:['社会与政治联系','RELATIONS AVEC LES ORGANISATIONS']};
 function button(tag){const b=document.createElement('button');b.type='button';b.dataset.dipMember=tag;b.textContent=countries.get(tag).name;return b;}
 function paint(){
  paths.forEach(p=>{const c=countries.get(p.dataset.dipCountry),g=groups.get(c.group);p.setAttribute('fill',layer==='relations'?color(c.opinion):(c.associate?`url(#dip-hatch-${g.id})`:g.color));p.setAttribute('aria-pressed',String(country===c.tag));if(layer==='relations')p.removeAttribute('data-highlight');else p.dataset.highlight=String(country?country===c.tag:movement?false:c.group===group);});
  map.querySelector('[data-dip-movement]').setAttribute('aria-pressed',String(movement));
  const legend=board.querySelector('[data-dip-legend]');legend.replaceChildren();
  const items=layer==='faction'?model.groups.map(g=>[g.name,g.color]):[['友好 +45至+100',color(60)],['一般 −20至+44',color(0)],['不睦 −60至−21',color(-40)],['敌对 −100至−61',color(-90)],['本国／盟友／未评分','#aab5b1']];
  for(const [name,col] of items){const span=document.createElement('span'),i=document.createElement('i');i.style.background=col;span.append(i,document.createTextNode(name));legend.append(span);}
  board.querySelectorAll('[data-dip-layer]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.dipLayer===layer)));
  text('.dip-map-note',layer==='faction'?'实色：成员或组成地区；斜纹：属地、保护关系或合作对象。中国与未结盟项是查阅分组。国民党圆标表示组织联络，不表示领土。':'关系着色按本页好感度。第三国际采用国际主义／沙文主义机制；盟友与未评分地区以灰色列示。国民党圆标表示受援组织。');
 }
 function zoom(){
  let b=[0,0,1400,509.1];
  if(view==='europe')b=[660,60,195,145];
  if(view==='focus'){
   const list=country?[countries.get(country)]:movement?[countries.get('LEP')]:groups.get(group).members.map(t=>countries.get(t)).filter(Boolean);
   if(list.length){const left=Math.min(...list.map(c=>c.bounds[0])),top=Math.min(...list.map(c=>c.bounds[1])),right=Math.max(...list.map(c=>c.bounds[0]+c.bounds[2])),bottom=Math.max(...list.map(c=>c.bounds[1]+c.bounds[3]));const w=Math.max(80,right-left+30),h=Math.max(65,bottom-top+30);b=[Math.max(0,left-15),Math.max(0,top-15),w,h];}
  }
  map.setAttribute('viewBox',b.join(' '));
  // Keep geographic labels and the non-territorial movement marker legible at each scale.
  const scale=Math.min(b[2]/1400,b[3]/509.1);
  map.querySelectorAll('.dip-map-label').forEach(n=>n.style.fontSize=(13*scale)+'px');
  const marker=map.querySelector('.dip-movement'),circle=marker.querySelector('circle');
  circle.setAttribute('r',8*scale);marker.querySelector('text').style.fontSize=(12*scale)+'px';
  const cx=Number(circle.getAttribute('cx')),cy=Number(circle.getAttribute('cy'));
  marker.querySelector('path').setAttribute('d',`M${cx-3*scale} ${cy}h${6*scale}m${-3*scale} ${-3*scale}v${6*scale}`);
  marker.querySelector('text').setAttribute('x',cx+14*scale);marker.querySelector('text').setAttribute('y',cy+4*scale);
  board.querySelectorAll('[data-dip-view]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.dipView===view)));
 }
 function show(){
  const g=groups.get(group),c=country?countries.get(country):null,m=movement?model.supportedMovement:null,item=m||c||g;
  text('[data-dip-title]',item.name);text('[data-dip-type]',m?'受援革命组织 · 无国家领土':c?c.membership:g.type+' · '+g.leader);text('[data-dip-fr]',m?m.fr:c?c.fr:g.fr);
  const lead=board.querySelector('[data-dip-lead]');
  lead.textContent=m?m.text:c?(c.dependency?`${c.dependency[1]}。`:'')+(Array.isArray(c.diplomacy)?c.diplomacy[0]:c.diplomacy):g.text;
  lead.hidden=!!c||(movement&&tab==='assessment');
  text('[data-dip-status]',item.status);text('[data-dip-trade]',m?'经核准的组织援助':item.trade);text('[data-dip-security]',m?'组织准备；尚未革命':item.security);
  const name=m?m.name:c?c.name:g.name;
  text('[data-dip-map-status]',group==='international'?name+' · 国际主义64／沙文主义28':name+' · '+(item.opinion===null||item.opinion===undefined?item.status:signed(item.opinion)+' · '+item.trade));
  const opinion=board.querySelector('[data-dip-opinion]');opinion.hidden=item.opinion===null||item.opinion===undefined;
  opinion.replaceChildren();if(!opinion.hidden){const label=document.createElement('small'),value=document.createElement('strong'),range=document.createElement('small');label.textContent='对法好感度';value.textContent=signed(item.opinion);range.textContent='−100 ～ +100';opinion.style.setProperty('--opinion-color',color(item.opinion));opinion.append(label,value,range);}
  board.querySelector('[data-dip-mechanisms]').hidden=group!=='international'||movement;
  board.querySelector('[data-dip-back]').hidden=!c&&!m;
  const list=board.querySelector('[data-dip-members]');list.replaceChildren();
  const title=g.id==='china'?'当地政权':g.id==='unaffiliated'?'国别索引':g.id==='russia'?'国家档案':'成员与组成地区';text('[data-dip-members-title]',c||m?'同组国别':title);
  for(const t of g.members)if(countries.has(t))list.append(button(t));
  const associates=board.querySelector('[data-dip-associates]');associates.replaceChildren();associates.hidden=!g.associates.length;
  if(g.associates.length){const h=document.createElement('h4'),members=document.createElement('div');h.textContent='属地、保护关系与合作对象';for(const t of g.associates)if(countries.has(t))members.append(button(t));associates.append(h,members);}
  board.querySelector('[data-dip-china-support]').hidden=group!=='china';
  board.querySelectorAll('[data-dip-group-select]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.dipGroupSelect===group)));
  board.querySelector('[data-dip-picker]').value=m?'kmt':country||'';
  showTab();paint();zoom();
 }
 function node(name,value,className){const n=document.createElement(name);if(value!==undefined)n.textContent=value;if(className)n.className=className;return n;}
 function paragraphs(parent,value){for(const p of Array.isArray(value)?value:[value])if(p)parent.append(node('p',p));}
 function assessment(parent,a){
  paragraphs(parent,a.conclusion);parent.firstElementChild.classList.add('dip-conclusion');
  for(const [title,value] of [['利益与矛盾',a.interests],['对法政策',a.policy]])if(value){const section=node('section',undefined,'dip-assessment-section');section.append(node('h5',title));paragraphs(section,value);parent.append(section);}
  const follow=node('details',undefined,'dip-followup'),list=node('ul');follow.append(node('summary','续报事项'));for(const v of a.uncertainties)list.append(node('li',v));follow.append(list,node('p',a.channels,'dip-material-scope'));parent.append(follow);parent.append(node('p',a.confidence,'dip-confidence'));
 }
 function contacts(parent,c){
  parent.append(node('p',c.contactNote,'dip-contact-note'));
  for(const org of c.contacts){const card=node('article',undefined,'dip-contact-card');card.append(node('h5',org.name));card.append(node('p',org.status,'dip-contact-status'));const facts=node('dl');for(const [title,value] of [['社会基础',org.constituency],['可合作事项',org.commonGround],['合作条件',org.reservation],['政治判断',org.alignment]])facts.append(node('dt',title),node('dd',value));card.append(facts);const source=node('details',undefined,'dip-contact-source');source.append(node('summary','资料依据'),node('p',org.sourceNote));card.append(source);parent.append(card);}
 }
 function showTab(){
  const item=movement?model.supportedMovement:country?countries.get(country):groups.get(group);
  text('[data-dip-section-title]',sectionNames[tab][0]);text('[data-dip-section-fr]',sectionNames[tab][1]);
  const content=board.querySelector('[data-dip-section-text]');content.replaceChildren();
  if(tab==='assessment'){
   if(movement)assessment(content,model.supportedMovement.analysis);
   else assessment(content,item.analysis);
  }else if(tab==='contacts'){
   if(movement){paragraphs(content,['既定联络对象：中国国民党。法国支持其革命准备，具体合作围绕民族自主、社会改革和核准的物资用途展开。','各地国民党、劳动及农业改革者的社会基础不同。共同民族目标有助于联合，土地、工会和未来国家制度的安排由中国有关代表议定。']);}
   else if(country)contacts(content,item);
   else{paragraphs(content,'按国别查看拟接洽组织、共同议题与合作条件。现有援助关系在相应条目单列。');const list=node('div',undefined,'dip-contact-index');for(const c of model.countries.filter(c=>c.group===group)){const b=button(c.tag);b.className='dip-contact-index-item';b.replaceChildren(node('strong',c.name),node('span',c.revolutionCompleted?'已革命 · 政府及劳动机关协作':c.contacts.map(o=>o.name).join('；')));list.append(b);}content.append(list);}
  }else paragraphs(content,item[tab]);
  board.querySelector('[data-dip-lead]').hidden=!!country||(movement&&tab==='assessment');
  board.querySelectorAll('[data-dip-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.dipTab===tab)));
 }
 function selectCountry(tag){if(tag==='kmt'){group='china';country=null;movement=true;}else{const c=countries.get(tag);if(!c)return;group=c.group;country=tag;movement=false;}if(tab!=='contacts')tab='assessment';if(window.matchMedia('(max-width:800px)').matches&&view==='world')view='focus';show();}
 board.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.dipGroupSelect){group=b.dataset.dipGroupSelect;country=null;movement=false;show();}
  else if(b.dataset.dipMember)selectCountry(b.dataset.dipMember);
  else if(b.hasAttribute('data-dip-open-movement'))selectCountry('kmt');
  else if(b.hasAttribute('data-dip-back')){country=null;movement=false;show();}
  else if(b.dataset.dipTab){tab=b.dataset.dipTab;showTab();}
  else if(b.dataset.dipLayer){layer=b.dataset.dipLayer;paint();}
  else if(b.dataset.dipView){view=b.dataset.dipView;zoom();}
  else if(b.hasAttribute('data-dip-read')){board.querySelector('.dip-file').scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'});board.querySelector('.dip-file').focus({preventScroll:true});}
 });
 board.querySelector('[data-dip-picker]').addEventListener('change',e=>{if(e.target.value)selectCountry(e.target.value);});
 function mapAction(target){const c=target.closest('[data-dip-country]'),m=target.closest('[data-dip-movement]');if(c)selectCountry(c.dataset.dipCountry);else if(m)selectCountry('kmt');}
 map.addEventListener('click',e=>mapAction(e.target));map.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();mapAction(e.target);}});
 show();
})();
