// Importaciones de Firebase (Versión Modular 10.x)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// Configuración de Firebase proporcionada
const firebaseConfig = {
  apiKey: "AIzaSyBHmGl77i125THoq5rgHFGHud9n5G9A9YM",
  authDomain: "cyan-travel-cotizador.firebaseapp.com",
  projectId: "cyan-travel-cotizador",
  storageBucket: "cyan-travel-cotizador.firebasestorage.app",
  messagingSenderId: "267039635379",
  appId: "1:267039635379:web:3cce7223ae64e84738bdc6"
};

// Inicializar Firebase y Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const ACCESS_PASSWORD = 'HOLA'; // Contraseña temporal

    // Elementos del DOM
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const passwordInput = document.getElementById('password-input');
    const loginError = document.getElementById('login-error');
    
    const dashboardSection = document.getElementById('dashboard-section');
    const formSection = document.getElementById('form-section');
    
    const btnNewQuote = document.getElementById('btn-new-quote');
    const btnNewFlyer = document.getElementById('btn-new-flyer');
    const btnBackDashboard = document.getElementById('btn-back-dashboard');
    const historyBody = document.getElementById('history-body');

    // --- LÓGICA DE LOGIN ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (passwordInput.value.trim() === ACCESS_PASSWORD) {
            loginOverlay.style.display = 'none';
            dashboardSection.style.display = 'block';
            loadHistory(); // Cargar historial al entrar
        } else {
            loginError.style.display = 'block';
            passwordInput.value = '';
        }
    });

    // --- NAVEGACIÓN ---
    btnNewQuote.addEventListener('click', () => {
        dashboardSection.style.display = 'none';
        formSection.style.display = 'block';
        // Aquí inicializaremos el formulario en el Paso 2
    });

    btnNewFlyer.addEventListener('click', () => {
        alert("El módulo de Flyer Promocional se construirá en el Paso 4.");
    });

    btnBackDashboard.addEventListener('click', () => {
        formSection.style.display = 'none';
        dashboardSection.style.display = 'block';
    });

    // --- CARGA DE HISTORIAL DESDE FIREBASE ---
    async function loadHistory() {
        try {
            // Referencia a la colección 'quotes' (se creará automáticamente cuando guardemos la primera)
            const quotesRef = collection(db, "quotes");
            // Traer las últimas 20 cotizaciones ordenadas por fecha
            const q = query(quotesRef, orderBy("createdAt", "desc"), limit(20));
            const querySnapshot = await getDocs(q);

            historyBody.innerHTML = ''; // Limpiar tabla

            if (querySnapshot.empty) {
                historyBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--c-gray);">Aún no hay cotizaciones guardadas. ¡Crea la primera!</td></tr>';
                return;
            }

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Formatear fecha (asumiendo que guardaremos un timestamp)
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

            // Agregar eventos a los botones de editar
            document.querySelectorAll('.btn-edit-history').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const docId = e.target.getAttribute('data-id');
                    alert(`Funcionalidad de edición para el ID: ${docId} se activará en el Paso 5.`);
                });
            });

        } catch (error) {
            console.error("Error cargando historial:", error);
            // Si falla (ej. reglas de seguridad de Firebase no configuradas aún), mostramos mensaje amigable
            historyBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #ff4d4f;">La base de datos está conectada, pero necesitamos configurar los permisos en Firebase (Lo haremos al final).</td></tr>';
        }
    }
});
