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
    let pastedImages = {}; // Almacén global de imágenes pegadas
    let hotelCounter = 0;

    // --- ASESORES ---
    const ADVISORS = {
        'Maria': { name: 'María Camila', photo: 'https://i.imgur.com/SdubRgH.jpeg', wpp: '573113173286' },
        'Sarah': { name: 'Sarah George', photo: 'https://i.imgur.com/MCSsvz9.jpeg', wpp: '573332313485' },
        'Ana': { name: 'Ana Isabel', photo: 'https://i.imgur.com/b7LIglY.jpeg', wpp: '573217598780' }
    };

    const advisorSelect = document.getElementById('asesor');
    advisorSelect.innerHTML = '<option value="" disabled selected>Selecciona tu nombre</option>' + 
        Object.keys(ADVISORS).map(id => `<option value="${id}">${ADVISORS[id].name}</option>`).join('');
    
    advisorSelect.addEventListener('change', () => {
        if(ADVISORS[advisorSelect.value]) {
            document.getElementById('whatsapp-asesor').value = ADVISORS[advisorSelect.value].wpp;
        }
    });

    // --- TEMA OSCURO ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlEl = document.documentElement;
    const savedTheme = localStorage.getItem('cyan-theme') || 'light';
    htmlEl.setAttribute('data-theme', savedTheme);
    themeToggleBtn.innerHTML = savedTheme === 'light' ? '🌙 Tema Oscuro' : '☀️ Tema Claro';

    themeToggleBtn.addEventListener('click', () => {
        const newTheme = htmlEl.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        htmlEl.setAttribute('data-theme', newTheme);
        localStorage.setItem('cyan-theme', newTheme);
        themeToggleBtn.innerHTML = newTheme === 'light' ? '🌙 Tema Oscuro' : '☀️ Tema Claro';
    });

    // --- NAVEGACIÓN ---
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        if (document.getElementById('password-input').value === ACCESS_PASSWORD) {
            document.getElementById('login-overlay').style.display = 'none';
            document.getElementById('dashboard-section').style.display = 'block';
        } else {
            document.getElementById('login-error').style.display = 'block';
        }
    });

    document.getElementById('btn-new-quote').addEventListener('click', () => {
        document.getElementById('dashboard-section').style.display = 'none';
        document.getElementById('form-section').style.display = 'block';
        fetchTRM();
    });

    document.getElementById('btn-back-dashboard').addEventListener('click', () => {
        document.getElementById('form-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'block';
    });

    document.getElementById('btn-edit-quote').addEventListener('click', () => {
        document.getElementById('confirmation-section').style.display = 'none';
        document.getElementById('form-section').style.display = 'block';
    });

    // --- TRM Y CALCULADORA ---
    const trmInput = document.getElementById('trm-input');
    const totalUsdInput = document.getElementById('total-usd');
    const totalCopInput = document.getElementById('total-cop');

    async function fetchTRM() {
        try {
            const res = await fetch('https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=1&$order=vigenciadesde%20DESC');
            const data = await res.json();
            if(data.length > 0) {
                trmInput.value = Math.round(parseFloat(data[0].valor));
                calcTotalCop();
            }
        } catch (e) { console.error(e); }
    }
    document.getElementById('btn-update-trm').addEventListener('click', fetchTRM);

    function calcTotalCop() {
        const usd = parseFloat(totalUsdInput.value) || 0;
        const trm = parseFloat(trmInput.value) || 0;
        totalCopInput.value = (usd * trm).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
    }
    totalUsdInput.addEventListener('input', calcTotalCop);
    trmInput.addEventListener('input', calcTotalCop);

    // --- CONSTRUCTOR DINÁMICO (LEGO) ---
    const container = document.getElementById('dynamic-components-container');

    function handlePaste(e) {
        e.preventDefault();
        const pasteArea = e.currentTarget; 
        const imageId = pasteArea.dataset.imgId;
        const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith('image/'));
        if (item) {
            const reader = new FileReader();
            reader.onload = event => {
                pastedImages[imageId] = event.target.result;
                const img = pasteArea.querySelector('img');
                img.src = event.target.result;
                img.style.display = 'block';
                pasteArea.querySelector('p').style.display = 'none';
            };
            reader.readAsDataURL(item.getAsFile());
        }
    }

    document.querySelector('.add-buttons-container').addEventListener('click', e => {
        if(e.target.matches('.add-section-btn')) {
            const section = e.target.dataset.section;
            if(section === 'hotel') {
                hotelCounter++;
                let html = document.getElementById('template-hotel').innerHTML.replace(/PLACEHOLDER/g, hotelCounter);
                const div = document.createElement('div'); div.innerHTML = html;
                container.appendChild(div.firstElementChild);
            } else {
                const template = document.getElementById(`template-${section}`);
                container.appendChild(template.content.cloneNode(true));
                e.target.style.display = 'none'; // Solo 1 crucero, 1 vuelo, etc.
            }
            // Activar pegado en los nuevos elementos
            container.querySelectorAll('.paste-area:not(.bound)').forEach(area => {
                area.addEventListener('paste', handlePaste);
                area.classList.add('bound');
            });
        }
    });

    container.addEventListener('click', e => {
        if(e.target.matches('.remove-section-btn')) {
            const section = e.target.dataset.section;
            e.target.closest('.dynamic-section-wrapper').remove();
            if(!section.startsWith('hotel')) {
                document.querySelector(`.add-section-btn[data-section="${section}"]`).style.display = 'block';
            }
        }
    });

    // --- GENERAR PDF ---
    function formatDate(dateStr) {
        if (!dateStr) return '';
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();
    }

    document.getElementById('main-form').addEventListener('submit', e => {
        e.preventDefault();
        
        // 1. Datos Base
        document.getElementById('pdf-current-date').textContent = formatDate(new Date().toISOString().split('T')[0]);
        document.getElementById('pdf-client-name').textContent = `HOLA ${document.getElementById('nombre-completo').value.toUpperCase()},`;
        
        const adv = ADVISORS[advisorSelect.value];
        if(adv) {
            document.getElementById('pdf-advisor-photo').src = adv.photo;
            document.getElementById('pdf-advisor-name').textContent = adv.name;
            document.getElementById('pdf-advisor-wpp').textContent = `+${adv.wpp}`;
        }

        // 2. Construir Componentes Dinámicos
        const pdfContainer = document.getElementById('pdf-dynamic-content');
        pdfContainer.innerHTML = '';

        // Crucero
        if(document.getElementById('cruise-form-wrapper')) {
            const mapImg = pastedImages['cruise-map'] ? `<img src="${pastedImages['cruise-map']}" class="pdf-comp-img">` : '';
            pdfContainer.innerHTML += `
                <div class="pdf-component-box">
                    <div class="pdf-comp-header cyan"><span>🚢 CRUCERO: ${document.getElementById('cruise-ship').value.toUpperCase()}</span></div>
                    <div class="pdf-comp-body">
                        ${mapImg}
                        <div class="pdf-comp-details" style="width: ${mapImg ? '60%' : '100%'}">
                            <p><strong>Naviera:</strong> ${document.getElementById('cruise-line').value}</p>
                            <p><strong>Itinerario:</strong> ${document.getElementById('cruise-itinerary').value}</p>
                            <p><strong>Embarque:</strong> ${formatDate(document.getElementById('cruise-date').value)}</p>
                            <p><strong>Duración:</strong> ${document.getElementById('cruise-nights').value} Noches</p>
                            <p><strong>Cabina:</strong> ${document.getElementById('cruise-cabin').value}</p>
                            <p style="margin-top:10px; color:#0088aa;"><strong>Incluye:</strong> ${document.getElementById('cruise-includes').value}</p>
                        </div>
                    </div>
                </div>`;
        }

        // Vuelos
        if(document.getElementById('flights-form-wrapper')) {
            const banner = pastedImages['flight-banner'] ? `<img src="${pastedImages['flight-banner']}" style="width:100%; border-radius:8px; margin-bottom:15px;">` : '';
            pdfContainer.innerHTML += `
                <div class="pdf-component-box">
                    <div class="pdf-comp-header"><span>✈️ VUELOS SUGERIDOS</span></div>
                    <div class="pdf-comp-body" style="flex-direction: column;">
                        ${banner}
                        <p><strong>Ruta:</strong> ${document.getElementById('flight-route').value}</p>
                        <p><strong>Detalles:</strong> ${document.getElementById('flight-details').value}</p>
                    </div>
                </div>`;
        }

        // Hoteles
        document.querySelectorAll('.hotel-form-wrapper').forEach(wrapper => {
            const id = wrapper.id.split('-').pop();
            let gal = '';
            for(let i=1; i<=3; i++) {
                if(pastedImages[`hotel-${id}-foto-${i}`]) gal += `<img src="${pastedImages[`hotel-${id}-foto-${i}`]}">`;
            }
            pdfContainer.innerHTML += `
                <div class="pdf-component-box">
                    <div class="pdf-comp-header"><span>🏨 HOTEL: ${document.getElementById(`hotel-name-${id}`).value.toUpperCase()}</span></div>
                    <div class="pdf-comp-body" style="flex-direction: column;">
                        <div class="pdf-comp-details" style="width: 100%;">
                            <p><strong>Destino:</strong> ${document.getElementById(`hotel-dest-${id}`).value}</p>
                            <p><strong>Check-in:</strong> ${formatDate(document.getElementById(`hotel-date-${id}`).value)} (${document.getElementById(`hotel-nights-${id}`).value} Noches)</p>
                            <p><strong>Régimen:</strong> ${document.getElementById(`hotel-regimen-${id}`).value}</p>
                        </div>
                        ${gal ? `<div class="pdf-gallery">${gal}</div>` : ''}
                    </div>
                </div>`;
        });

        // 3. Súper Banner y Totales
        const pax = parseInt(document.getElementById('adultos').value) + parseInt(document.getElementById('ninos').value);
        document.getElementById('pdf-pax-total').textContent = pax;
        document.getElementById('pdf-total-usd').textContent = parseFloat(totalUsdInput.value).toLocaleString('en-US');
        document.getElementById('pdf-total-cop').textContent = totalCopInput.value.replace('COP', '').trim();
        document.getElementById('pdf-deposit-usd').textContent = parseFloat(document.getElementById('pago-reserva-usd').value).toLocaleString('en-US');
        document.getElementById('pdf-deadline').textContent = formatDate(document.getElementById('fecha-limite-pago').value);
        
        document.getElementById('pdf-not-includes').textContent = document.getElementById('no-incluye').value;
        document.getElementById('pdf-validity-text').textContent = document.getElementById('validez-cupos').value;

        document.getElementById('form-section').style.display = 'none';
        document.getElementById('confirmation-section').style.display = 'block';
        window.scrollTo(0, 0);
    });

    // --- DESCARGAR PDF ---
    document.getElementById('btn-download-pdf').addEventListener('click', async () => {
        document.getElementById('loader-overlay').style.display = 'flex';
        try {
            const element = document.getElementById('voucher-to-print');
            const canvas = await html2canvas(element, { scale: 2, useCORS: true });
            const pdf = new window.jspdf.jsPDF({ orientation: 'p', unit: 'px', format:[canvas.width, canvas.height] });
            pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, canvas.width, canvas.height);
            pdf.save(`Cotizacion_Cyan_${document.getElementById('nombre-completo').value.replace(/ /g, '_')}.pdf`);
        } catch (e) { alert("Error generando PDF."); } 
        finally { document.getElementById('loader-overlay').style.display = 'none'; }
    });
});
