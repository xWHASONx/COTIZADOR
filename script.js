import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBHmGl77i125THoq5rgHFGHud9n5G9A9YM",
  authDomain: "cyan-travel-cotizador.firebaseapp.com",
  projectId: "cyan-travel-cotizador",
  storageBucket: "cyan-travel-cotizador.firebasestorage.app",
  messagingSenderId: "267039635379",
  appId: "1:267039635379:web:3cce7223ae64e84738bdc6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const ACCESS_PASSWORD = 'HOLA';
    let pastedMapImage = ''; // Guardará la imagen del mapa en base64

    // --- TEMA OSCURO / CLARO ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;
    
    // Revisar si ya había elegido un tema antes
    const savedTheme = localStorage.getItem('cyan-theme') || 'light';
    htmlEl.setAttribute('data-theme', savedTheme);
    updateThemeButtonText(savedTheme);

    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = htmlEl.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        htmlEl.setAttribute('data-theme', newTheme);
        localStorage.setItem('cyan-theme', newTheme);
        updateThemeButtonText(newTheme);
    });

    function updateThemeButtonText(theme) {
        themeToggleBtn.innerHTML = theme === 'light' ? '🌙 Tema Oscuro' : '☀️ Tema Claro';
    }

    // --- ELEMENTOS DOM ---
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const passwordInput = document.getElementById('password-input');
    
    const dashboardSection = document.getElementById('dashboard-section');
    const formSection = document.getElementById('form-section');
    const confirmationSection = document.getElementById('confirmation-section');
    
    const btnNewQuote = document.getElementById('btn-new-quote');
    const btnBackDashboard = document.getElementById('btn-back-dashboard');
    const btnEditQuote = document.getElementById('btn-edit-quote');
    const btnDownloadPdf = document.getElementById('btn-download-pdf');
    const loaderOverlay = document.getElementById('loader-overlay');

    // --- LOGIN ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (passwordInput.value.trim() === ACCESS_PASSWORD) {
            loginOverlay.style.display = 'none';
            dashboardSection.style.display = 'block';
        } else {
            document.getElementById('login-error').style.display = 'block';
            passwordInput.value = '';
        }
    });

    // --- NAVEGACIÓN ---
    btnNewQuote.addEventListener('click', () => {
        dashboardSection.style.display = 'none';
        formSection.style.display = 'block';
        fetchTRM();
        // Setear fechas por defecto (hoy y validez mañana)
        const today = new Date();
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('validity-date').value = tomorrow.toISOString().split('T')[0];
    });

    btnBackDashboard.addEventListener('click', () => {
        formSection.style.display = 'none';
        dashboardSection.style.display = 'block';
    });

    btnEditQuote.addEventListener('click', () => {
        confirmationSection.style.display = 'none';
        formSection.style.display = 'block';
        window.scrollTo(0, 0);
    });

    // --- PEGADO DE IMAGEN (MAPA) ---
    const mapPasteArea = document.getElementById('map-paste-area');
    const mapPreview = document.getElementById('map-preview');

    mapPasteArea.addEventListener('paste', (e) => {
        e.preventDefault();
        const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith('image/'));
        if (item) {
            const reader = new FileReader();
            reader.onload = event => {
                pastedMapImage = event.target.result;
                mapPreview.src = pastedMapImage;
                mapPreview.style.display = 'block';
                mapPasteArea.querySelector('p').style.display = 'none';
            };
            reader.readAsDataURL(item.getAsFile());
        }
    });

    // --- CALCULADORA TRM ---
    const trmInput = document.getElementById('trm-input');
    const priceUsdInput = document.getElementById('price-usd');
    const priceCopDisplay = document.getElementById('price-cop-display');

    async function fetchTRM() {
        try {
            const response = await fetch('https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=1&$order=vigenciadesde%20DESC');
            const data = await response.json();
            if(data && data.length > 0) {
                trmInput.value = Math.round(parseFloat(data[0].valor));
                calculateCOP();
            }
        } catch (error) { console.error("Error TRM:", error); }
    }

    document.getElementById('btn-update-trm').addEventListener('click', fetchTRM);

    function calculateCOP() {
        const usd = parseFloat(priceUsdInput.value) || 0;
        const trm = parseFloat(trmInput.value) || 0;
        priceCopDisplay.textContent = (usd * trm).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
    }
    priceUsdInput.addEventListener('input', calculateCOP);
    trmInput.addEventListener('input', calculateCOP);

    // --- GENERAR VISTA PREVIA DEL PDF ---
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T00:00:00');
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('es-ES', options).toUpperCase();
    }

    function formatCurrency(value) {
        return parseFloat(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    document.getElementById('cruise-form').addEventListener('submit', (e) => {
        e.preventDefault();
        
        // 1. Recopilar datos
        const clientName = document.getElementById('client-name').value;
        const paxTotal = parseInt(document.getElementById('pax-adults').value) + parseInt(document.getElementById('pax-children').value);
        const usdTotal = document.getElementById('price-usd').value;
        const copTotal = (parseFloat(usdTotal) * parseFloat(trmInput.value)).toLocaleString('es-CO', { maximumFractionDigits: 0 });
        
        // 2. Inyectar en el HTML del PDF
        document.getElementById('pdf-current-date').textContent = formatDate(new Date().toISOString().split('T')[0]);
        document.getElementById('pdf-client-name').textContent = `HOLA ${clientName.toUpperCase()},`;
        document.getElementById('pdf-ship-name').textContent = document.getElementById('ship-name').value.toUpperCase();
        document.getElementById('pdf-embark-date').textContent = document.getElementById('embark-date').value.split('-').reverse().join('/');
        
        if(pastedMapImage) {
            document.getElementById('pdf-map-img').src = pastedMapImage;
            document.getElementById('pdf-map-img').style.display = 'block';
        } else {
            document.getElementById('pdf-map-img').style.display = 'none';
        }

        document.getElementById('pdf-ports').textContent = document.getElementById('itinerary').value;
        document.getElementById('pdf-embark-text').textContent = formatDate(document.getElementById('embark-date').value);
        document.getElementById('pdf-nights').textContent = document.getElementById('nights').value;
        document.getElementById('pdf-ship-text').textContent = document.getElementById('ship-name').value.toUpperCase();
        document.getElementById('pdf-cabin').textContent = document.getElementById('cabin-type').value.toUpperCase();
        
        document.getElementById('pdf-validity-text').textContent = document.getElementById('validity-date').value.split('-').reverse().join('/');
        document.getElementById('pdf-includes').textContent = document.getElementById('includes').value;
        document.getElementById('pdf-not-includes').textContent = document.getElementById('not-includes').value;

        // Súper Banner
        document.getElementById('pdf-pax-total').textContent = paxTotal;
        document.getElementById('pdf-total-usd').textContent = formatCurrency(usdTotal);
        document.getElementById('pdf-total-cop').textContent = copTotal;
        document.getElementById('pdf-deposit-usd').textContent = formatCurrency(document.getElementById('deposit-usd').value);
        document.getElementById('pdf-deadline').textContent = formatDate(document.getElementById('final-payment-date').value);

        // 3. Mostrar sección
        formSection.style.display = 'none';
        confirmationSection.style.display = 'block';
        window.scrollTo(0, 0);
    });

    // --- DESCARGAR PDF (html2canvas + jsPDF) ---
    btnDownloadPdf.addEventListener('click', async () => {
        loaderOverlay.style.display = 'flex';
        try {
            const elementToPrint = document.getElementById('voucher-to-print');
            const canvas = await html2canvas(elementToPrint, { scale: 2, useCORS: true });
            const pdf = new window.jspdf.jsPDF({ orientation: 'p', unit: 'px', format: [canvas.width, canvas.height] });
            pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, canvas.width, canvas.height);
            
            const clientName = document.getElementById('client-name').value.replace(/ /g, '_');
            pdf.save(`Cotizacion_Crucero_${clientName}.pdf`);
            
            alert("¡ÉXITO! La cotización ha sido descargada.");
        } catch (error) { 
            console.error("Error generando PDF:", error); 
            alert("Hubo un error al generar el PDF."); 
        } finally { 
            loaderOverlay.style.display = 'none'; 
        }
    });
});
