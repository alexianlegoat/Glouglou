document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SÉLECTION DES "PAGES" ---
    const pageAccueil = document.getElementById('page-accueil');
    const pageJoueurs = document.getElementById('page-joueurs');
    const pagePacks = document.getElementById('page-packs');
    
    // --- 2. SÉLECTION DES ÉLÉMENTS (Tous) ---
    const btnPret = document.getElementById('btnPret');
    const inputNom = document.getElementById('inputNom');
    const btnAjouterInline = document.getElementById('btnAjouterInline');
    const listeDesJoueurs = document.getElementById('listeDesJoueurs');
    const btnSuivant = document.getElementById('btnSuivant');
    const btnCommencerJeu = document.getElementById('btnCommencerJeu');
    const alertModal = document.getElementById('alertModal');
    const modalBtnOK = document.getElementById('modalBtnOK');
    const btnRetourJoueurs = document.getElementById('btnRetourJoueurs');
    const btnRetourPacks = document.getElementById('btnRetourPacks');

    /* ============ LOGIQUE DE ROUTAGE (Inchangée) ============ */
    const hash = window.location.hash;
    const playersExist = localStorage.getItem('listeDesJoueurs');
    if (hash === '#packs' && playersExist) {
        pageAccueil.classList.remove('active');
        pageAccueil.style.display = 'none';
        pagePacks.style.display = 'flex';
        pagePacks.classList.add('active'); 
        pagePacks.style.opacity = 1;
        // Correction pour la position de la page pack
        pagePacks.style.top = '0';
        pagePacks.style.transform = 'translate(-50%, 0) translateX(0)';
        pagePacks.style.justifyContent = 'flex-start';
        pagePacks.style.paddingTop = '30px';
    } else {
        pageAccueil.classList.add('active');
        pageJoueurs.style.display = 'none';
        pagePacks.style.display = 'none';
        if (hash) {
            window.location.hash = '';
        }
    }
    
    // --- 3. FONCTION DE NAVIGATION (MISE À JOUR) ---
    function showPage(pageToShow, direction = 'forward') {
        const currentPage = document.querySelector('.page.active');
        const transitionDelay = 500; 
        let outClass, inClass;
        if (direction === 'forward') {
            outClass = 'anim-out-forward';
            inClass = 'anim-in-forward-prepare';
        } else {
            outClass = 'anim-out-backward';
            inClass = 'anim-in-backward-prepare';
        }
        if (currentPage) {
            currentPage.classList.add(outClass);
            setTimeout(() => {
                currentPage.classList.remove('active');
                currentPage.classList.remove(outClass);
                currentPage.style.display = 'none';
            }, transitionDelay);
        }
        pageToShow.classList.add(inClass);
        pageToShow.style.display = 'flex';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                pageToShow.classList.remove(inClass);
                pageToShow.classList.add('active');
            });
        });
    }
    
    // --- 4. Fonction pour la modale d'alerte ---
    function showAlertModal(show, message) {
        const modalText = document.querySelector('#alertModal p');
        if (message) {
            modalText.textContent = message;
        }
        if (show) {
            alertModal.style.display = 'flex';
            requestAnimationFrame(() => { alertModal.classList.add('visible'); });
        } else {
            alertModal.classList.remove('visible');
            setTimeout(() => { alertModal.style.display = 'none'; }, 300);
        }
    }

    // --- 5. LOGIQUE PAGE ACCUEIL ---
    if (btnPret) {
        btnPret.addEventListener('click', () => { showPage(pageJoueurs); });
    }

    // --- 6. LOGIQUE PAGE JOUEURS ---
    if (btnAjouterInline) {
        btnAjouterInline.addEventListener('click', ajouterJoueur);
    }
    if (inputNom) {
        inputNom.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') { ajouterJoueur(); }
        });
    }
    if (btnSuivant) {
        btnSuivant.addEventListener('click', () => {
            const joueurs = [];
            const elementsJoueurs = document.querySelectorAll('#listeDesJoueurs li span');
            elementsJoueurs.forEach(element => { joueurs.push(element.textContent); });
            if (joueurs.length === 0) {
                showAlertModal(true, "Veuillez ajouter au moins un joueur !");
                return;
            }
            localStorage.setItem('listeDesJoueurs', JSON.stringify(joueurs));
            showPage(pagePacks); // 'forward'
        });
    }
    if (btnRetourJoueurs) {
        btnRetourJoueurs.addEventListener('click', () => {
            showPage(pageAccueil, 'backward'); // 'backward'
        });
    }

    // --- 7. LOGIQUE PAGE PACKS ---
    if (btnCommencerJeu) {
        btnCommencerJeu.addEventListener('click', () => {
            const packChoisi = document.querySelector('input[name="pack"]:checked');
            if (!packChoisi) {
                showAlertModal(true, "Veuillez choisir un pack de jeu !");
                return;
            }
            localStorage.setItem('packDeJeu', packChoisi.value);
            const currentPage = document.querySelector('.page.active');
            if (currentPage) {
               currentPage.classList.add('anim-out-forward'); 
            }
            setTimeout(() => {
                window.location.href = 'game.html';
            }, 500);
        });
    }
    if (btnRetourPacks) {
        btnRetourPacks.addEventListener('click', () => {
            showPage(pageJoueurs, 'backward'); // 'backward'
        });
    }
    
    // --- 8. Écouteur pour le bouton "OK" de la modale d'alerte ---
    if (modalBtnOK) {
        modalBtnOK.addEventListener('click', () => {
            showAlertModal(false); // Cache la modale
        });
    }

    // --- 9. FONCTION AJOUTER JOUEUR ---
    function ajouterJoueur() {
        const nom = inputNom.value.trim();
        if (nom !== "") {
            const nouvelElementLi = document.createElement('li');
            const spanNom = document.createElement('span');
            spanNom.textContent = nom;
            const boutonSupprimer = document.createElement('button');
            boutonSupprimer.textContent = 'X';
            boutonSupprimer.className = 'btn-supprimer';
            boutonSupprimer.addEventListener('click', () => {
                listeDesJoueurs.removeChild(nouvelElementLi);
            });
            nouvelElementLi.appendChild(spanNom);
            nouvelElementLi.appendChild(boutonSupprimer);
            listeDesJoueurs.appendChild(nouvelElementLi);
            inputNom.value = "";
            inputNom.focus();
        }
    }
}); // Fin du DOMContentLoaded


/* ============ NOUVEAU : Enregistrement du Service Worker ============ */
// On le fait après que tout le reste soit chargé (window.load)
window.addEventListener('load', () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => {
                console.log('Service Worker enregistré !', reg);
            })
            .catch(err => {
                console.log('Erreur lors de l/enregistrement du Service Worker: ', err);
            });
    }
});
/* ================================================================== */
