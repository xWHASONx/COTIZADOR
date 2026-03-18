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
    let pastedImages = {}; 
    let hotelCounter = 0;

    const ADVISORS = {
        'Maria': { name: 'María Camila', wpp: '573113173286' },
        'Sarah': { name: 'Sarah George', wpp: '573332313485' },
        'Ana': { name: 'Ana Isabel', wpp: '573217598780' }
    };

    const REGIMEN_TEMPLATES = {
        'todo_incluido': `Todo incluido: Desayunos, almuerzos, cenas, snacks y bebidas ilimitadas.`,
        'pension_completa': `Pensión Completa: Desayuno, almuerzo y cena.`,
        'media_pension': `Media Pensión: Desayuno y cena.`,
        'desayuno': `Alojamiento y Desayuno.`,
        'solo_hotel': `Solo alojamiento.`
    };

    function initializeForm() {
        document.getElementById('pre-reserva-form').reset();
        pastedImages = {};
        hotelCounter = 0;
        document.getElementById('dynamic-components-container').innerHTML = '';
        document.querySelectorAll('.add-section-btn').forEach(btn => btn.style.display = 'block');
        
        const advisorSelect = document.getElementById('asesor');
        advisorSelect.innerHTML = '<option value="" disabled selected>Selecciona tu nombre</option>' + 
            Object.keys(ADVISORS).map(id => `<option value="${id}">${ADVISORS[id].name}</option>`).join('');
        
        const adultsSelect = document.getElementById('adultos');
        const ninosSelect = document.getElementById('ninos');
        adultsSelect.innerHTML = ''; ninosSelect.innerHTML = '';
        for (let i = 1; i <= 20; i++) {
            const option = new Option(i, i);
            if (i === 2) option.selected = true;
            adultsSelect.add(option);
        }
        for (let i = 0; i <= 10; i++) {
            const text = i === 0 ? '0' : (i === 1 ? '1 niño' : `${i} niños`);
            ninosSelect.add(new Option(text, i));
        }

        const now = new Date();
        document.getElementById('cotizacion-numero').value = `COT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    }

    document.getElementById('asesor').addEventListener('change', (e) => {
        if(ADVISORS[e.target.value]) document.getElementById('whatsapp-asesor').value = ADVISORS[e.target.value].wpp;
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
        initializeForm();
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

    // --- CONSTRUCTOR DINÁMICO ---
    const dynamicComponentsContainer = document.getElementById('dynamic-components-container');

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

    function addEventListenersToSection(sectionElement) {
        sectionElement.querySelectorAll('.paste-area').forEach(area => area.addEventListener('paste', handlePaste));
    }

    function addSection(sectionKey) {
        if (sectionKey === 'hotel') {
            hotelCounter++;
            const template = document.getElementById('template-hotel');
            let cloneHtml = template.innerHTML.replace(/PLACEHOLDER/g, hotelCounter);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = cloneHtml;
            const cloneNode = tempDiv.firstElementChild;

            dynamicComponentsContainer.appendChild(cloneNode);

            const nightsSelect = document.getElementById(`cantidad-noches-${hotelCounter}`);
            for (let i = 1; i <= 30; i++) {
                const option = new Option(`${i} noche${i > 1 ? 's' : ''}`, i);
                if (i === 4) option.selected = true;
                nightsSelect.add(option);
            }
            const roomsSelect = document.getElementById(`cantidad-habitaciones-${hotelCounter}`);
            for (let i = 1; i <= 10; i++) {
                const option = new Option(`${i} habitación${i > 1 ? 'es' : ''}`, i);
                if (i === 1) option.selected = true;
                roomsSelect.add(option);
            }
            
            addEventListenersToSection(cloneNode);
            
            if (hotelCounter === 1) document.querySelector(`.add-section-btn[data-section="hotel"]`).style.display = 'none';
            if (hotelCounter > 1) document.querySelector(`#hotel-form-wrapper-${hotelCounter - 1} .add-subsection-btn`).style.display = 'none';
        } else {
            const template = document.getElementById(`template-${sectionKey}`);
            const clone = template.content.cloneNode(true);
            dynamicComponentsContainer.appendChild(clone);
            addEventListenersToSection(dynamicComponentsContainer.querySelector(`#${sectionKey}-form-wrapper`));
            document.querySelector(`.add-section-btn[data-section="${sectionKey}"]`).style.display = 'none';
        }
    }

    function removeSection(sectionKey) {
        if (sectionKey.startsWith('hotel-')) {
            const wrapper = document.getElementById(`hotel-form-wrapper-${sectionKey.split('-')[1]}`);
            if (wrapper) {
                wrapper.remove();
                if (document.querySelectorAll('.hotel-form-wrapper').length === 0) {
                    document.querySelector(`.add-section-btn[data-section="hotel"]`).style.display = 'block';
                    hotelCounter = 0;
                } else {
                    const lastHotel = Array.from(document.querySelectorAll('.hotel-form-wrapper')).pop();
                    lastHotel.querySelector('.add-subsection-btn').style.display = 'block';
                }
            }
        } else {
            const originalWrapper = document.getElementById(`${sectionKey}-form-wrapper`);
            if (originalWrapper) {
                originalWrapper.remove();
                document.querySelector(`.add-section-btn[data-section="${sectionKey}"]`).style.display = 'block';
            }
        }
    }

    function addSubSection(subSectionKey) {
        if (subSectionKey === 'hotel') addSection('hotel');
        else {
            const wrapper = document.getElementById(`${subSectionKey}-form-wrapper`);
            if (wrapper) {
                wrapper.style.display = 'block';
                document.querySelector(`.add-subsection-btn[data-subsection="${subSectionKey}"]`).style.display = 'none';
            }
        }
    }
    
    function removeSubSection(subSectionKey) {
        const wrapper = document.getElementById(`${subSectionKey}-form-wrapper`);
        if (wrapper) {
            wrapper.style.display = 'none';
            wrapper.querySelectorAll('input').forEach(input => input.value = '');
            document.querySelector(`.add-subsection-btn[data-subsection="${subSectionKey}"]`).style.display = 'block';
        }
    }

    document.getElementById('pre-reserva-form').addEventListener('click', e => {
        const { target } = e;
        const { section, subsection } = target.dataset;
        if (target.matches('.add-section-btn')) addSection(section);
        if (target.matches('.remove-section-btn')) {
            if (target.dataset.subsection) removeSubSection(target.dataset.subsection);
            else removeSection(section);
        }
        if (target.matches('.add-subsection-btn')) addSubSection(section || subsection);
    });

    // --- GENERAR PDF EDITORIAL ---
    function formatDate(dateStr) {
        if (!dateStr) return '';
        return new Date(dateStr + 'T00:00:00').toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();
    }

    document.getElementById('pre-reserva-form').addEventListener('submit', e => {
        e.preventDefault();
        
        // 1. Datos Base
        document.getElementById('pdf-current-date').textContent = formatDate(new Date().toISOString().split('T')[0]);
        document.getElementById('pdf-client-name').textContent = `HOLA ${document.getElementById('nombre-completo').value.toUpperCase()},`;
        document.getElementById('pdf-quote-number').textContent = document.getElementById('cotizacion-numero').value;
        
        const adv = ADVISORS[document.getElementById('asesor').value];
        if(adv) document.getElementById('pdf-advisor-wpp').textContent = `+${adv.wpp}`;

        // 2. Construir Componentes Dinámicos (Estilo Editorial)
        const pdfContainer = document.getElementById('pdf-dynamic-content');
        pdfContainer.innerHTML = '';

        // Crucero
        if(document.getElementById('cruise-form-wrapper')) {
            const mapImg = pastedImages['cruise-map'] ? `<div class="pdf-img-container"><img src="${pastedImages['cruise-map']}"></div>` : '';
            pdfContainer.innerHTML += `
                <div class="pdf-section-title">CRUCERO</div>
                <div class="pdf-sub-bar">
                    <span>${document.getElementById('cruise-ship').value.toUpperCase()}</span>
                    <span>${document.getElementById('cruise-date').value.split('-').reverse().join('/')}</span>
                </div>
                <div class="pdf-flex-row">
                    ${mapImg}
                    <div class="pdf-details" style="width: ${mapImg ? '55%' : '100%'}">
                        <p><strong>Puertos:</strong> ${document.getElementById('cruise-itinerary').value}</p>
                        <p><strong>Fecha de Embarque:</strong> ${formatDate(document.getElementById('cruise-date').value)}</p>
                        <p><strong>Duración:</strong> ${document.getElementById('cruise-nights').value} Noches</p>
                        <p><strong>Barco:</strong> ${document.getElementById('cruise-ship').value.toUpperCase()}</p>
                        <p><strong>Tipo de cabinas:</strong> ${document.getElementById('cruise-cabin').value}</p>
                        <p><strong>Número de cabina:</strong> POR ASIGNAR</p>
                    </div>
                </div>
                <div class="pdf-inclusions">
                    <div class="pdf-inc-title">QUÉ INCLUYE:</div>
                    <p>${document.getElementById('cruise-includes').value}</p>
                </div>`;
        }

        // Vuelos
        if(document.getElementById('flights-form-wrapper')) {
            const banner = pastedImages['flight-banner-preview'] ? `<div class="pdf-img-container" style="width:100%; margin-bottom:15px;"><img src="${pastedImages['flight-banner-preview']}"></div>` : '';
            let vuelosHtml = `<p><strong>Ida/Vuelta:</strong> ${document.getElementById('flight-1-airline').value}</p>`;
            if(document.getElementById('flight-2-form-wrapper').style.display !== 'none' && document.getElementById('flight-2-airline').value) {
                vuelosHtml += `<p><strong>Opción 2:</strong> ${document.getElementById('flight-2-airline').value}</p>`;
            }
            pdfContainer.innerHTML += `
                <div class="pdf-section-title">VUELOS</div>
                <div class="pdf-sub-bar"><span>DESDE ${document.getElementById('ciudad-salida').value.toUpperCase()}</span></div>
                <div class="pdf-flex-row" style="flex-direction: column;">
                    ${banner}
                    <div class="pdf-details" style="width: 100%;">${vuelosHtml}</div>
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
                <div class="pdf-section-title">ALOJAMIENTO</div>
                <div class="pdf-sub-bar"><span>${document.getElementById(`hotel-${id}`).value.toUpperCase()}</span></div>
                <div class="pdf-flex-row" style="flex-direction: column;">
                    <div class="pdf-details" style="width: 100%;">
                        <p><strong>Destino:</strong> ${document.getElementById(`destino-${id}`).value}</p>
                        <p><strong>Check-in:</strong> ${formatDate(document.getElementById(`fecha-viaje-${id}`).value)} (${document.getElementById(`cantidad-noches-${id}`).options[document.getElementById(`cantidad-noches-${id}`).selectedIndex].text})</p>
                        <p><strong>Régimen:</strong> ${REGIMEN_TEMPLATES[document.getElementById(`regimen-${id}`).value]}</p>
                    </div>
                    ${gal ? `<div class="pdf-gallery">${gal}</div>` : ''}
                </div>`;
        });

        // Tours y Traslados (Mismo estilo limpio)
        if(document.getElementById('tours-form-wrapper')) {
            const img = pastedImages['tour-main-photo'] ? `<div class="pdf-img-container"><img src="${pastedImages['tour-main-photo']}"></div>` : '';
            pdfContainer.innerHTML += `
                <div class="pdf-section-title">TOURS / EXTRAS</div>
                <div class="pdf-flex-row" style="margin-top: 20px;">
                    ${img}
                    <div class="pdf-details" style="width: ${img ? '55%' : '100%'}"><p>${document.getElementById('tour-1-name').value}</p></div>
                </div>`;
        }

        if(document.getElementById('transfers-form-wrapper')) {
            const img = pastedImages['transfer-main-photo'] ? `<div class="pdf-img-container"><img src="${pastedImages['transfer-main-photo']}"></div>` : '';
            pdfContainer.innerHTML += `
                <div class="pdf-section-title">TRASLADOS</div>
                <div class="pdf-flex-row" style="margin-top: 20px;">
                    ${img}
                    <div class="pdf-details" style="width: ${img ? '55%' : '100%'}"><p>${document.getElementById('transfer-1-desc').value}</p></div>
                </div>`;
        }

        // 3. Súper Banner y Totales
        const pax = parseInt(document.getElementById('adultos').value) + parseInt(document.getElementById('ninos').value);
        document.getElementById('pdf-pax-total').textContent = pax;
        document.getElementById('pdf-total-usd').textContent = parseFloat(totalUsdInput.value).toLocaleString('en-US', {minimumFractionDigits: 2});
        document.getElementById('pdf-total-cop').textContent = totalCopInput.value.replace('COP', '').trim();
        document.getElementById('pdf-deposit-usd').textContent = parseFloat(document.getElementById('pago-reserva').value).toLocaleString('en-US', {minimumFractionDigits: 2});
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
            pdf.save(`${document.getElementById('cotizacion-numero').value}_${document.getElementById('nombre-completo').value.replace(/ /g, '_')}.pdf`);
        } catch (e) { alert("Error generando PDF."); } 
        finally { document.getElementById('loader-overlay').style.display = 'none'; }
    });
});
