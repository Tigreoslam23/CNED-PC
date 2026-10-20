// Le bouton reste disponible même si le navigateur exige une installation manuelle.
export function mountInstall(){
  const button=document.getElementById('install-app');
  const dialog=document.getElementById('install-dialog');
  const action=document.getElementById('confirm-install');
  const status=document.getElementById('offline-status');
  const message=document.getElementById('install-message');
  const update=document.getElementById('update-app');
  const installState=document.getElementById('install-state');
  const manual=document.getElementById('install-manual');
  const standalone=window.matchMedia('(display-mode: standalone)');
  const isStandalone=()=>standalone.matches||navigator.standalone===true;
  const local=location.protocol==='file:';
  let prompt=window.declicInstallPrompt||null,registration=null;
  let installed=false,busy=false,outcome='';
  function sync(){
    const confirmed=installed||isStandalone();
    button.innerHTML=`<span aria-hidden="true">${confirmed?'✓':'↓'}</span> ${confirmed?'Application installée':'Installer l’application'}`;
    action.hidden=!prompt||confirmed;action.disabled=busy;button.disabled=busy;
    installState.textContent=local?'Fichier local · ouvre la version en ligne pour installer Déclic':confirmed?'✓ Installation confirmée · voir ci-dessous pour l’icône du bureau':busy?'Confirmation dans la fenêtre de Chrome…':outcome==='accepted'?'Demande acceptée · le navigateur termine l’installation':outcome==='dismissed'?'Installation annulée · aucune installation confirmée':prompt?'La confirmation d’installation du navigateur est disponible':'Installation à confirmer depuis le menu de Chrome';
    manual.open=!prompt||confirmed;
    if(!outcome&&!busy&&!confirmed&&!local)message.textContent=prompt?'Clique sur « Installer sur cet appareil », puis confirme dans la fenêtre de ton navigateur.':'Dans Chrome, suis l’étape 1 pour installer Déclic. L’étape 2 ajoute son icône sur le bureau.';
    if(confirmed)message.textContent='Déclic est installé. Si son icône manque sur le bureau, suis l’étape 2 ci-dessous.';
  }
  async function requestInstall(){
    if(!prompt||busy)return;
    const current=prompt;prompt=null;window.declicInstallPrompt=null;busy=true;sync();
    try{
      // L’appel reste dans le clic de l’utilisateur pour conserver son activation.
      await current.prompt();const choice=await current.userChoice;outcome=choice.outcome;
      message.textContent=choice.outcome==='accepted'?'Chrome a accepté la demande. Lorsque l’installation est terminée, retrouve Déclic dans tes applications, puis crée son raccourci avec l’étape 2.':'Tu as annulé la confirmation. Tu peux réessayer depuis le menu de Chrome, à l’étape 1.';
    }catch{outcome='error';message.textContent='La confirmation n’a pas pu s’ouvrir. Utilise le menu de Chrome décrit à l’étape 1.';}
    finally{busy=false;sync();}
  }
  button.addEventListener('click',()=>{sync();if(!dialog.open)dialog.showModal();if(prompt&&!isStandalone())void requestInstall();});
  document.getElementById('close-install').addEventListener('click',()=>dialog.close());
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();prompt=event;window.declicInstallPrompt=event;outcome='';sync();});
  window.addEventListener('appinstalled',()=>{prompt=null;window.declicInstallPrompt=null;installed=true;sync();});
  standalone.addEventListener('change',sync);
  action.addEventListener('click',requestInstall);
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
    }).then(()=>{status.textContent='✓ Les 5 modules sont prêts hors connexion';status.classList.remove('warning');}).catch(()=>{status.textContent='Préparation hors connexion échouée · recharge en ligne';status.classList.add('warning');});
  }
  sync();
}
