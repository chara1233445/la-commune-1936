(()=>{'use strict';
 const buttons=document.querySelectorAll('[data-action-filter]');
 buttons.forEach(button=>button.addEventListener('click',()=>{
  const filter=button.dataset.actionFilter;
  document.querySelectorAll('[data-action-card]').forEach(card=>{card.hidden=filter!=='all'&&card.dataset.category!==filter;});
  buttons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
 }));
 const board=document.querySelector('.finance-board');
 if(!board||!window.FinanceChart)return;
 const data=JSON.parse(document.querySelector('#department-data').textContent),rows=data.financeHistory,chart=window.FinanceChart;
 const plot=board.querySelector('.finance-plot'),slot=document.querySelector('#finance-slot'),dialog=document.querySelector('#finance-dialog');
 dialog.querySelector('.finance-dialog-bar span').textContent='财政收支 · COMPTES PUBLICS · 亿帝国马克';
 let mode='balance',year=rows.at(-1).year;
 function draw(){plot.innerHTML=chart.render(rows,mode,year,plot.clientWidth||1000,dialog.open?Math.min(340,Math.max(190,window.innerHeight-410)):undefined);}
 function update(){
  const i=rows.findIndex(r=>r.year===year),r=rows[i],previous=rows[i-1];
  board.querySelector('[data-finance-year-title]').textContent=year;
  board.querySelector('[data-finance-state]').textContent=r.status;
  for(const key of ['revenue','spending','deficit','debt']){
   board.querySelector(`[data-finance-value="${key}"]`).textContent=r[key].toFixed(1);
   let note='起始参考年';
   if(key==='debt')note=year===1936?'开局存量':'年末存量';
   else if(previous){const delta=r[key]-previous[key];note=`较${previous.year} ${delta>=0?'+':''}${delta.toFixed(1)}`;}
   board.querySelector(`[data-finance-comparison="${key}"]`).textContent=note;
  }
  board.querySelectorAll('[data-finance-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.financeMode===mode)));
  board.querySelectorAll('[data-finance-year]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.financeYear)===year)));
  board.querySelector('[data-finance-chart-title]').textContent=mode==='balance'?'年度收支对照':`年度${chart.metrics[mode].name}`;
  const legend=board.querySelector('[data-finance-chart-key]');
  if(mode==='balance')legend.innerHTML='<span class="finance-legend-income">收入</span><span class="finance-legend-spending">支出</span>';
  else legend.textContent=mode==='debt'?'1933—1935年末 · 1936开局':'1933—1935回溯估计 · 1936年度方案';
  draw();
 }
 board.querySelectorAll('[data-finance-mode]').forEach(b=>b.addEventListener('click',()=>{mode=b.dataset.financeMode;update();}));
 board.querySelectorAll('[data-finance-year]').forEach(b=>b.addEventListener('click',()=>{year=Number(b.dataset.financeYear);update();}));
 function selectFromPlot(event){const target=event.target.closest('[data-chart-year]');if(!target)return;const next=Number(target.dataset.chartYear);if(next!==year){year=next;update();}}
 plot.addEventListener('pointermove',event=>{if(event.pointerType==='mouse')selectFromPlot(event);});
 plot.addEventListener('click',selectFromPlot);
 plot.addEventListener('keydown',event=>{const target=event.target.closest('[data-chart-year]');if(!target)return;if(event.key==='Enter'||event.key===' '){event.preventDefault();selectFromPlot(event);}else if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();const index=rows.findIndex(r=>r.year===Number(target.dataset.chartYear));year=rows[Math.max(0,Math.min(rows.length-1,index+(event.key==='ArrowRight'?1:-1)))].year;update();plot.querySelector(`[data-chart-year="${year}"]`).focus();}});
 const expand=board.querySelector('[data-finance-expand]');
 function restore(){slot.append(board);expand.textContent='展开图表 ↗';draw();expand.focus();}
 expand.addEventListener('click',()=>{if(dialog.open){dialog.close();return;}dialog.querySelector('.finance-dialog-body').append(board);expand.textContent='收起图表 ↙';dialog.showModal();draw();});
 dialog.querySelector('[data-finance-close]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',restore);
 if(window.ResizeObserver)new ResizeObserver(draw).observe(plot);else window.addEventListener('resize',draw);
 update();
})();
