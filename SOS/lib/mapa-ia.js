/* Preguntar a la IA des del mapa · fase 7, el mapa en un taller tàctil
 * ─────────────────────────────────────────────────────────────────────────────
 * Sobre tot el mapa, un rol o un flux: «què hi falta?» o «millora-ho». Torna
 * una proposta per marcar, i el que entra es pot desfer amb ↶. La intenció és
 * «millora_mapa», a lib/ia-intents.js. Fora de l'app perquè només pesa quan
 * algú la fa servir.
 *
 *   MapaIa({ modal, closeModal, esc, AI, guardaMapa, persist, renderWorkspace, toast, uid, isIntangible })(node, focus)
 *   focus: '' | 'r:<id rol>' | 'f:<id flux>'
 */
var MapaIa = function (D) {
var modal=D.modal,closeModal=D.closeModal,esc=D.esc,AI=D.AI,guardaMapa=D.guardaMapa,persist=D.persist,renderWorkspace=D.renderWorkspace,toast=D.toast,uid=D.uid,isIntangible=D.isIntangible;
return function (node,focus){
  const R=node.vna.roles,E=node.vna.exchanges,nm=id=>(R.find(r=>r.id===id)||{}).name||'—',o=(v,t)=>'<option value="'+v+'"'+(focus===v?' selected':'')+'>'+esc(t)+'</option>';
  let q='falta',P=null;
  const bg=modal('<h2>✨ Pregunta a la IA</h2><p class="m-sub">Sobre el mapa tal com és ara. Et proposa canvis i la sala tria quins entren; tot es pot desfer amb ↶.</p>'
    +'<label class="ia-l">On mira <select id="iaOn">'+o('','Tot el mapa')+R.map(r=>o('r:'+r.id,r.name)).join('')+E.map(e=>o('f:'+e.id,nm(e.from)+' → '+nm(e.to)+': '+(e.label||''))).join('')+'</select></label>'
    +'<div class="ia-q lents"><button class="lent sel" data-q="falta" type="button">Què hi falta?</button><button class="lent" data-q="millora" type="button">Millora-ho</button></div>'
    +'<input id="iaTxt" maxlength="200" placeholder="O pregunta-ho amb les teves paraules (opcional)" style="width:100%"><div id="iaOut" aria-live="polite"></div>',
    [{txt:'Tanca',cls:'btn btn-ghost',fn:closeModal},{txt:'✨ Pregunta',cls:'btn btn-primary',fn:()=>pregunta()}]);
  const out=bg.querySelector('#iaOut');
  bg.querySelectorAll('.ia-q .lent').forEach(b=>b.onclick=()=>{q=b.dataset.q;bg.querySelectorAll('.ia-q .lent').forEach(x=>x.classList.toggle('sel',x===b));});
  const fl=E.map((e,i)=>({id:'f'+(i+1),ex:e.id,from:nm(e.from),to:nm(e.to),kind:isIntangible(e.kind)?'intangible':'tangible',label:e.label||''}));
  const pregunta=async()=>{const on=bg.querySelector('#iaOn').value,f=on[0]==='f'&&fl.find(x=>x.ex===on.slice(2));
    const ctx={nom:node.name,missio:node.vna.mission||node.mission||'',rols:R.map(r=>r.name),fluxos:fl,pregunta:q,text:bg.querySelector('#iaTxt').value.trim(),
      focus:on?(f?{flux:f.id}:{rol:nm(on.slice(2))}):null};
    out.innerHTML='<p class="m-sub">✨ Pensant…</p>';
    try{P=await AI.call('millora_mapa',ctx);}catch(e){out.innerHTML='<div class="ai-note"><span class="ic">⚠</span><span>'+esc(e.noKey?'Cal una clau d\'IA a Configuració. El mapa funciona sencer sense.':(e.msg||'Error'))+'</span></div>';return;}
    const ch=(k,i,t,w)=>'<label class="ia-c"><input type="checkbox" checked data-k="'+k+'" data-i="'+i+'"> <span>'+t+(w?' <small>'+esc(w)+'</small>':'')+'</span></label>';
    const n=P.rols.length+P.fluxos.length+P.noms.length;
    out.innerHTML='<p class="ia-lec">'+esc(P.lectura)+'</p>'
      +P.rols.map((r,i)=>ch('rols',i,'＋ Rol: <b>'+esc(r.nom)+'</b>',r.perque)).join('')
      +P.fluxos.map((x,i)=>ch('fluxos',i,'＋ '+esc(x.from+' → '+x.to)+': <b>'+esc(x.label)+'</b> ('+x.kind+')',x.perque)).join('')
      +P.noms.map((x,i)=>ch('noms',i,'✎ '+esc((fl.find(y=>y.id===x.id)||{}).label||'')+' → <b>'+esc(x.label)+'</b>',x.perque)).join('')
      +(n?'<button class="btn btn-primary" id="iaAplica" type="button">Afegeix el que has marcat</button>':'<p class="m-sub">No proposa cap canvi.</p>');
    if(n)out.querySelector('#iaAplica').onclick=aplica;};
  const aplica=async()=>{const t={rols:[],fluxos:[],noms:[]};out.querySelectorAll('input[data-k]:checked').forEach(c=>t[c.dataset.k].push(P[c.dataset.k][+c.dataset.i]));
    if(!t.rols.length&&!t.fluxos.length&&!t.noms.length)return closeModal();
    guardaMapa(node);t.rols.forEach(r=>R.push({id:uid(),name:r.nom}));
    const id=n=>(R.find(r=>r.name.toLowerCase()===n.toLowerCase())||{}).id;
    t.fluxos.forEach(x=>{const a=id(x.from),b=id(x.to);if(a&&b)E.push({id:uid(),from:a,to:b,kind:x.kind,label:x.label});});
    t.noms.forEach(x=>{const e=E.find(y=>y.id===(fl.find(z=>z.id===x.id)||{}).ex);if(e)e.label=x.label;});
    closeModal();await persist(node);renderWorkspace();toast('Afegit al mapa. ↶ ho desfà');};
  setTimeout(()=>bg.querySelector('.btn-primary').focus(),30);
};
};
if (typeof module !== 'undefined') module.exports = MapaIa;
