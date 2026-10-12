(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.FinanceChart=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const metrics={balance:{name:'收支对照',color:'#356b54'},revenue:{name:'收入',color:'#356b54'},spending:{name:'支出',color:'#9c6c28'},deficit:{name:'赤字',color:'#ad423a'},debt:{name:'债务余额',color:'#526b82'}};
 const fmt=n=>Number(n).toFixed(1);
 function scale(values,zero){
  let lo=Math.min(...values),hi=Math.max(...values),pad=Math.max((hi-lo)*.18,1);lo=zero?0:Math.max(0,lo-pad);hi+=pad;
  const raw=(hi-lo)/5,pow=Math.pow(10,Math.floor(Math.log10(raw))),step=[1,2,5,10].find(n=>n*pow>=raw)*pow;
  lo=Math.floor(lo/step)*step;hi=Math.ceil(hi/step)*step;return {lo,hi,step};
 }
 function render(rows,mode,selected,width=1000,height){
  if(!metrics[mode]||rows.length===0)return '';
  const W=Math.max(260,Math.round(width)),H=height?Math.max(190,Math.round(height)):W<520?275:340,L=W<520?43:62,R=24,T=28,B=36,plotH=H-T-B;
  const values=mode==='balance'?rows.flatMap(r=>[r.revenue,r.spending]):rows.map(r=>r[mode]);
  const axis=scale(values,mode==='deficit'),y=v=>T+(axis.hi-v)/(axis.hi-axis.lo)*plotH,gap=(W-L-R)/rows.length,x=i=>L+gap*(i+.5),stroke=metrics[mode].color;
  let svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="1933至1936年${metrics[mode].name}，单位亿帝国马克"><title>年度${metrics[mode].name}</title>`;
  const last=rows.length-1,bandX=x(last)-gap*.47;
  svg+=`<rect x="${bandX}" y="${T}" width="${gap*.94}" height="${plotH}" fill="#9c6c28" opacity=".05"/><text x="${x(last)}" y="16" text-anchor="middle" class="chart-status">${mode==='debt'?'开局存量':'年度方案'}</text>`;
  for(let v=axis.lo;v<=axis.hi+axis.step*.01;v+=axis.step){const yy=y(v);svg+=`<path d="M${L} ${yy}H${W-R}" class="chart-grid"/><text x="${L-10}" y="${yy+4}" text-anchor="end" class="chart-axis">${v<10?fmt(v):Math.round(v)}</text>`;}
  rows.forEach((r,i)=>{svg+=`<path d="M${x(i)} ${T}V${H-B}" class="chart-grid vertical"/><text x="${x(i)}" y="${H-12}" text-anchor="middle" class="chart-year${r.year===selected?' active':''}">${r.year}</text>`;});
  const chosen=rows.findIndex(r=>r.year===selected);
  if(chosen>=0)svg+=`<path d="M${x(chosen)} ${T}V${H-B}" class="chart-crosshair"/>`;
  const series=mode==='balance'?['revenue','spending']:[mode];
  for(const key of series){const color=metrics[key].color;
   for(let i=1;i<rows.length;i++)svg+=`<path data-finance-series="${key}" d="M${x(i-1)} ${y(rows[i-1][key])}L${x(i)} ${y(rows[i][key])}" stroke="${color}" stroke-width="2" fill="none" ${i===last?'stroke-dasharray="5 4"':''}/>`;
   rows.forEach((r,i)=>{const yy=y(r[key]);svg+=`<circle data-series="${key}" data-value="${fmt(r[key])}" cx="${x(i)}" cy="${yy}" r="${r.year===selected?5:3.5}" fill="${i===last?'#faf6e8':color}" stroke="${color}" stroke-width="2"/>`;if(r.year===selected)svg+=`<text x="${x(i)}" y="${yy+(mode==='balance'&&key==='revenue'?18:-13)}" text-anchor="middle" class="chart-value">${fmt(r[key])}</text>`;});
  }
  rows.forEach((r,i)=>{svg+=`<rect x="${x(i)-gap*.5}" y="${T}" width="${gap}" height="${plotH}" fill="transparent" data-chart-year="${r.year}" tabindex="0" role="button" aria-label="查看${r.year}年${metrics[mode].name}" aria-pressed="${r.year===selected}"><title>${r.year}年：收入${fmt(r.revenue)}，支出${fmt(r.spending)}，赤字${fmt(r.deficit)}，债务${fmt(r.debt)}</title></rect>`;});
  return svg+'</svg>';
 }
 return {metrics,render,scale};
});
