/* Les intencions de la IA del SOS · fora de l'app, que no pesin a cada visita
 * ─────────────────────────────────────────────────────────────────────────────
 * Cada crida a Claude és una intenció catalogada: model, sostre de tokens,
 * instruccions, eina amb la forma de sortida declarada, com es munta el
 * missatge (build) i com es neteja la resposta (coerce). Els prompts humans
 * viuen a SOS/prompts/*.md; aquí hi ha la còpia executable.
 *
 * Abans vivien dins SOS/index.html (uns 13 KB gzip que es baixaven sempre,
 * i només calen quan algú demana IA). L'app la carrega amb `AI.carrega()`
 * la primera vegada que en necessita una, i li passa les cinc peces del mòdul
 * que les intencions fan servir.
 *
 *   IaIntents({ LEVEL_META, PANTHEON12, SKILL_POLARITY, entityTypesFor, knowFor }) → { nom: { model, max_tokens, system, tool, build, coerce } }
 */
var IaIntents = function (E) {
var LEVEL_META=E.LEVEL_META,PANTHEON12=E.PANTHEON12,SKILL_POLARITY=E.SKILL_POLARITY,entityTypesFor=E.entityTypesFor,knowFor=E.knowFor;
return {
  suggest_map:{
    model:'claude-opus-4-8',max_tokens:2000,
    system:'Ets qui acompanya una sessió de mapa de valor amb el mètode de Verna Allee\n(Value Network Analysis). Proposes un esborrany perquè una sala el validi:\nno decideixes res. Escrius en la llengua de qui t\'ho demana.\n\nUN MAPA DE VALOR ÉS UN GRAF DE ROLS QUE S\'INTERCANVIEN ENTREGABLES.\nTres elements i no més:\n· Rol — el que algú FA. No un càrrec, no una persona, no un departament.\n· Transacció — va d\'un rol a un altre i té direcció.\n· Entregable — la cosa que viatja, dita amb NOM i no amb verb, i el criteri\n  és que es pugui comprovar si ha arribat.\n\nTANGIBLE O INTANGIBLE ES DECIDEIX PEL CONTRACTE, NO PER LA MATÈRIA.\nTangible és el que avui algú pot reclamar: comanda, servei, factura, informe\nprevist al contracte. Intangible és el que s\'espera i no s\'exigeix: un avís,\nun favor, coneixement de procés, accés, reputació, confiança, un consell.\nEl mateix informe és tangible si el contracte el preveu i intangible si es\ndona de franc per mantenir la relació.\n\nLES REGLES QUE LA TEVA PROPOSTA HA DE COMPLIR:\n1. Hi ha un abast escrit.\n2. Entre 6 i 12 rols.\n3. Com a mínim un terç de transaccions intangibles.\n4. Tot vincle és recíproc.\n5. Cap rol solt.\n6. Densitat ≥ 40 %.\n7. Cap rol concentra més del 40 %.\n8. Cap xifra que no es pugui refer.\n9. Cap nom propi de persona ni d\'empresa.\n10. Més d\'un procés, i el que passa «sempre» marcat.\n\nI TRES COSES QUE NO SÓN NEGOCIABLES:\n· Si un rol necessari no existeix a la casa, AIXÒ ÉS LA TROBALLA: digues\n  «aquest node avui no és de ningú». No el dibuixis com si hi fos.\n· Si el que et demanen no cap en dotze rols, no ampliïs el mapa: proposa\n  partir-lo per nivells i digues quin nivell estàs dibuixant.\n· Cada rol i cada transacció s\'han de poder esborrar sense que la resta es\n  trenqui. És un esborrany per validar.',
    tool:{name:'proposar_mapa_valor',description:'Retorna el mapa de valor VNA proposat.',input_schema:{type:'object',properties:{mission:{type:'string'},roles:{type:'array',items:{type:'string'}},exchanges:{type:'array',items:{type:'object',properties:{from:{type:'string'},to:{type:'string'},kind:{type:'string',enum:['tangible','intangible']},label:{type:'string'}},required:['from','to','kind','label']}}},required:['mission','roles','exchanges']}},
    build:ctx=>{const k=knowFor(ctx.level),meta=LEVEL_META[ctx.level];const picked=k.pains.filter(p=>ctx.painIds&&ctx.painIds.has(p.id)).map(p=>p.t+' — '+p.d);const txt=['Nivell: '+meta.label+(ctx.name?' · "'+ctx.name+'"':''),ctx.promptText?'Context de la comunitat: '+ctx.promptText:'',picked.length?'Reptes prioritzats: '+picked.join('; '):'','Rols de referència del nivell: '+k.roles.join(', ')].filter(Boolean).join('\n');return 'Proposa el mapa de valor per a aquesta comunitat:\n\n'+txt;},
    coerce:tu=>{const roles=[...new Set((tu.roles||[]).map(r=>String(r).trim()).filter(Boolean))];const rl=new Set(roles.map(r=>r.toLowerCase()));const exchanges=(tu.exchanges||[]).filter(x=>x&&x.from&&x.to&&rl.has(String(x.from).toLowerCase())&&rl.has(String(x.to).toLowerCase())).map(x=>({from:String(x.from).trim(),to:String(x.to).trim(),kind:x.kind==='intangible'?'intangible':'tangible',label:(x.label||'').trim()}));return{mission:(tu.mission||'').trim(),roles,exchanges};}
  },
  /* Preguntar des del mapa, en un taller (fase 7): el mapa tal com és, i si cal
     un rol o un flux on mirar. Torna canvis petits per marcar; l'app els afegeix
     només si la sala els tria, i ↶ els desfà. */
  millora_mapa:{
    model:'claude-sonnet-5-5',max_tokens:1500,
    system:'Acompanyes un taller de mapa de valor amb el mètode de Verna Allee (Value Network Analysis).\nEt donen el mapa tal com és ara i, de vegades, un rol o un flux on mirar. Proposes canvis petits\nperquè la sala els validi: no decideixes res. Escrius en la llengua del mapa.\n\nRegles:\n· Rol = el que algú FA, no una persona ni un càrrec. Cap nom de persona.\n· Flux = entregable que viatja d\'un rol a un altre, dit amb NOM (no amb verb) i comprovable.\n· Tangible si es pot tocar, comptar o facturar; intangible si és coneixement, confiança, reputació.\n· Cada rol hauria de donar i rebre. Un mapa sa té fluxos intangibles, no només diners i producte.\n· No repeteixis el que ja hi és. Com a molt 3 rols nous i 6 fluxos nous.\n· Per reanomenar un flux, fes servir el seu id (f1, f2...).\n· Cap import ni preu.\n· La lectura és de dues o tres frases, planera, per dir-la en veu alta a la sala.',
    tool:{name:'proposta_mapa',description:'Retorna la lectura i els canvis proposats.',input_schema:{type:'object',properties:{lectura:{type:'string'},rols:{type:'array',items:{type:'object',properties:{nom:{type:'string'},perque:{type:'string'}},required:['nom']}},fluxos:{type:'array',items:{type:'object',properties:{from:{type:'string'},to:{type:'string'},kind:{type:'string',enum:['tangible','intangible']},label:{type:'string'},perque:{type:'string'}},required:['from','to','kind','label']}},noms:{type:'array',items:{type:'object',properties:{id:{type:'string'},label:{type:'string'},perque:{type:'string'}},required:['id','label']}}},required:['lectura']}},
    build:ctx=>{const f=ctx.fluxos||[],on=ctx.focus;const q=ctx.text||(ctx.pregunta==='millora'?'Millora-ho: noms més clars, fluxos que no tornen, rols que només reben o només donen.':'Què hi falta? Rols o fluxos que una xarxa com aquesta sol tenir i aquí no hi són.');
      return ['Mapa'+(ctx.nom?' «'+ctx.nom+'»':'')+(ctx.missio?' · missió: '+ctx.missio:''),'Rols: '+(ctx.rols||[]).join(', '),'Fluxos:',...f.map(x=>'- '+x.id+' · '+x.from+' → '+x.to+' · '+x.kind+' · '+x.label),
        on?'Mira sobretot '+(on.flux?'el flux '+on.flux:'el rol «'+on.rol+'»')+'.':'Mira tot el mapa.','Pregunta de la sala: '+q].join('\n');},
    coerce:(tu,ctx)=>{const c=ctx||{},net=v=>String(v||'').trim(),ja=new Set((c.rols||[]).map(r=>r.toLowerCase()));
      const rols=(tu.rols||[]).map(r=>({nom:net(r.nom),perque:net(r.perque)})).filter(r=>r.nom&&!ja.has(r.nom.toLowerCase())).slice(0,3);
      const tots={};(c.rols||[]).concat(rols.map(r=>r.nom)).forEach(n=>{tots[n.toLowerCase()]=n;});
      const hi=new Set((c.fluxos||[]).map(x=>(x.from+'|'+x.to+'|'+x.label).toLowerCase())),ids=new Set((c.fluxos||[]).map(x=>x.id));
      const fluxos=(tu.fluxos||[]).map(x=>({from:tots[net(x.from).toLowerCase()],to:tots[net(x.to).toLowerCase()],kind:x.kind==='intangible'?'intangible':'tangible',label:net(x.label),perque:net(x.perque)}))
        .filter(x=>x.from&&x.to&&x.from!==x.to&&x.label&&!hi.has((x.from+'|'+x.to+'|'+x.label).toLowerCase())).slice(0,6);
      const noms=(tu.noms||[]).map(x=>({id:net(x.id),label:net(x.label),perque:net(x.perque)})).filter(x=>ids.has(x.id)&&x.label);
      return{lectura:net(tu.lectura),rols,fluxos,noms};}
  },
  /* ═══════ ELS ENTREGABLES · dos, i no vuit ═══════
     El pla deia de provar el patró amb dos abans de declarar-ne vuit, i aquests
     són els dos: els més repetitius i els menys arriscats. Si el primer que es
     mesura —quants s'accepten sense tocar— surt baix, el problema no és la IA:
     és que el mapa no és prou bo, i això també és informació venedora.

     Les tres regles que valen per als dos i que no es relaxen:

     · **Es prepara un esborrany, no es publica res.** El que torna va a una
       pantalla amb un botó d'acceptar, i fins que algú no el prem no existeix.
     · **Només amb el que se li dona.** Si una dada no és al context, l'eina ha
       de deixar el buit marcat i no omplir-lo: un forat visible es corregeix i
       una invenció versemblant no la troba ningú.
     · **Cap nom de persona.** El context porta rols i xifres, no qui és qui.
       Un entregable amb noms el completa després qui l'accepta. */
  entregable_acta:{
    model:'claude-opus-4-8',max_tokens:1500,
    system:'Ets qui pren acta a reunions de projectes comunitaris i cooperatius a Catalunya. Escrius en català, clar i curt, sense floritures.\n\nREGLES QUE NO POTS TRENCAR:\n1. Només pots escriure el que et donin. Si falta una dada (qui hi era, una xifra, una data), escriu-hi «[a completar]» i segueix. MAI te la inventis: un forat marcat es corregeix en deu segons i una dada versemblant inventada no la detecta ningú.\n2. No escriguis noms de persona encara que te\'n donin: fes servir el rol. Qui accepti l\'acta ja hi posarà els noms.\n3. Un acord sense responsable i sense data no és un acord: marca\'l com a pendent de concretar.\n\nRespon només cridant l\'eina.',
    tool:{name:'acta',description:'Retorna l\'esborrany d\'acta.',input_schema:{type:'object',properties:{titol:{type:'string'},data:{type:'string'},assistents:{type:'array',items:{type:'string'},description:'Rols, mai noms.'},acords:{type:'array',items:{type:'object',properties:{que:{type:'string'},qui:{type:'string'},quan:{type:'string'}},required:['que','qui','quan']}},pendents:{type:'array',items:{type:'string'}},buits:{type:'array',items:{type:'string'},description:'El que falta i s\'ha marcat com a [a completar].'}},required:['titol','acords','buits']}},
    build:ctx=>['Node: '+(ctx.node||''),'Flux del mapa: '+(ctx.flux||''),
      ctx.rols?'Rols del mapa: '+ctx.rols.join(', '):'',
      ctx.notes?'El que s\'ha dit:\n'+ctx.notes:'(No s\'han donat notes de la reunió: marca com a [a completar] tot el que no es pugui deduir del flux.)'
      ].filter(Boolean).join('\n'),
    coerce:tu=>({titol:(tu.titol||'').trim(),data:(tu.data||'').trim(),
      assistents:(tu.assistents||[]).map(x=>String(x).trim()).filter(Boolean),
      acords:(tu.acords||[]).map(a=>({que:(a.que||'').trim(),qui:(a.qui||'').trim(),quan:(a.quan||'').trim()})),
      pendents:(tu.pendents||[]).map(x=>String(x).trim()).filter(Boolean),
      buits:(tu.buits||[]).map(x=>String(x).trim()).filter(Boolean)})
  },
  entregable_informe:{
    model:'claude-opus-4-8',max_tokens:2000,
    system:'Ets qui redacta informes de seguiment de projectes comunitaris i cooperatius a Catalunya, per a juntes i per a justificacions. Català, clar, sense adjectius que no aportin res.\n\nREGLES QUE NO POTS TRENCAR:\n1. **Les xifres són les que et donin i cap més.** No arrodoneixis cap a dalt, no projectis, no estimis. Si et falta una xifra, escriu «[a completar]».\n2. Les xifres del SOS són estimacions amb forquilla, no comptabilitat: digues-ho quan en facis servir.\n3. No escriguis noms de persona: rols.\n4. Si les dades no donen per treure cap conclusió, digues-ho. Un informe que conclou de no res és pitjor que un informe curt.\n\nRespon només cridant l\'eina.',
    tool:{name:'informe',description:'Retorna l\'esborrany d\'informe periòdic.',input_schema:{type:'object',properties:{titol:{type:'string'},periode:{type:'string'},resum:{type:'string'},fets:{type:'array',items:{type:'string'},description:'El que ha passat, amb la xifra al costat.'},avisos:{type:'array',items:{type:'string'},description:'El que reclama atenció.'},buits:{type:'array',items:{type:'string'}}},required:['titol','resum','fets','buits']}},
    build:ctx=>['Node: '+(ctx.node||''),'Període: '+(ctx.periode||'[a completar]'),
      'Flux del mapa: '+(ctx.flux||''),
      ctx.xifres&&ctx.xifres.length?'Xifres del registre (estimacions amb forquilla):\n'+ctx.xifres.map(x=>'· '+x).join('\n'):'(Sense xifres al registre per a aquest període.)',
      ctx.rols?'Rols del mapa: '+ctx.rols.join(', '):''
      ].filter(Boolean).join('\n'),
    coerce:tu=>({titol:(tu.titol||'').trim(),periode:(tu.periode||'').trim(),
      resum:(tu.resum||'').trim(),
      fets:(tu.fets||[]).map(x=>String(x).trim()).filter(Boolean),
      avisos:(tu.avisos||[]).map(x=>String(x).trim()).filter(Boolean),
      buits:(tu.buits||[]).map(x=>String(x).trim()).filter(Boolean)})
  },
  /* El tercer, i el més barat dels que quedaven: una convocatòria és curta, es
     fa moltes vegades i **si s'equivoca es veu de seguida** —la gent no ve, o
     ve on no toca. Aquesta és la raó per posar-lo abans que la justificació de
     subvenció, que és el que més estalvia i alhora el que més mal fa si falla:
     allà un error no el veu ningú fins que el veu qui no toca. */
  entregable_convocatoria:{
    model:'claude-opus-4-8',max_tokens:1200,
    system:'Ets qui escriu convocatòries de reunions i activitats per a projectes comunitaris i cooperatius a Catalunya. Català planer, frases curtes, res de retòrica. La gent ho llegirà al mòbil i en deu segons.\n\nREGLES QUE NO POTS TRENCAR:\n1. Només pots escriure el que et donin. Si no saps la data, l\'hora o el lloc, escriu «[a completar]». MAI te la inventis: una convocatòria amb una hora inventada fa que la gent es presenti quan no toca, i això no es pot desfer.\n2. No escriguis noms de persona: digues el rol. Qui accepti la convocatòria ja hi posarà els noms.\n3. No prometis res que no et diguin: ni àpat, ni transport, ni servei de canalla, ni que hi haurà ningú en concret.\n4. El text per als canals ha de cabre en un missatge curt i ha de dir què, quan i on a la primera línia.\n\nRespon només cridant l\'eina.',
    tool:{name:'convocatoria',description:'Retorna l\'esborrany de convocatòria.',input_schema:{type:'object',properties:{titol:{type:'string'},que:{type:'string',description:'De què va, en una o dues frases.'},quan:{type:'string'},on:{type:'string'},ordre:{type:'array',items:{type:'string'},description:'Ordre del dia, punt per punt.'},qui:{type:'array',items:{type:'string'},description:'Rols convocats, mai noms.'},confirmar:{type:'string',description:'Com es confirma l\'assistència.'},canal:{type:'string',description:'Text curt per enviar pels canals.'},buits:{type:'array',items:{type:'string'},description:'El que falta i s\'ha marcat com a [a completar].'}},required:['titol','que','ordre','canal','buits']}},
    build:ctx=>['Node: '+(ctx.node||''),'Flux del mapa: '+(ctx.flux||''),
      ctx.rols?'Rols del mapa (els convocables): '+ctx.rols.join(', '):'',
      ctx.notes?'El que se sap de la trobada:\n'+ctx.notes:'(No s\'ha donat cap detall: marca com a [a completar] la data, l\'hora i el lloc, i deriva l\'ordre del dia del flux.)'
      ].filter(Boolean).join('\n'),
    coerce:tu=>({titol:(tu.titol||'').trim(),que:(tu.que||'').trim(),
      quan:(tu.quan||'').trim(),on:(tu.on||'').trim(),
      ordre:(tu.ordre||[]).map(x=>String(x).trim()).filter(Boolean),
      qui:(tu.qui||[]).map(x=>String(x).trim()).filter(Boolean),
      confirmar:(tu.confirmar||'').trim(),canal:(tu.canal||'').trim(),
      buits:(tu.buits||[]).map(x=>String(x).trim()).filter(Boolean)})
  },
  /* El quart, i el que decideix si aquesta línia és seriosa. És el que més
     estalvia —una justificació són hores de feina enganxant dades— i alhora el
     que més mal fa si falla: un error aquí no el veu ningú fins que el veu qui
     revisa l'expedient, i llavors ja no és una correcció sinó un reintegrament.

     Per això aquest intent té una línia que els altres tres no tenen: **escriu
     la memòria d'activitat i NO omple la taula de despesa**. Les xifres del
     SOS són estimacions amb forquilla de ±30 % (`FUND_UNCERTAINTY`); una
     memòria admet una estimació dita com a tal i una taula de despesa no admet
     res que no surti d'una factura. La taula surt igualment, amb els conceptes
     i amb els imports a «[a completar]» i el document que caldrà per a
     cadascun —que és feina feta— però els números els hi posa una persona amb
     els papers a la mà.

     Dit d'una altra manera: aquí la màquina no s'atura perquè no sàpiga, sinó
     perquè **sap que el que sap no serveix per a aquesta casella**. */
  entregable_justificacio:{
    model:'claude-opus-4-8',max_tokens:2600,
    system:'Ets qui redacta justificacions de subvenció per a entitats comunitàries i cooperatives a Catalunya. Català, sec i ordenat: això ho llegeix qui revisa expedients, no qui vol emocionar-se.\n\nLA REGLA QUE NO POTS TRENCAR DE CAP MANERA:\nLes xifres del SOS són ESTIMACIONS amb forquilla de ±30 %, no comptabilitat. En una memòria d\'activitat hi caben dites com el que són —«estimació», amb la forquilla al costat. A LA TAULA DE DESPESA NO HI CABEN MAI: aquella taula és comptabilitat i es contrasta amb factures. Cada línia de despesa que no et donin explícitament l\'has de deixar amb l\'import «[a completar]» i dir quin document caldrà (factura, nòmina, rebut). Posar-hi una estimació és el pitjor error possible d\'aquest document: no el detecta ningú fins que el detecta qui revisa, i llavors ja és un reintegrament.\n\nLES ALTRES REGLES:\n1. Només pots escriure el que et donin. Si falta una dada, «[a completar]». MAI te la inventis.\n2. No escriguis noms de persona: rols. Qui accepti la justificació ja hi posarà els noms.\n3. La forma la mana la convocatòria, no tu. Si et diuen quins apartats demana, fes aquells i en aquell ordre. Si no te\'ls diuen, digues-ho als buits: sense la convocatòria el document no es pot donar per bo.\n4. Als avisos hi va el que faria que la justificació es tombi: terminis, documents que falten, despeses sense factura.\n\nRespon només cridant l\'eina.',
    tool:{name:'justificacio',description:'Retorna l\'esborrany de justificació.',input_schema:{type:'object',properties:{titol:{type:'string'},convocatoria:{type:'string',description:'Quina convocatòria justifica.'},periode:{type:'string'},memoria:{type:'string',description:'Memòria d\'activitat, en prosa. Les estimacions van dites com a estimacions.'},activitats:{type:'array',items:{type:'object',properties:{que:{type:'string'},quan:{type:'string'},indicador:{type:'string'}},required:['que','quan']}},despeses:{type:'array',items:{type:'object',properties:{concepte:{type:'string'},import:{type:'string',description:'Només si te\'l donen. Si no, «[a completar]».'},document:{type:'string',description:'Quin paper caldrà per justificar-lo.'}},required:['concepte','import','document']}},avisos:{type:'array',items:{type:'string'},description:'El que faria que la justificació es tombi.'},buits:{type:'array',items:{type:'string'}}},required:['titol','memoria','despeses','avisos','buits']}},
    build:ctx=>['Node: '+(ctx.node||''),'Període: '+(ctx.periode||'[a completar]'),
      ctx.flux?'Flux del mapa: '+ctx.flux:'',
      ctx.activitat&&ctx.activitat.length?'Activitat registrada (per al text de la memòria):\n'+ctx.activitat.map(x=>'· '+x).join('\n'):'(Sense activitat registrada: la memòria no es pot escriure sola, digues-ho als buits.)',
      ctx.xifres&&ctx.xifres.length?'Xifres del SOS. Fixa\'t en quines diuen ESTIMACIÓ: aquelles no poden anar a la taula de despesa.\n'+ctx.xifres.map(x=>'· '+x).join('\n'):'(Cap xifra al registre.)',
      ctx.rols?'Rols del mapa: '+ctx.rols.join(', '):'',
      ctx.notes?'El que demana la convocatòria:\n'+ctx.notes:'(No s\'ha enganxat la convocatòria: no en saps la forma. Digues-ho als buits com el primer que falta.)'
      ].filter(Boolean).join('\n'),
    coerce:tu=>({titol:(tu.titol||'').trim(),convocatoria:(tu.convocatoria||'').trim(),
      periode:(tu.periode||'').trim(),memoria:(tu.memoria||'').trim(),
      activitats:(tu.activitats||[]).map(a=>({que:(a.que||'').trim(),quan:(a.quan||'').trim(),indicador:(a.indicador||'').trim()})),
      despeses:(tu.despeses||[]).map(d=>({concepte:(d.concepte||'').trim(),
        /* Si torna un import buit, es força el marcatge: un import en blanc
           dins d'una taula de despesa es llegeix com un zero. */
        import:(d.import||'').trim()||'[a completar]',document:(d.document||'').trim()})),
      avisos:(tu.avisos||[]).map(x=>String(x).trim()).filter(Boolean),
      buits:(tu.buits||[]).map(x=>String(x).trim()).filter(Boolean)})
  },
  /* ── Els tres últims, i cadascun topa amb una línia diferent de la casa ──
     Fins aquí el patró era el mateix: donar context, prohibir inventar, marcar
     els buits. Aquests tres no hi caben tal qual, i el que els fa defensables
     és justament allò amb què topen. */

  /* INVENTARI · la taula ja la té el node.
     Nom, tipologia, estat, valor estimat, desgast i qui n'és responsable són
     dades que hi són. Demanar-li la taula seria demanar-li que copiés una base
     de dades —i una còpia pot equivocar-se mentre l'original no. El que sí que
     no hi ha és **la lectura**: què cal arreglar, què no es troba, què sobra. */
  entregable_inventari:{
    model:'claude-opus-4-8',max_tokens:1800,
    system:'Ets qui posa ordre a l\'inventari d\'una biblioteca de les coses o d\'un local comunitari a Catalunya. Català sec. Escrius la LECTURA de l\'inventari, no l\'inventari: la taula ja la té el node i te la donen feta.\n\nREGLES QUE NO POTS TRENCAR:\n1. NO POTS AFEGIR CAP OBJECTE que no et donin, ni un. Si la llista és buida, digues que no hi ha res inventariat i prou: un inventari amb objectes inventats fa que algú vagi a buscar una cosa que no existeix.\n2. Els valors que et donen són ESTIMACIONS amb forquilla. Quan els facis servir, digues-ho. No en sumis cap total: la suma d\'estimacions no és un import.\n3. Només pots escriure el que et donin. Si falta una dada, «[a completar]». MAI te la inventis.\n4. No escriguis noms de persona: rols o «el comú».\n\nRespon només cridant l\'eina.',
    tool:{name:'inventari',description:'Retorna la lectura de l\'inventari.',input_schema:{type:'object',properties:{titol:{type:'string'},resum:{type:'string',description:'Què hi ha, en dues frases.'},arreglar:{type:'array',items:{type:'object',properties:{objecte:{type:'string'},que:{type:'string'}},required:['objecte','que']},description:'Només objectes de la llista donada.'},falten:{type:'array',items:{type:'string'},description:'El que consta i no es troba, o que està prestat i vençut.'},cal:{type:'array',items:{type:'string'},description:'El que caldria afegir, si t\'ho han dit.'},buits:{type:'array',items:{type:'string'}}},required:['titol','resum','buits']}},
    build:ctx=>{
      const L=['Node: '+(ctx.node||''),ctx.flux?'Flux del mapa: '+ctx.flux:''];
      const ob=ctx.objectes||[];
      if(!ob.length)L.push('LA LLISTA D\'OBJECTES ÉS BUIDA. No inventis cap objecte: digues que no hi ha res inventariat.');
      else{L.push('Objectes del node ('+ob.length+'). Aquesta és la llista sencera i no pots afegir-hi res:');
        ob.forEach(o=>L.push('· '+o.nom+' · '+o.tipologia+' · '+(o.mode==='donacio'?'del comú':'a disposició')+
          (o.estat?' · estat: '+o.estat:'')+' · valor '+o.valor+' € ('+o.valorNota+')'+
          ' · desgast acumulat '+o.desgast+'%'+' · '+o.prestecs+' préstecs, '+o.reparacions+' reparacions'+
          (o.prestat?' · PRESTAT'+(o.venciment?' ('+o.venciment+')':''):'')+' · responsable: '+o.responsable));}
      L.push(ctx.notes?'El que has vist tu i no consta a les fitxes:\n'+ctx.notes
        :'(No s\'ha afegit cap observació: limita\'t al que diuen les fitxes.)');
      return L.filter(Boolean).join('\n');
    },
    coerce:tu=>({titol:(tu.titol||'').trim(),resum:(tu.resum||'').trim(),
      arreglar:(tu.arreglar||[]).map(a=>({objecte:(a.objecte||'').trim(),que:(a.que||'').trim()})),
      falten:(tu.falten||[]).map(x=>String(x).trim()).filter(Boolean),
      cal:(tu.cal||[]).map(x=>String(x).trim()).filter(Boolean),
      buits:(tu.buits||[]).map(x=>String(x).trim()).filter(Boolean)})
  },

  /* COMANDA · els totals no els fa la màquina.
     Aquí hi ha diners, i dues vedes de la casa: el SOS no confirma mai un
     cobrament i no demana mai una targeta. Però la línia pròpia d'aquest
     entregable és una altra: **un model que suma una llista de la compra
     s'equivoca alguna vegada i ningú repassa un total.** Per això el model posa
     preu unitari i quantitat, i `totalsComanda` fa l'aritmètica al codi. */
  entregable_comanda:{
    model:'claude-opus-4-8',max_tokens:2000,
    system:'Ets qui organitza comandes i repartiments de grups de consum i cooperatives de consum a Catalunya. Català sec i pràctic: això s\'imprimeix i es porta al repartiment.\n\nREGLES QUE NO POTS TRENCAR:\n1. NO SUMIS RES. Els totals els calcula l\'aplicació a partir de les línies que retornis, no tu. Tu poses el preu unitari i la quantitat de cada línia i prou. Una suma que ningú no repassa és un error que arriba al repartiment.\n2. NO POTS ESTIMAR CAP PREU. Si no te\'l donen, deixa el preu buit: la línia quedarà marcada i fora del total. Un preu inventat en una comanda el paga algú.\n3. Això NO és un cobrament ni un rebut, i no ho pots dir com si ho fos. No escriguis mai que algú ha pagat, ni que un import està cobrat, ni cap manera de pagar. És una llista del que s\'ha demanat.\n4. Només pots escriure el que et donin. Si falta una dada, «[a completar]». MAI te la inventis.\n5. No escriguis noms de persona: digues «llar 1», «llar 2» o el rol.\n\nRespon només cridant l\'eina.',
    tool:{name:'comanda',description:'Retorna l\'esborrany de comanda, sense cap total.',input_schema:{type:'object',properties:{titol:{type:'string'},quan:{type:'string',description:'Quan es reparteix.'},on:{type:'string',description:'Punt de repartiment.'},linies:{type:'array',items:{type:'object',properties:{que:{type:'string'},qui:{type:'string',description:'«llar 1», «llar 2» o el rol. Mai un nom.'},proveidor:{type:'string'},quantitat:{type:'number'},preu:{type:'number',description:'Preu unitari NOMÉS si te\'l donen. Si no, deixa\'l fora.'},unitat:{type:'string'}},required:['que','qui']}},avisos:{type:'array',items:{type:'string'}},buits:{type:'array',items:{type:'string'}}},required:['titol','linies','buits']}},
    build:ctx=>['Node: '+(ctx.node||''),ctx.flux?'Flux del mapa: '+ctx.flux:'',
      ctx.rols?'Rols del mapa: '+ctx.rols.join(', '):'',
      ctx.notes?'Qui ha demanat què, i els preus si n\'hi ha:\n'+ctx.notes
        :'(No s\'ha donat cap petició: no te\'n pots inventar cap. Digues-ho als buits.)',
      'RECORDA: no sumis res. Els totals els calcula l\'aplicació. I si no et donen un preu, deixa\'l fora en comptes d\'estimar-lo.'
      ].filter(Boolean).join('\n'),
    coerce:tu=>({titol:(tu.titol||'').trim(),quan:(tu.quan||'').trim(),on:(tu.on||'').trim(),
      linies:(tu.linies||[]).map(l=>{
        const q=Number(l.quantitat),pr=Number(l.preu);
        return{que:(l.que||'').trim(),qui:(l.qui||'').trim(),proveidor:(l.proveidor||'').trim(),
          unitat:(l.unitat||'').trim(),
          /* Un preu o una quantitat que no arriben com a número no es
             converteixen en zero: es queden en `null` i la línia surt marcada.
             Un zero dins d'una comanda es llegeix com «gratis». */
          quantitat:Number.isFinite(q)&&q>0?q:null,
          preu:Number.isFinite(pr)&&pr>0?pr:null};}),
      avisos:(tu.avisos||[]).map(x=>String(x).trim()).filter(Boolean),
      buits:(tu.buits||[]).map(x=>String(x).trim()).filter(Boolean)})
  },

  /* FITXA · això surt a fora, i passa pel mateix sedàs que una publicació.
     És l'únic entregable que un desconegut llegirà, i per això té el fre més
     dur dels set: si hi ha el nom d'una persona a dins, **no es pot acceptar**.
     No és un avís: és el botó que desapareix. */
  entregable_fitxa:{
    model:'claude-opus-4-8',max_tokens:1200,
    system:'Ets qui escriu fitxes breus per a un directori públic de projectes comunitaris i cooperatius a Catalunya. Català clar i curt: això el llegeix algú de fora que no us coneix i ha de saber en quinze segons si li serveix.\n\nREGLES QUE NO POTS TRENCAR:\n1. AIXÒ ES PUBLICA. No escriguis MAI cap nom de persona, cap telèfon, cap adreça de correu, cap adreça postal exacta ni res que identifiqui ningú. La via de contacte és el canal del node, no la d\'una persona.\n2. Només pots escriure el que et donin. Si falta una dada, «[a completar]». MAI te la inventis: una fitxa pública que promet una cosa que no hi és fa venir gent per res.\n3. No prometis horaris, preus ni serveis que no et diguin.\n4. Res de retòrica: ni «innovador», ni «disruptiu», ni exclamacions. Digues què es fa.\n\nRespon només cridant l\'eina.',
    tool:{name:'fitxa',description:'Retorna l\'esborrany de fitxa pública.',input_schema:{type:'object',properties:{titol:{type:'string'},una:{type:'string',description:'Una línia: què és, per a qui.'},que:{type:'string',description:'Què s\'hi fa, en tres o quatre frases.'},aqui:{type:'array',items:{type:'string'},description:'A qui li serveix.'},com:{type:'string',description:'Com s\'hi arriba, pel canal del node i mai per una persona.'},temes:{type:'array',items:{type:'string'}},buits:{type:'array',items:{type:'string'}}},required:['titol','una','que','buits']}},
    build:ctx=>['Node: '+(ctx.node||''),
      ctx.territori?'On és: '+ctx.territori:'',
      ctx.temes&&ctx.temes.length?'Temes declarats: '+ctx.temes.join(', '):'',
      ctx.rols?'Rols del mapa (què hi ha muntat): '+ctx.rols.join(', '):'',
      ctx.activitat&&ctx.activitat.length?'El que s\'hi mou de debò:\n'+ctx.activitat.map(x=>'· '+x).join('\n'):'',
      ctx.notes?'Què vol dir a fora:\n'+ctx.notes
        :'(No s\'ha dit què vol oferir: deriva-ho dels rols i del que s\'hi mou, i marca als buits el que no se sàpiga.)',
      'RECORDA: això es publica. Cap nom, cap telèfon, cap correu, cap adreça exacta.'
      ].filter(Boolean).join('\n'),
    coerce:tu=>({titol:(tu.titol||'').trim(),una:(tu.una||'').trim(),que:(tu.que||'').trim(),
      aqui:(tu.aqui||[]).map(x=>String(x).trim()).filter(Boolean),
      com:(tu.com||'').trim(),
      temes:(tu.temes||[]).map(x=>String(x).trim()).filter(Boolean),
      buits:(tu.buits||[]).map(x=>String(x).trim()).filter(Boolean)})
  },
  molekulon_invite:{
    model:'claude-opus-4-8',max_tokens:1500,
    system:'Ets un dissenyador de xarxes cooperatives (VNA + Slicing Pie). Donat un molekulon (grup 5-12 superherois) i una necessitat concreta d\'una comunitat, proposa qui d\'ells hi encaixa millor i per què (superpoders + balanç entre obrir i sembrar i tallar i renovar + reputació). Sortida sempre via l\'eina.',
    tool:{name:'proposar_matching',description:'Retorna la proposta de matching entre superherois i necessitat.',input_schema:{type:'object',properties:{best:{type:'array',items:{type:'object',properties:{name:{type:'string'},reason:{type:'string'},shakti_shiva:{type:'string'}},required:['name','reason']}},gap:{type:'string',description:'Habilitat que falta si cal ampliar el molekulon.'}},required:['best']}},
    build:ctx=>'Molekulon: '+(ctx.molekulon||[]).map(m=>m.name+' ('+(m.superpowers||[]).slice(0,3).map(s=>s.cat).join(',')+')').join(' · ')+'\nNecessitat: '+(ctx.need||''),
    coerce:tu=>({best:(tu.best||[]).map(x=>({name:String(x.name).trim(),reason:(x.reason||'').trim(),balance:(x.shakti_shiva||'').trim()})),gap:(tu.gap||'').trim()})
  },
  narrative_kit:{
    model:'claude-opus-4-8',max_tokens:2500,
    system:'Ets guionista de còmic + compositor lletrista. Dissenya un kit narratiu breu per a un molekulon comunitari: 1) sinopsi de còmic (4-6 pàgines, tipus escola de superherois modern amb valors procomú), 2) estrofa d\'himne (16 versos amb rima assonant, en català), 3) escena performativa de graduació (5 min, amb rols). Estil: èpica quotidiana + humor càlid + veritats operatives.\n\nLA SINOPSI CONTINUA EL RECLUTAMENT. El Comando Molekulon busca 150.000 superherois per aturar el Mundo Muerto, i aquest molekulon és una escena d\'aquest reclutament, no una història a part. Cada personatge que hi entra ho fa pel seu número, que és l\'ordre en què va entrar i no un rànquing. Fes servir NOMÉS els números i les dates que et donin; si algú no en té, hi és igualment i el relat ho diu així —encara no numerat—, però no te\'n pots inventar cap.',
    tool:{name:'kit_narratiu',description:'Retorna el kit narratiu del molekulon.',input_schema:{type:'object',properties:{synopsis:{type:'string'},anthem:{type:'string'},scene:{type:'string'},title:{type:'string'}},required:['synopsis','anthem','scene']}},
    build:ctx=>{
      /* Els personatges van amb el seu número quan en tenen. Passar només els
         noms era el que deixava la sinopsi flotant fora de la pel·lícula. */
      const nums=ctx.numeros||{};
      const qui=(ctx.members||[]).map(n=>n+(nums[n]?' (núm. '+nums[n]+' de '+(ctx.comandoTarget||150000)+')':' (encara sense número)'));
      const L=['Molekulon: '+(ctx.name||''),'Personatges: '+qui.join(', '),'Repte comunitari: '+(ctx.challenge||'')];
      if(ctx.mode)L.push('Mode: '+ctx.mode);
      // L'acció real que ha passat al SOS. Si n'hi ha, el relat s'hi ha de basar:
      // aquesta tribu és creativa però el que la fa creïble és que va passar.
      const ev=ctx.evidence;
      if(ev&&ev.total){
        L.push('\n--- El que aquestes persones han fet de debò al SOS ---');
        if(ev.hores)L.push(ev.hores+' hores comptabilitzades'+(ev.euros?' i '+ev.euros+' € aportats':''));
        if(ev.nodes.length)L.push('Actives a: '+ev.nodes.join(', '));
        ev.exchanges.slice(0,10).forEach(x=>L.push('Intercanvi: '+x.from+' → '+x.to+' · '+x.what+' ('+x.value+(x.type==='moneda'?' €':' h')+') a '+x.node+(x.deliverables?' · entregable: '+x.deliverables:'')));
        ev.contributions.slice(0,10).forEach(c=>L.push('Aportació: '+c.who+' · '+c.what+' ('+c.value+(c.type==='moneda'?' €':' h')+')'+(c.deliverables?' · entregable: '+c.deliverables:'')));
        ev.offers.slice(0,8).forEach(o=>L.push((o.kind==='demanda'?'Demana':'Ofereix')+': '+o.who+' · '+(o.title||o.category)));
        ev.objects.slice(0,6).forEach(o=>L.push('Posa en comú: '+o.who+' · '+o.name));
        L.push('IMPORTANT: teixeix la sinopsi a partir d\'aquests fets reals. No inventis proeses que no hi són; converteix el que ha passat en èpica quotidiana.');
      }
      return L.join('\n');
    },
    coerce:tu=>({title:(tu.title||'').trim(),synopsis:(tu.synopsis||'').trim(),anthem:(tu.anthem||'').trim(),scene:(tu.scene||'').trim()})
  },
  character_dossier:{
    model:'claude-opus-4-8',max_tokens:2500,
    system:'Ets guionista de còmic i alhora analista de talent comunitari. A partir de material REAL d\'una persona (CV o trajectòria, habilitats declarades, recursos, arquetips que ella mateixa ha triat i evidència comptable del seu pas pel SOS), construeixes el seu personatge dins l\'univers del Comando Molekulon: superherois quotidians que sostenen un territori.\n\nREGLES DURES:\n1) No inventis fets biogràfics. Si una dada no és al material, no la facis servir. Millor un origen curt i cert que un de llarg i fals.\n2) Cada poder ha de sortir d\'alguna cosa que la persona sap fer de debò, i has de dir de quin tros del material surt.\n3) L\'ombra no és un defecte inventat: és l\'excés del seu propi poder (l\'ombra de l\'arquetip).\n4) Res de superlatius buits ni d\'èpica militar. Èpica quotidiana: el que fa aquesta persona un dimarts.\n5) Català, frases curtes. La primera missió ha de ser un intercanvi concret i possible aquesta setmana.\n\nEL RECLUTAMENT (el marc de tot el que escrius):\nLa pel\u00b7lícula va d\'un reclutament: el Comando Molekulon busca 150.000 superherois per aturar el Mundo Muerto, i aquesta persona és una de les que s\'hi incorpora. El seu número NO és un rànquing ni una nota: és l\'ordre en què va entrar, i el va guanyar amb una aportació concreta amb data.\n6) L\'escena d\'incorporació («incorporacio») és una escena de pel\u00b7lícula de 2 a 4 frases que arrenca del fet REAL que li va donar el número —l\'aportació i la data que et donen— i acaba amb ella dins del Comando. Si et donen número, anomena\'l una vegada i sense solemnitat; si no en té, escriu l\'escena de qui hi és a punt d\'entrar i digues què li falta, sense inventar-ne cap.\n7) Cap número, data ni fet que no et donin. Ni un. Un número inventat es descobreix el mateix dia que dues persones es comparen els cromos, i llavors ja no es creu res més del que hi diu.\nSortida sempre via l\'eina.',
    tool:{name:'crear_personatge',description:'Retorna el personatge construït a partir del material real.',input_schema:{type:'object',properties:{
      alias:{type:'string',description:'Àlies de superheroi/na en català, evocador i no ridícul.'},
      origin:{type:'string',description:'Història d\'origen de 3 a 6 frases, només amb fets del material.'},
      incorporacio:{type:'string',description:'Escena d\'incorporació al reclutament, 2-4 frases, a partir de l\'aportació i la data reals que et donen. Sense inventar cap número ni cap data.'},
      powers:{type:'array',items:{type:'object',properties:{name:{type:'string'},what:{type:'string'},evidence:{type:'string'}},required:['name','what']}},
      shadow:{type:'string',description:'L\'excés del seu propi poder.'},
      motto:{type:'string'},
      archetype:{type:'string',enum:['zeus','hera','posido','demeter','atenea','apollo','hebe','dionis','afrodita','hefest','hermes','hestia']},
      archetype_why:{type:'string'},
      archetype_secondary:{type:'string',enum:['zeus','hera','posido','demeter','atenea','apollo','hebe','dionis','afrodita','hefest','hermes','hestia']},
      first_mission:{type:'string',description:'Un intercanvi concret i possible aquesta setmana al seu territori.'},
      skills_detected:{type:'array',items:{type:'object',properties:{label:{type:'string'},category:{type:'string',enum:['idiomes','cuina','infants','informatica','acompanyament','jardineria','festes','transport','costura','reparacions','neteja','electronica','bricolatge','salut','altres']}},required:['label','category']}},
      resources_detected:{type:'array',items:{type:'string'}}
    },required:['alias','origin','incorporacio','powers','motto','archetype','first_mission']}},
    build:ctx=>{
      const L=[];
      L.push('Persona: '+(ctx.name||'—')+(ctx.municipi?' · '+ctx.municipi:''));
      if(ctx.role)L.push('Rol declarat al SOS: '+ctx.role);
      if((ctx.skills||[]).length)L.push('Habilitats declarades: '+ctx.skills.join(', '));
      if((ctx.resources||[]).length)L.push('Recursos que posa en comú: '+ctx.resources.join(', '));
      if((ctx.languages||[]).length)L.push('Idiomes: '+ctx.languages.join(', '));
      if(ctx.availability)L.push('Disponibilitat: '+ctx.availability);
      if((ctx.wants||[]).length)L.push('Vol aprendre o necessita: '+ctx.wants.join(', '));
      if((ctx.declared||[]).length)L.push('Arquetips que ella mateixa ha triat: '+ctx.declared.join(', '));
      if(ctx.signals)L.push('Senyals simbòlics (pista feble, mai veredicte): '+ctx.signals);
      if(ctx.evidence)L.push('Evidència comptable al SOS: '+ctx.evidence);
      /* El número va sempre, hi sigui o no: dir «no en té» és una dada, i
         callar-ho és el que fa que la IA se n'inventi un. */
      L.push(ctx.numero
        ? 'Número al Comando: '+ctx.numero+' de '+ctx.comandoTarget+
          (ctx.altaTs?' · guanyat el '+ctx.altaTs:'')+
          (ctx.altaQue?' amb «'+ctx.altaQue+'»':'')
        : 'Número al Comando: encara cap'+(ctx.altaPer?' ('+ctx.altaPer+')':'')+
          '. NO te\'n pots inventar cap.');
      if(ctx.cv)L.push('\n--- CV / trajectòria aportada per la persona ---\n'+String(ctx.cv).slice(0,9000));
      return L.join('\n');
    },
    coerce:tu=>({
      alias:(tu.alias||'').trim(),origin:(tu.origin||'').trim(),
      incorporacio:(tu.incorporacio||'').trim(),
      powers:(tu.powers||[]).slice(0,6).map(p=>({name:String(p.name||'').trim(),what:String(p.what||'').trim(),evidence:String(p.evidence||'').trim()})),
      shadow:(tu.shadow||'').trim(),motto:(tu.motto||'').trim(),
      archetype:PANTHEON12[tu.archetype]?tu.archetype:null,
      archetypeSecondary:PANTHEON12[tu.archetype_secondary]&&tu.archetype_secondary!==tu.archetype?tu.archetype_secondary:null,
      archetypeWhy:(tu.archetype_why||'').trim(),
      firstMission:(tu.first_mission||'').trim(),
      skillsDetected:(tu.skills_detected||[]).slice(0,12).map(s=>({label:String(s.label||'').trim(),cat:SKILL_POLARITY[s.category]!==undefined?s.category:'altres'})),
      resourcesDetected:(tu.resources_detected||[]).slice(0,12).map(String)
    })
  },
  valuation:{
    model:'claude-opus-4-8',max_tokens:1200,
    system:'Ets valorador expert en economia col·laborativa. Donada una descripció d\'un recurs (skill o objecte), proposa un rang de valor (mínim/esperat/màxim) en €/hora (si és skill) o €/unitat (si és objecte). Sempre indica la font o hipòtesi. Preferència per estimacions conservadores.',
    tool:{name:'valuar_recurs',description:'Retorna un rang de valor amb font.',input_schema:{type:'object',properties:{eur_min:{type:'number'},eur_expected:{type:'number'},eur_max:{type:'number'},unit:{type:'string',enum:['h','unitat']},source:{type:'string'},confidence:{type:'number'}},required:['eur_expected','unit','source']}},
    build:ctx=>'Recurs: '+(ctx.name||'')+'\nTipus: '+(ctx.type||'skill')+'\nDescripció: '+(ctx.description||''),
    coerce:tu=>({min:Number(tu.eur_min)||Math.round(Number(tu.eur_expected)*0.7),expected:Number(tu.eur_expected)||0,max:Number(tu.eur_max)||Math.round(Number(tu.eur_expected)*1.3),unit:tu.unit||'h',source:(tu.source||'').trim(),confidence:typeof tu.confidence==='number'?Math.max(0,Math.min(1,tu.confidence)):0.5})
  },
  governance_check:{
    model:'claude-opus-4-8',max_tokens:800,
    system:'Ets un auditor de governança comunitària. Donada una proposta signada per algú, valida si compleix bones pràctiques (proporcionalitat, reversibilitat, transparència, respecte de la sabiduria acumulada). Sortida sempre via l\'eina.',
    tool:{name:'validar_proposta',description:'Retorna veredicte i raons.',input_schema:{type:'object',properties:{verdict:{type:'string',enum:['approve','review','reject']},reasons:{type:'array',items:{type:'string'}},suggestions:{type:'array',items:{type:'string'}}},required:['verdict','reasons']}},
    build:ctx=>'Proposta: '+JSON.stringify(ctx.proposal||{},null,2)+'\nContext del node: '+(ctx.nodeContext||''),
    coerce:tu=>({verdict:['approve','review','reject'].includes(tu.verdict)?tu.verdict:'review',reasons:(tu.reasons||[]).map(String),suggestions:(tu.suggestions||[]).map(String)})
  },
  pr_review:{
    model:'claude-opus-4-8',max_tokens:1500,
    system:'Ets revisor de codi expert (defensor de la simplicitat, DRY, i el codex SOS: W3C nadiu, self-contained, immutable state, Glass-Box). Donat un diff de PR, dictamina si es pot mergejar automàticament, si necessita supervisió humana, o si cal refer.',
    tool:{name:'dictamen_pr',description:'Retorna dictamen + raons + fixes.',input_schema:{type:'object',properties:{verdict:{type:'string',enum:['green','yellow','red']},summary:{type:'string'},issues:{type:'array',items:{type:'string'}},fixSuggestions:{type:'array',items:{type:'string'}}},required:['verdict','summary']}},
    build:ctx=>'PR title: '+(ctx.title||'')+'\nDiff (truncat):\n'+((ctx.diff||'').slice(0,15000)),
    coerce:tu=>({verdict:['green','yellow','red'].includes(tu.verdict)?tu.verdict:'yellow',summary:(tu.summary||'').trim(),issues:(tu.issues||[]).map(String),fixSuggestions:(tu.fixSuggestions||[]).map(String)})
  },
  discover_entities:{
    model:'claude-opus-4-8',max_tokens:2000,
    system:'Ets expert en el teixit associatiu i l\'economia social de Catalunya. Proposa entitats i organitzacions REALS que probablement operen en aquest territori (ajuntaments, consells comarcals, associacions, cooperatives, casals, colles, comerços, bancs de temps…). IMPORTANT: NO inventis noms. Si no tens prou certesa d\'una entitat concreta, no la incloguis o marca-la amb confidence baixa. Val més una llista curta i fiable que una llarga inventada. Escriu en català. Respon només cridant l\'eina.',
    tool:(ctx)=>{const typeIds=entityTypesFor(ctx.level).map(t=>t[0]);return{name:'proposar_entitats',description:'Retorna candidats d\'entitats reals a verificar.',input_schema:{type:'object',properties:{entities:{type:'array',items:{type:'object',properties:{name:{type:'string'},entityType:{type:'string',enum:typeIds},description:{type:'string'},url:{type:'string'},confidence:{type:'number'}},required:['name','entityType']}}},required:['entities']}};},
    build:ctx=>{const meta=LEVEL_META[ctx.level];const txt=['Territori: '+meta.label+' de "'+ctx.territoryName+'" (Catalunya).',ctx.promptText?'Context: '+ctx.promptText:''].filter(Boolean).join('\n');return 'Proposa entitats reals per a aquest territori:\n\n'+txt;},
    coerce:(tu,ctx)=>{const typeIds=entityTypesFor(ctx.level).map(t=>t[0]);return(tu.entities||[]).filter(e=>e&&e.name).map(e=>({name:String(e.name).trim(),entityType:typeIds.includes(e.entityType)?e.entityType:'altre',description:(e.description||'').trim(),url:(e.url||'').trim(),confidence:typeof e.confidence==='number'?Math.max(0,Math.min(1,e.confidence)):0.5}));}
  }
};
};
if (typeof module !== 'undefined') module.exports = IaIntents;
