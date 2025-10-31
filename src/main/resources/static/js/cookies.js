// Funzione per chiudere il banner e memorizzare la scelta dell'utente
function closeCookieBanner() {
    document.getElementById('cookie-banner').style.display = 'none';
    sessionStorage.setItem('cookieAccepted', 'true'); // Memorizza la scelta dell'utente
}

// Controlla se l'utente ha già accettato i cookie
document.addEventListener('DOMContentLoaded', function() {
	
	
    if (!sessionStorage.getItem('cookieAccepted')) {
        document.getElementById('cookie-banner').style.display = 'block';
    }
	
	if(sessionStorage.getItem('cookieAccepted', 'true'))
	document.getElementById('cookie-banner').style.display = 'none';
});