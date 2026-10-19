// Le bouton reste disponible même si le navigateur exige une installation manuelle.
export function mountInstall(){
  const button=document.getElementById('install-app');
  const dialog=document.getElementById('install-dialog');
  const action=document.getElementById('confirm-install');
  const status=document.getElementById('offline-status');
  const message=document.getElementById('install-message');
  const update=document.getElementById('update-app');
  const standalone=window.matchMedia('(display-mode: standalone)');
  const isStandalone=()=>standalone.matches||navigator.standalone===true;
  const local=location.protocol==='file:';
  let prompt=null,registration=null;
  function sync(){button.innerHTML=`<span aria-hidden="true">${isStandalone()?'✓':'↓'}</span> ${isStandalone()?'Application installée':'Installer l’application'}`;action.hidden=!prompt||isStandalone();}
  button.addEventListener('click',()=>{sync();dialog.showModal();});
  document.getElementById('close-install').addEventListener('click',()=>dialog.close());
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();prompt=event;sync();});
  window.addEventListener('appinstalled',()=>{prompt=null;message.textContent='Déclic est installé. Retrouve son icône parmi tes applications.';sync();});
  standalone.addEventListener('change',sync);
  action.addEventListener('click',async()=>{
    if(!prompt)return;const current=prompt;prompt=null;sync();
    try{await current.prompt();const choice=await current.userChoice;message.textContent=choice.outcome==='accepted'?'Installation acceptée. Retrouve Déclic parmi tes applications.':'Installation annulée. Tu peux continuer à utiliser Déclic dans le navigateur.';}
    catch{message.textContent='Utilise le menu du navigateur pour installer Déclic, puis suis les étapes ci-dessous.';}
  });
  update.addEventListener('click',()=>{if(registration?.waiting){update.disabled=true;registration.waiting.postMessage({type:'ACTIVATE_UPDATE'});}});
  let reloading=false;
  navigator.serviceWorker?.addEventListener('controllerchange',()=>{if(update.disabled&&!reloading){reloading=true;location.reload();}});
  if(local){
    status.textContent='Fichier autonome · déjà utilisable hors connexion';
    message.innerHTML='Ce fichier contient déjà les leçons et exercices hors connexion. Pour ajouter une icône d’application sur PC ou tablette, ouvre la <a href="https://tigreoslam23.github.io/CNED-PC/" target="_blank" rel="noopener">version en ligne de Déclic</a>, puis touche « Installer l’application ». Si le site n’est pas encore disponible, GitHub Pages doit être activé dans le dépôt.';
  }else if(!window.isSecureContext||!('serviceWorker' in navigator)){
    status.textContent='Hors connexion indisponible dans ce navigateur';
    message.textContent='Ouvre Déclic depuis son adresse HTTPS avec un navigateur récent pour préparer l’utilisation hors connexion.';
  }else{
    status.textContent='Préparation hors connexion…';
    const showUpdate=()=>{if(registration.waiting&&navigator.serviceWorker.controller)update.hidden=false;};
    navigator.serviceWorker.register('./sw.js').then(reg=>{
      registration=reg;showUpdate();
      function watch(worker){if(!worker)return;worker.addEventListener('statechange',()=>{if(worker.state==='installed')showUpdate();if(worker.state==='redundant'){status.textContent='Préparation incomplète · reconnecte-toi puis recharge';status.classList.add('warning');}});}
      watch(reg.installing);reg.addEventListener('updatefound',()=>watch(reg.installing));
      return navigator.serviceWorker.ready;
    }).then(()=>{status.textContent='✓ Les 3 modules sont prêts hors connexion';status.classList.remove('warning');}).catch(()=>{status.textContent='Préparation hors connexion échouée · recharge en ligne';status.classList.add('warning');});
  }
  sync();
}
