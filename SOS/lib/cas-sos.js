/* El cas del SOS: un poble model, per a la pel·lícula de la portada (15/11/2026).
   Àlvaro: «la página inicial de SOS, una vuelta brutal al flujo de valor de
   los procesos del SOS, de la metodología, de todo, sin tanto texto».

   Mateixa forma que SOS/lib/cas-automatitzat.js (el cas de la productora) i
   el mateix motor (MapaAnima.pelicula). Aquí no hi ha cap dada real: és el
   mapa de valor d'un poble que fa servir les eines del SOS —el banc de temps,
   la biblioteca de les coses, la compra, l'energia, l'espai i la formació—,
   escrit a mà perquè és un model i així ho diu la pel·lícula. Els textos de la
   pel·lícula que canvien (un poble i no un negoci) van a `textos`. */
(function (g) {
  function Q(ca, es) { return { ca: ca, es: es }; }
  var R = {
    poble: Q('Qui viu al poble', 'Quien vive en el pueblo'),
    espai: Q('Qui porta l\'espai', 'Quien lleva el espacio'),
    hores: Q('Qui ofereix hores', 'Quien ofrece horas'),
    coses: Q('Qui deixa coses', 'Quien presta cosas'),
    compra: Q('Qui compra en grup', 'Quien compra en grupo'),
    energia: Q('Qui comparteix l\'energia', 'Quien comparte la energía'),
    forma: Q('Qui forma i acompanya', 'Quien forma y acompaña'),
    recursos: Q('Qui hi posa recursos', 'Quien pone recursos')
  };
  var ORDRE = ['poble', 'espai', 'hores', 'coses', 'compra', 'energia', 'forma', 'recursos'];
  /* de, a, mena, què (ca, es), qui ho fa, esglaó, procés */
  var F = [
    ['poble', 'hores', 'T', 'la petició d\'ajuda', 'la petición de ayuda', 'solo', 'automatizado', 'temps'],
    ['hores', 'poble', 'T', 'l\'hora d\'ajuda, apuntada al saldo', 'la hora de ayuda, apuntada en el saldo', 'maquina', 'automatizado', 'temps'],
    ['poble', 'hores', 'I', 'el gràcies i la confiança', 'el gracias y la confianza', 'persona', null, null],
    ['coses', 'poble', 'T', 'l\'eina prestada, amb el seu desgast', 'la herramienta prestada, con su desgaste', 'maquina', 'definido', 'coses'],
    ['poble', 'coses', 'T', 'el retorn a temps, i l\'avís si no torna', 'la devolución a tiempo, y el aviso si no vuelve', 'solo', 'automatizado', 'coses'],
    ['poble', 'compra', 'T', 'la comanda de la setmana', 'el pedido de la semana', 'solo', 'automatizado', 'compra'],
    ['compra', 'poble', 'T', 'la cistella de proximitat', 'la cesta de proximidad', 'persona', 'definido', 'compra'],
    ['compra', 'espai', 'I', 'productors del territori que es coneixen', 'productores del territorio que se conocen', 'persona', null, null],
    ['energia', 'poble', 'T', 'el repartiment de l\'autoconsum', 'el reparto del autoconsumo', 'maquina', 'definido', 'energia'],
    ['poble', 'energia', 'T', 'la quota i les lectures', 'la cuota y las lecturas', 'persona', 'por_montar', 'energia'],
    ['espai', 'poble', 'T', 'la sala, el calendari i les normes', 'la sala, el calendario y las normas', 'maquina', 'definido', 'comunitat'],
    ['poble', 'espai', 'T', 'la proposta i el vot a l\'assemblea', 'la propuesta y el voto en la asamblea', 'solo', 'automatizado', 'comunitat'],
    ['espai', 'poble', 'I', 'la trobada que treu de la soledat', 'el encuentro que saca de la soledad', 'persona', null, null],
    ['poble', 'espai', 'I', 'les cures i el temps que ningú compta', 'los cuidados y el tiempo que nadie cuenta', 'persona', null, null],
    ['forma', 'espai', 'T', 'el mòdul de formació, de N0 a N3', 'el módulo de formación, de N0 a N3', 'ia', 'definido', 'apren'],
    ['espai', 'forma', 'T', 'el registre del que s\'ha après', 'el registro de lo aprendido', 'persona', 'por_montar', 'apren'],
    ['forma', 'poble', 'I', 'el certificat, que és de la persona', 'el certificado, que es de la persona', 'maquina', 'definido', 'apren'],
    ['recursos', 'espai', 'T', 'el fons per formar qui sosté els rols', 'el fondo para formar a quien sostiene los roles', 'persona', 'por_montar', 'comunitat'],
    ['espai', 'recursos', 'I', 'l\'impacte mesurat, per a la memòria', 'el impacto medido, para la memoria', 'maquina', 'automatizado', 'comunitat'],
    ['hores', 'coses', 'I', 'veïns que es coneixen i es fien', 'vecinos que se conocen y se fían', 'persona', null, null]
  ];
  var P = [['temps', 'El temps', 'El tiempo'], ['coses', 'Les coses', 'Las cosas'], ['compra', 'La compra', 'La compra'],
    ['energia', 'L\'energia', 'La energía'], ['comunitat', 'L\'espai i l\'assemblea', 'El espacio y la asamblea'],
    ['apren', 'Aprendre i acreditar-se', 'Aprender y acreditarse']];
  var C = {
    nom: Q('un poble de dues mil persones amb el seu ateneu', 'un pueblo de dos mil personas con su ateneo'),
    roles: { ca: ORDRE.map(function (k) { return R[k].ca; }), es: ORDRE.map(function (k) { return R[k].es; }) },
    icones: ['🏡', '🏛', '⏳', '🧰', '🧺', '☀️', '🎓', '🤲'],
    nivells: {
      solo: { icona: '⚡', ca: 'Va sol, sense esperar ningú', es: 'Va solo, sin esperar a nadie' },
      ia: { icona: '✦', ca: 'La IA ho prepara i una persona ho valida', es: 'La IA lo prepara y una persona lo valida' },
      maquina: { icona: '⚙', ca: 'L\'app ho porta i una persona ho valida', es: 'La app lo lleva y una persona lo valida' },
      persona: { icona: '·', ca: 'Ho fa una persona', es: 'Lo hace una persona' }
    },
    processos: P.map(function (p) { return { id: p[0], nom: Q(p[1], p[2]) }; }),
    fluxos: F.map(function (x) {
      return { de: R[x[0]], a: R[x[1]], mena: x[2] === 'T' ? 'tangible' : 'intangible', que: Q(x[3], x[4]), qui: x[5], escalo: x[6], proces: x[7] };
    }),
    textos: {
      ca: { honest: 'És un poble model. Al teu, comenceu per una eina i les altres arriben soles.',
        pl: { k: 'El teu poble, vist des de dalt', cas: 'Un poble model, amb dades d\'exemple.', a11y: 'Pel·lícula del flux de valor d\'un poble en cinc escenes',
          e: [['Qui ets', 'Ets aquí, al mig del teu poble. I no hi estàs sol.'],
            ['Què es mou', 'Això és el que ja passa: hores, coses, compres… i el que ningú paga però us sosté.'],
            ['On es crema', 'Aquí és on la comunitat es crema.'],
            ['Ho organitzeu', 'Ho dibuixeu, ho definiu i el tauler ho porta. Sense oficina.'],
            ['Va sol', 'El que va sol és temps que torna al poble.']],
          sols: 'intercanvis ja van sols', punt: 'i {0} més, a punt', val: 'Quant val això per al teu poble?',
          cta: 'Comença al teu poble →', q: 'Què vols fer? ↓' } },
      es: { honest: 'Es un pueblo modelo. En el tuyo, empezáis por una herramienta y las demás llegan solas.',
        pl: { k: 'Tu pueblo, visto desde arriba', cas: 'Un pueblo modelo, con datos de ejemplo.', a11y: 'Película del flujo de valor de un pueblo en cinco escenas',
          e: [['Quién eres', 'Estás aquí, en medio de tu pueblo. Y no estás solo.'],
            ['Qué se mueve', 'Esto es lo que ya pasa: horas, cosas, compras… y lo que nadie paga pero os sostiene.'],
            ['Dónde se quema', 'Aquí es donde la comunidad se quema.'],
            ['Lo organizáis', 'Lo dibujáis, lo definís y el tablero lo lleva. Sin oficina.'],
            ['Va solo', 'Lo que va solo es tiempo que vuelve al pueblo.']],
          sols: 'intercambios ya van solos', punt: 'y {0} más, listos', val: '¿Cuánto vale eso para tu pueblo?',
          cta: 'Empieza en tu pueblo →', q: '¿Qué quieres hacer? ↓' } }
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = C; else g.CasSOS = C;
})(this);
