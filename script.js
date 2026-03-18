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

    // Elementos DOM
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const passwordInput = document.getElementById('password-input');
    const loginError = document.getElementById('login-error');
    
    const dashboardSection = document.getElementById('dashboard-section');
    const formSection = document.getElementById('form-section');
    
    const btnNewQuote = document.getElementById('btn-new-quote');
    const btnBackDashboard = document.getElementById('btn-back-dashboard');
    const historyBody = document.getElementById('history-body');

    // Elementos del Formulario (TRM y Precios)
    const trmInput = document.getElementById('trm-input');
    const btnUpdateTrm = document.getElementById('btn-update-trm');
    const priceUsdInput = document.getElementById('price-usd');
    const priceCopDisplay = document.getElementById('price-cop-display');

    // --- LOGIN ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (passwordInput.value.trim() === ACCESS_PASSWORD) {
            loginOverlay.style.display = 'none';
            dashboardSection.style.display = 'block';
            loadHistory();
        } else {
            loginError.style.display = 'block';
            passwordInput.value = '';
        }
    });

    // --- NAVEGACIÓN ---
    btnNewQuote.addEventListener('click', () => {
        dashboardSection.style.display = 'none';
        formSection.style.display = 'block';
        fetchTRM(); // Traer la TRM automáticamente al abrir el formulario
    });

    btnBackDashboard.addEventListener('click', () => {
        formSection.style.display = 'none';
        dashboardSection.style.display = 'block';
    });

    // --- API TRM (Gobierno de Colombia) ---
    async function fetchTRM() {
        try {
            btnUpdateTrm.textContent = "⏳ Cargando...";
            // API oficial de Datos Abiertos Colombia
            const response = await fetch('https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=1&$order=vigenciadesde%20DESC');
            const data = await response.json();
            
            if(data && data.length > 0) {
                // Redondear la TRM para que sea más limpia (ej: 3950.50 -> 3951)
                const trmValue = Math.round(parseFloat(data[0].valor));
                trmInput.value = trmValue;
                calculateCOP(); // Recalcular si ya había un precio en USD
            }
        } catch (error) {
            console.error("Error obteniendo TRM:", error);
            alert("No se pudo obtener la TRM automática. Por favor, ingrésala manualmente.");
        } finally {
            btnUpdateTrm.textContent = "🔄 Actualizar TRM";
        }
    }

    btnUpdateTrm.addEventListener('click', fetchTRM);

    // --- CALCULADORA USD A COP ---
    function calculateCOP() {
        const usd = parseFloat(priceUsdInput.value) || 0;
        const trm = parseFloat(trmInput.value) || 0;
        const cop = usd * trm;
        
        // Formatear a moneda colombiana
        priceCopDisplay.textContent = cop.toLocaleString('es-CO', { 
            style: 'currency', 
            currency: 'COP',
            maximumFractionDigits: 0 
        });
    }

    // Escuchar cambios en los inputs para calcular en tiempo real
    priceUsdInput.addEventListener('input', calculateCOP);
    trmInput.addEventListener('input', calculateCOP);

    // --- HISTORIAL FIREBASE ---
    async function loadHistory() {
        try {
            const quotesRef = collection(db, "quotes");
            const q = query(quotesRef, orderBy("createdAt", "desc"), limit(20));
            const querySnapshot = await getDocs(q);

            historyBody.innerHTML = ''; 

            if (querySnapshot.empty) {
                historyBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--c-gray);">Aún no hay cotizaciones guardadas. ¡Crea la primera!</td></tr>';
                return;
            }

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const dateObj = data.createdAt ? new Date(data.createdAt.toMillis()) : new Date();
                const dateStr = dateObj.toLocaleDateString('es-CO');

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${dateStr}</td>
                    <td><strong>${data.clientName || 'Sin nombre'}</strong></td>
                    <td>${data.cruiseLine || 'N/A'} - ${data.shipName || 'N/A'}</td>
                    <td>${data.totalPrice || '$0'}</td>
                    <td><button class="btn-edit-history" data-id="${doc.id}">Editar</button></td>
                `;
                historyBody.appendChild(tr);
            });
        } catch (error) {
            console.error("Error cargando historial:", error);
            historyBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #ff4d4f;">La base de datos está conectada. Configuraremos los permisos al final.</td></tr>';
        }
    }

    // Prevenir envío del formulario por ahora (se hará en el Paso 3)
    document.getElementById('cruise-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert("¡Formulario listo! En el Paso 3 conectaremos esto para generar el PDF de 4 páginas.");
    });
});
