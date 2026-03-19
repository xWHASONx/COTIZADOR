/* ==========================================
   COTIZADOR PRO - CYAN TRAVEL (DISEÑO VENDEDOR + LINKS PDF RESTAURADOS)
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    const ACCESS_PASSWORD = 'HOLA';

    // --- CONFIGURACIÓN FIREBASE ---
    const firebaseConfig = {
        apiKey: "AIzaSyBHmGl77i125THoq5rgHFGHud9n5G9A9YM",
        authDomain: "cyan-travel-cotizador.firebaseapp.com",
        projectId: "cyan-travel-cotizador",
        storageBucket: "cyan-travel-cotizador.firebasestorage.app",
        messagingSenderId: "267039635379",
        appId: "1:267039635379:web:3cce7223ae64e84738bdc6"
    };
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();

    // --- VARIABLES GLOBALES ---
    let currentTRM = 0; 
    let currentQuoteId = null; 
    let pastedImages = {};
    let hotelCounter = 0;
    let cruiseCounter = 0;

    // --- ELEMENTOS DEL DOM ---
    const loginOverlay = document.getElementById('login-overlay');
    const loginForm = document.getElementById('login-form');
    const passwordInput = document.getElementById('password-input');
    const mainWrapper = document.querySelector('.wrapper');
    
    const dashboardSection = document.getElementById('dashboard-section');
    const formTitleSection = document.getElementById('form-title-section');
    const formSection = document.getElementById('form-section');
    const confirmationSection = document.getElementById('confirmation-section');
    
    const btnCreateNew = document.getElementById('btn-create-new');
    const searchQuoteInput = document.getElementById('search-quote');
    const quotesList = document.getElementById('quotes-list');
    
    const form = document.getElementById('pre-reserva-form');
    const dynamicComponentsContainer = document.getElementById('dynamic-components-container');
    const confirmationComponentsContainer = document.getElementById('confirmation-components-container');
    const advisorSelect = document.getElementById('asesor');
    const advisorWhatsappInput = document.getElementById('whatsapp-asesor');

    const ADVISORS = {
        'Cynthia': { name: 'Cynthia', photoUrl: 'https://dummyimage.com/150x150/000000/ffffff.png&text=Cynthia', defaultWhatsapp: '573054466406' },
        'Andres': { name: 'Andrés', photoUrl: 'https://dummyimage.com/150x150/000000/ffffff.png&text=Andres', defaultWhatsapp: '573054466406' }
    };

    const ICONS = {
        destination: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>',
        calendar: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>',
        moon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>',
        bed: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7h2a2 2 0 012 2v9a2 2 0 01-2 2h-2m-6 0H7a2 2 0 01-2-2V9a2 2 0 012-2h2m4-4h2a2 2 0 012 2v2H9V5a2 2 0 012-2zM9 12h6"></path></svg>',
        check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
        plane: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>',
        ship: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v12zm0 0v7"></path></svg>'
    };

    const TERMS_AND_CONDITIONS = {
        flights: `<h3>✈️ Tiquetes Aéreos</h3><p>Los valores e itinerarios cotizados están sujetos a cambios y disponibilidad por parte de las aerolíneas sin previo aviso. Los vuelos incluidos en esta cotización son aproximados al momento de su emisión. Para garantizar el valor y el itinerario proporcionado, se debe realizar el pago total inmediato. Ninguna aerolínea permite separar, reservar o congelar precios sin el pago completo. En caso de cambio de fecha, nombre del pasajero o cualquier modificación, la aerolínea aplicará penalidades según su política interna. Niños mayores de 2 años cumplidos pagan tarifa de adulto.</p>`,
        hotels: `<h3>🏨 Hoteles</h3><p>La reserva hotelera se realiza inicialmente con un pago parcial (separación). El saldo restante deberá estar completamente pagado al menos 45 días antes de la fecha del viaje. Si deseas modificar la fecha del viaje, se validará primero la disponibilidad en el hotel. En caso de no estar disponible, se intentará mantener el valor en otro hotel de la misma categoría. Si la nueva fecha corresponde a temporada alta y el valor se incrementa, el cliente deberá asumir la diferencia.</p>`,
        transfers: `<h3>🚐 Traslados</h3><p>Si el plan incluye traslados desde el aeropuerto al hotel y posteriormente decides comprar vuelos con llegada a otra ciudad, los traslados adicionales correrán por cuenta del cliente debido a la diferencia de distancia y el reajuste necesario en la logística.</p>`,
        cruises: `<h3>🚢 Cruceros</h3><p>La tarifa oficial del crucero es en dólares estadounidenses y el valor dado en pesos es únicamente un estimado ya que el valor real puede variar dependiendo de la tasa de cambio el día del pago. El pago del crucero se realiza directamente a la naviera a través de un link oficial donde se deberá cancelar el valor con tarjeta débito o crédito.</p>`
    };

    const GENERAL_TERMS = `<h3>Términos y condiciones</h3>
    <p>Al confirmar una reserva con Cyan Travel (en adelante, “la Agencia”), el pasajero y/o titular de la reserva (en adelante, “el Cliente”) acepta los presentes términos y condiciones: 1) Rol de la Agencia: La Agencia actúa como intermediaria entre el Cliente y los proveedores de servicios turísticos. Los servicios efectivamente prestados son responsabilidad directa de cada proveedor. 2) Itinerarios, horarios y cambios operativos: Los itinerarios, horarios, rutas, escalas, cabinas, asientos, tipos de habitación, categorías, servicios incluidos y demás características del viaje pueden ser modificados por los proveedores por razones operativas, climáticas, de seguridad, disposiciones gubernamentales o causas de fuerza mayor. La Agencia no se hace responsable por cambios, reprogramaciones, demoras, cancelaciones, overbooking, sustituciones de equipo, cierres de puertos/aeropuertos. 3) Documentación y requisitos de viaje: Es responsabilidad del Cliente contar con documentos vigentes y requisitos exigidos para su viaje: pasaporte, visas, permisos, vacunas, formularios migratorios, seguros, autorizaciones para menores, entre otros. 4) Exactitud de datos: El Cliente debe suministrar datos correctos y completos. Errores o inconsistencias pueden generar costos adicionales. 5) Pagos, confirmación y emisión: Las reservas se confirman únicamente cuando el pago ha sido recibido según lo acordado. 6) Tarifas administrativas y cargos por gestión: Las tarifas administrativas, cargos de gestión y/o cargos por servicio cobrados por la Agencia no son reembolsables. 7) Fuerza mayor y eventos fuera de control: La Agencia no será responsable por incumplimientos o afectaciones derivadas de eventos fuera de su control razonable. 8) Aceptación: La compra, pago o confirmación de la reserva implica aceptación total de estos términos.</p>
    <h3>Políticas de Cancelación, Cambios y Reembolsos</h3>
    <p>1) Política general: Todas las solicitudes de cancelación, cambios, reembolsos, reemisiones, cambios de nombre/fecha o correcciones están sujetas a las políticas y condiciones del proveedor y al tipo de tarifa adquirida. 2) Tarifas administrativas no reembolsables: Independientemente del resultado ante el proveedor, las tarifas administrativas de la Agencia no son reembolsables. 3) Penalidades, retenciones y diferencias tarifarias: En caso de que el proveedor permita cambios o reembolsos, el Cliente podrá asumir penalidades por cambio/cancelación, diferencia de tarifa, impuestos no reembolsables. 4) No show (no presentación): Si el Cliente no se presenta a tiempo, aplicarán políticas de no show del proveedor, que suelen implicar pérdida total del valor pagado. 5) Tiempos de reembolso: Cuando un reembolso sea aprobado por el proveedor, los tiempos de devolución dependen del proveedor y/o entidad financiera. La Agencia no controla estos plazos. 6) Cancelaciones o cambios del proveedor: Si el proveedor cancela o modifica el servicio, se aplicarán sus políticas. 7) Recomendación de seguro de viaje: Se recomienda adquirir seguro de asistencia/seguro de cancelación para cubrir imprevistos médicos, interrupciones del viaje o cancelaciones por causas justificadas.</p>`;

    // --- OBTENER TRM OFICIAL (DATOS ABIERTOS COLOMBIA) ---
    async function fetchTRM() {
        try {
            const response = await fetch('https://www.datos.gov.co/resource/32sa-8pi3.json?$limit=1&$order=vigenciadesde%20DESC');
            const data = await response.json();
            if (data && data.length > 0) {
                currentTRM = Math.round(parseFloat(data[0].valor));
            } else {
                throw new Error("Datos vacíos");
            }
        } catch (error) {
            console.warn("No se pudo obtener la TRM oficial, usando valor por defecto.", error);
            currentTRM = 4000; 
        }
    }

    // --- COMPRESIÓN DE IMÁGENES ---
    function compressImage(base64Str, maxWidth = 800, quality = 0.7) {
        return new Promise((resolve) => {
            let img = new Image();
            img.src = base64Str;
            img.onload = () => {
                let canvas = document.createElement('canvas');
                let width = img.width; let height = img.height;
                if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
                canvas.width = width; canvas.height = height;
                let ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
        });
    }

    // --- LÓGICA DE LOGIN ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (passwordInput.value.trim() === ACCESS_PASSWORD) {
            loginOverlay.style.display = 'none';
            mainWrapper.style.display = 'block';
            await fetchTRM();
            loadDashboard();
        } else {
            document.getElementById('login-error').style.display = 'block';
            passwordInput.value = '';
        }
    });

    // --- DASHBOARD Y FIREBASE ---
    function showView(view) {
        dashboardSection.style.display = view === 'dashboard' ? 'block' : 'none';
        formTitleSection.style.display = view === 'form' ? 'block' : 'none';
        formSection.style.display = view === 'form' ? 'block' : 'none';
        confirmationSection.style.display = view === 'pdf' ? 'block' : 'none';
        window.scrollTo(0, 0);
    }

    async function loadDashboard() {
        showView('dashboard');
        quotesList.innerHTML = '<p>Cargando cotizaciones...</p>';
        try {
            const snapshot = await db.collection('cotizaciones').orderBy('createdAt', 'desc').limit(30).get();
            renderQuotes(snapshot.docs);
            
            searchQuoteInput.addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = snapshot.docs.filter(doc => {
                    const data = doc.data();
                    return data.clientName.toLowerCase().includes(term) || data.quoteNumber.toLowerCase().includes(term);
                });
                renderQuotes(filtered);
            });
        } catch (error) {
            quotesList.innerHTML = '<p style="color:red;">Error al cargar datos. Verifica que Firestore esté habilitado y sin bloqueadores de anuncios.</p>';
            console.error(error);
        }
    }

    function renderQuotes(docs) {
        quotesList.innerHTML = '';
        if (docs.length === 0) { quotesList.innerHTML = '<p>No hay cotizaciones aún.</p>'; return; }
        
        const statusColors = { 'Pendiente': '#f39c12', 'Vendida': '#27ae60', 'Rechazada': '#c0392b' };

        docs.forEach(doc => {
            const data = doc.data();
            const date = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString('es-ES') : 'Fecha desconocida';
            const currentStatus = data.status || 'Pendiente';
            
            const card = document.createElement('div');
            card.className = 'quote-card';
            card.innerHTML = `
                <span class="quote-badge">${data.quoteNumber}</span>
                <h3>${data.clientName}</h3>
                <p>Asesor: ${data.advisorName}</p>
                <span class="quote-date">Creada: ${date}</span>
                
                <select class="status-select" data-id="${doc.id}" style="width: 100%; margin-top: 10px; padding: 8px; border-radius: 8px; border: none; color: white; font-weight: bold; background-color: ${statusColors[currentStatus]}; cursor: pointer;">
                    <option value="Pendiente" ${currentStatus === 'Pendiente' ? 'selected' : ''}>🟡 Pendiente</option>
                    <option value="Vendida" ${currentStatus === 'Vendida' ? 'selected' : ''}>🟢 Vendida</option>
                    <option value="Rechazada" ${currentStatus === 'Rechazada' ? 'selected' : ''}>🔴 Rechazada</option>
                </select>

                <button class="btn-duplicate" data-id="${doc.id}">Duplicar Cotización</button>
            `;
            
            card.querySelector('.status-select').addEventListener('change', async (e) => {
                const newStatus = e.target.value;
                e.target.style.backgroundColor = statusColors[newStatus];
                try {
                    await db.collection('cotizaciones').doc(doc.id).update({ status: newStatus });
                } catch (error) {
                    console.error("Error actualizando estado:", error);
                    alert("No se pudo actualizar el estado.");
                }
            });

            card.addEventListener('click', (e) => {
                if(e.target.classList.contains('btn-duplicate') || e.target.classList.contains('status-select')) return; 
                loadQuoteIntoForm(doc.id, data);
            });

            card.querySelector('.btn-duplicate').addEventListener('click', () => {
                const duplicatedData = { ...data, quoteNumber: generateQuoteNumber(), status: 'Pendiente' };
                loadQuoteIntoForm(null, duplicatedData); 
            });

            quotesList.appendChild(card);
        });
    }

    btnCreateNew.addEventListener('click', () => {
        currentQuoteId = null;
        initializeForm();
        showView('form');
    });

    function generateQuoteNumber() {
        const now = new Date();
        return `COT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    }

    // --- LÓGICA DEL FORMULARIO ---
    function addSection(sectionKey) {
        let templateId = `template-${sectionKey}`;
        let counter = 0;
        
        if (sectionKey === 'hotel') { hotelCounter++; counter = hotelCounter; }
        if (sectionKey === 'cruises') { cruiseCounter++; counter = cruiseCounter; }

        const template = document.getElementById(templateId);
        if (!template) return;

        let cloneHtml = template.innerHTML.replace(/PLACEHOLDER/g, counter || '');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cloneHtml;
        const cloneNode = tempDiv.firstElementChild;

        dynamicComponentsContainer.appendChild(cloneNode);

        if (sectionKey === 'hotel') {
            populateSelect(`cantidad-noches-${counter}`, 1, 30, 4, 'noche');
            populateSelect(`cantidad-habitaciones-${counter}`, 1, 10, 1, 'habitación', 'habitaciones');
            if (counter === 1) document.querySelector(`.add-section-btn[data-section="hotel"]`).style.display = 'none';
            if (counter > 1) document.querySelector(`#hotel-form-wrapper-${counter - 1} .add-subsection-btn`).style.display = 'none';
        }
        
        if (sectionKey === 'cruises') {
            populateSelect(`noches-crucero-${counter}`, 1, 30, 7, 'noche');
            document.getElementById(`trm-crucero-${counter}`).value = currentTRM;
            if (counter === 1) document.querySelector(`.add-section-btn[data-section="cruises"]`).style.display = 'none';
            if (counter > 1) document.querySelector(`#cruises-form-wrapper-${counter - 1} .add-subsection-btn`).style.display = 'none';
        }

        if (['flights', 'tours', 'transfers'].includes(sectionKey)) {
            document.querySelector(`.add-section-btn[data-section="${sectionKey}"]`).style.display = 'none';
        }

        addEventListenersToSection(cloneNode);
    }

    function populateSelect(id, min, max, defaultVal, singular, plural = singular + 's') {
        const select = document.getElementById(id);
        if(!select) return;
        for (let i = min; i <= max; i++) {
            const option = new Option(`${i} ${i === 1 ? singular : plural}`, i);
            if (i === defaultVal) option.selected = true;
            select.add(option);
        }
    }

    function removeSection(sectionKey) {
        if (sectionKey.startsWith('hotel-') || sectionKey.startsWith('cruises-')) {
            const type = sectionKey.split('-')[0];
            const num = sectionKey.split('-')[1];
            const wrapper = document.getElementById(`${type}-form-wrapper-${num}`);
            if (wrapper) wrapper.remove();
            
            if (document.querySelectorAll(`.${type}-form-wrapper`).length === 0) {
                document.querySelector(`.add-section-btn[data-section="${type === 'hotel' ? 'hotel' : 'cruises'}"]`).style.display = 'block';
                if(type === 'hotel') hotelCounter = 0;
                if(type === 'cruises') cruiseCounter = 0;
            } else {
                const lastItem = Array.from(document.querySelectorAll(`.${type}-form-wrapper`)).pop();
                lastItem.querySelector('.add-subsection-btn').style.display = 'block';
            }
        } else {
            const wrapper = document.getElementById(`${sectionKey}-form-wrapper`);
            if (wrapper) {
                wrapper.remove();
                document.querySelector(`.add-section-btn[data-section="${sectionKey}"]`).style.display = 'block';
            }
        }
    }

    form.addEventListener('click', e => {
        const { target } = e;
        const { section, subsection } = target.dataset;
        if (target.matches('.add-section-btn')) addSection(section);
        if (target.matches('.remove-section-btn')) {
            if (target.dataset.subsection) {
                const wrapper = document.getElementById(`${target.dataset.subsection}-form-wrapper`);
                if(wrapper) { wrapper.style.display = 'none'; target.style.display = 'block'; }
            } else {
                removeSection(section);
            }
        }
        if (target.matches('.add-subsection-btn')) {
            if(section === 'hotel' || section === 'cruises') addSection(section);
            else {
                const wrapper = document.getElementById(`${subsection}-form-wrapper`);
                if(wrapper) { wrapper.style.display = 'block'; target.style.display = 'none'; }
            }
        }
    });

    async function handlePaste(e) {
        e.preventDefault();
        const pasteArea = e.currentTarget; const imageId = pasteArea.dataset.imgId;
        const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith('image/'));
        if (item) {
            const reader = new FileReader();
            reader.onload = async event => {
                const base64Image = event.target.result;
                const compressedImage = await compressImage(base64Image); 
                const previewImg = pasteArea.querySelector('img');
                previewImg.src = compressedImage;
                previewImg.style.display = 'block';
                pasteArea.querySelector('p').style.display = 'none';
                pastedImages[imageId] = compressedImage;
            };
            reader.readAsDataURL(item.getAsFile());
        }
    }

    function addEventListenersToSection(sectionElement) {
        sectionElement.querySelectorAll('.paste-area').forEach(area => area.addEventListener('paste', handlePaste));
    }

    function initializeForm() {
        form.reset();
        pastedImages = {};
        hotelCounter = 0;
        cruiseCounter = 0;
        dynamicComponentsContainer.innerHTML = '';
        document.querySelectorAll('.add-section-btn').forEach(btn => btn.style.display = 'block');
        
        advisorSelect.innerHTML = '<option value="" disabled selected>Selecciona tu nombre</option>' + Object.keys(ADVISORS).map(id => `<option value="${id}">${ADVISORS[id].name}</option>`).join('');
        
        populateSelect('adultos', 1, 20, 2, 'Adulto');
        populateSelect('ninos', 0, 10, 0, 'Niño');
        
        document.getElementById('cotizacion-numero').value = generateQuoteNumber();
    }

    advisorSelect.addEventListener('change', () => {
        const selectedAdvisor = ADVISORS[advisorSelect.value];
        if (selectedAdvisor) advisorWhatsappInput.value = selectedAdvisor.defaultWhatsapp;
    });

    // --- GUARDAR EN FIREBASE Y GENERAR PDF ---
    form.addEventListener('submit', async e => { 
        e.preventDefault(); 
        if (!form.checkValidity()) { form.reportValidity(); return; }
        if (dynamicComponentsContainer.children.length === 0) { alert('Añade al menos un componente.'); return; }
        
        const quoteData = {
            quoteNumber: document.getElementById('cotizacion-numero').value,
            clientName: document.getElementById('nombre-completo').value,
            advisorId: advisorSelect.value,
            advisorName: ADVISORS[advisorSelect.value].name,
            status: 'Pendiente', 
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            formData: serializeForm(form),
            images: pastedImages
        };

        try {
            document.getElementById('loader-overlay').style.display = 'flex';
            document.getElementById('loader-text').textContent = "Guardando en la nube...";
            
            if (currentQuoteId) {
                delete quoteData.createdAt; 
                delete quoteData.status; 
                await db.collection('cotizaciones').doc(currentQuoteId).update(quoteData);
            } else {
                const docRef = await db.collection('cotizaciones').add(quoteData);
                currentQuoteId = docRef.id;
            }
            
            populateQuote(); 
            showView('pdf');
        } catch (error) {
            console.error("Error guardando:", error);
            alert("Hubo un error guardando la cotización. Revisa tu conexión y que Firestore esté habilitado.");
        } finally {
            document.getElementById('loader-overlay').style.display = 'none';
        }
    });

    function serializeForm(formNode) {
        const obj = {};
        const elements = formNode.querySelectorAll('input, select, textarea');
        elements.forEach(el => { if(el.id) obj[el.id] = el.value; });
        return obj;
    }

    function loadQuoteIntoForm(id, data) {
        currentQuoteId = id;
        initializeForm();
        
        pastedImages = data.images || {};
        const keys = Object.keys(data.formData);
        
        const hotelIds = new Set(keys.filter(k => k.startsWith('hotel-')).map(k => k.split('-')[1]));
        const cruiseIds = new Set(keys.filter(k => k.startsWith('barco-')).map(k => k.split('-')[1]));
        
        hotelIds.forEach(() => addSection('hotel'));
        cruiseIds.forEach(() => addSection('cruises'));
        if(keys.includes('ciudad-salida')) addSection('flights');
        if(keys.includes('tour-1-name')) addSection('tours');
        if(keys.includes('transfer-1-desc')) addSection('transfers');

        setTimeout(() => {
            keys.forEach(key => {
                const el = document.getElementById(key);
                if(el) el.value = data.formData[key];
            });
            
            Object.keys(pastedImages).forEach(imgId => {
                const pasteArea = document.querySelector(`[data-img-id="${imgId}"]`);
                if(pasteArea) {
                    pasteArea.querySelector('img').src = pastedImages[imgId];
                    pasteArea.querySelector('img').style.display = 'block';
                    pasteArea.querySelector('p').style.display = 'none';
                }
            });
            
            showView('form');
        }, 100); 
    }

    // --- RENDERIZADO DEL PDF ---
    function formatCurrency(value, currency = 'COP') {
        const number = parseFloat(String(value).replace(/[^0-9.-]+/g, ""));
        if (isNaN(number)) return '';
        return number.toLocaleString(currency === 'COP' ? 'es-CO' : 'en-US', { style: 'currency', currency, minimumFractionDigits: 0 });
    }

    function populateQuote() {
        const clientName = document.getElementById('nombre-completo').value;
        const quoteNumber = document.getElementById('cotizacion-numero').value;
        const adults = document.getElementById('adultos').value;
        const children = document.getElementById('ninos').value;
        
        document.getElementById('confirm-intro-text').textContent = `¡Hola, ${clientName.split(' ')[0].toUpperCase()}! He preparado estas opciones para tu próximo viaje.`;

        // INYECCIÓN DE LA ALERTA DE VISA
        const visaStatus = document.getElementById('requiere-visa').value;
        const visaAlert = document.getElementById('pdf-visa-alert');
        if(visaStatus !== 'No requiere visa') {
            visaAlert.style.display = 'block';
            visaAlert.innerHTML = `🛂 <strong>Requisito Migratorio:</strong> ${visaStatus}`;
        } else {
            visaAlert.style.display = 'none';
        }

        const customerBox = document.getElementById('confirm-customer-data-box');
        customerBox.innerHTML = `<p>Para: <strong>${clientName.toUpperCase()}</strong></p><p>Pasajeros: <strong>${adults} Adulto${adults > 1 ? 's' : ''}${children > 0 ? ` y ${children} Niño${children > 1 ? 's' : ''}` : ''}</strong></p><p>Nº Cotización: <strong>${quoteNumber}</strong> | Validez: <strong>${document.getElementById('validez-cupos').value}</strong></p>`;

        const advisor = ADVISORS[advisorSelect.value];
        document.getElementById('advisor-photo').src = advisor.photoUrl;
        document.getElementById('advisor-name').textContent = advisor.name;

        const whatsappLink = `https://wa.me/${advisorWhatsappInput.value}`;['advisor-whatsapp-btn', 'cta-reservar', 'cta-contactar'].forEach(id => {
            const el = document.getElementById(id);
            const baseText = id === 'cta-reservar' ? `¡Hola ${advisor.name}! Estoy listo para reservar según la cotización *${quoteNumber}*.` : `Hola ${advisor.name}, tengo una pregunta sobre la cotización *${quoteNumber}*.`;
            el.href = `${whatsappLink}?text=${encodeURIComponent(baseText)}`;
        });

        confirmationComponentsContainer.innerHTML = '';
        let dynamicTermsHTML = '';

        // Renderizar Hoteles
        if(document.querySelectorAll('.hotel-form-wrapper').length > 0) dynamicTermsHTML += TERMS_AND_CONDITIONS.hotels;
        document.querySelectorAll('.hotel-form-wrapper').forEach((form, index) => {
            const num = form.id.match(/\d+/)[0];
            let galleryHTML =[1, 2, 3].map(i => pastedImages[`hotel-${num}-foto-${i}`] ? `<img src="${pastedImages[`hotel-${num}-foto-${i}`]}">` : '').join('');
            confirmationComponentsContainer.innerHTML += `
                <div class="quote-option-box">
                    <div class="option-header"><h3>Hotel ${index + 1}</h3><span class="option-price">${formatCurrency(document.getElementById(`valor-total-${num}`).value, document.getElementById(`moneda-${num}`).value)}</span></div>
                    <div class="option-body">
                        <h4>${document.getElementById(`hotel-${num}`).value}</h4>
                        <div class="photo-gallery">${galleryHTML}</div>
                        <div class="details-grid">
                            <div class="data-item">${ICONS.destination}<div class="data-item-content"><strong>Destino:</strong><p>${document.getElementById(`destino-${num}`).value}</p></div></div>
                            <div class="data-item">${ICONS.moon}<div class="data-item-content"><strong>Noches:</strong><p>${document.getElementById(`cantidad-noches-${num}`).value}</p></div></div>
                        </div>
                    </div>
                </div>`;
        });

        // Renderizar Cruceros (NUEVO DISEÑO GRID)
        if(document.querySelectorAll('.cruises-form-wrapper').length > 0) dynamicTermsHTML += TERMS_AND_CONDITIONS.cruises;
        document.querySelectorAll('.cruises-form-wrapper').forEach((form, index) => {
            const num = form.id.match(/\d+/)[0];
            let galleryHTML =[1, 2, 3].map(i => pastedImages[`crucero-${num}-foto-${i}`] ? `<img src="${pastedImages[`crucero-${num}-foto-${i}`]}">` : '').join('');
            let mapHTML = pastedImages[`crucero-${num}-mapa`] ? `<div class="single-photo-container"><img src="${pastedImages[`crucero-${num}-mapa`]}"></div>` : '';
            
            confirmationComponentsContainer.innerHTML += `
                <div class="quote-option-box">
                    <div class="option-header" style="background-color: var(--c-brand-dark-accent);">
                        <h3>CRUCERO ${index + 1} - ${document.getElementById(`naviera-${num}`).value}</h3>
                        <span class="option-price">${formatCurrency(document.getElementById(`valor-crucero-${num}`).value, document.getElementById(`moneda-crucero-${num}`).value)}</span>
                    </div>
                    <div class="option-body">
                        <h4 style="text-align: center; font-size: 24px; margin-bottom: 20px;">🚢 ${document.getElementById(`barco-${num}`).value}</h4>
                        ${mapHTML}
                        <div class="photo-gallery">${galleryHTML}</div>
                        
                        <div class="cruise-specs-grid">
                            <div class="cruise-spec-item">${ICONS.destination} <div><strong>Embarque:</strong><span>${document.getElementById(`puerto-${num}`).value}</span></div></div>
                            <div class="cruise-spec-item">${ICONS.calendar} <div><strong>Zarpe:</strong><span>${document.getElementById(`fecha-zarpe-${num}`).value}</span></div></div>
                            <div class="cruise-spec-item">${ICONS.moon} <div><strong>Noches:</strong><span>${document.getElementById(`noches-crucero-${num}`).value}</span></div></div>
                            <div class="cruise-spec-item">${ICONS.bed} <div><strong>Cabina:</strong><span>${document.getElementById(`cabina-${num}`).value}</span></div></div>
                        </div>

                        <div class="cruise-inclusions">
                            <strong style="color: var(--c-brand-primary); display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">${ICONS.check} INCLUSIONES Y PROPINAS:</strong>
                            <p style="margin: 0; font-size: 14px; color: var(--c-dark-blue); font-weight: 600;">${document.getElementById(`inclusiones-${num}`).value} | Propinas: ${document.getElementById(`propinas-${num}`).value}</p>
                        </div>

                        <div class="cruise-itinerary">
                            <strong style="color: var(--c-dark-blue); display: block; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">📍 ITINERARIO DEL VIAJE:</strong>
                            <p>${document.getElementById(`itinerario-${num}`).value}</p>
                        </div>
                    </div>
                </div>`;
        });

        if (document.getElementById('flights-form-wrapper')) {
            dynamicTermsHTML += TERMS_AND_CONDITIONS.flights;
            confirmationComponentsContainer.innerHTML += `<div class="component-section"><h3>Vuelos Sugeridos</h3><div class="option-body"><p>Desde: ${document.getElementById('ciudad-salida').value}</p></div></div>`;
        }
        if (document.getElementById('transfers-form-wrapper')) {
            dynamicTermsHTML += TERMS_AND_CONDITIONS.transfers;
        }

        // INYECCIÓN DE LA BARRA DE PAGOS
        document.getElementById('confirm-pago-reserva').textContent = formatCurrency(document.getElementById('pago-reserva').value);
        document.getElementById('confirm-pago-segundo').textContent = formatCurrency(document.getElementById('pago-segundo').value);
        document.getElementById('confirm-fecha-limite').textContent = document.getElementById('fecha-limite-pago').value;
        document.getElementById('confirm-no-incluye').textContent = document.getElementById('no-incluye').value;

        document.getElementById('confirm-terms-content').innerHTML = dynamicTermsHTML + GENERAL_TERMS;
        document.getElementById('terms-section-confirm').style.display = 'block';
    }

    document.getElementById('edit-quote-btn').addEventListener('click', () => showView('form'));
    document.getElementById('new-quote-btn').addEventListener('click', () => loadDashboard());
    
    // --- GENERACIÓN DEL PDF CON LINKS RESTAURADOS ---
    document.getElementById('process-quote-btn').addEventListener('click', async () => {
        document.getElementById('loader-overlay').style.display = 'flex';
        document.getElementById('loader-text').textContent = "Generando PDF...";
        try {
            const elementToPrint = document.getElementById('voucher-to-print');
            const canvas = await html2canvas(elementToPrint, { scale: 2, useCORS: true });
            const pdf = new window.jspdf.jsPDF({ orientation: 'p', unit: 'px', format:[canvas.width, canvas.height] });
            pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, canvas.width, canvas.height);
            
            // RESTAURAR LINKS CLICKEABLES EN EL PDF
            const scaleFactor = canvas.width / elementToPrint.offsetWidth;
            ['advisor-whatsapp-btn', 'cta-reservar', 'cta-contactar'].forEach(id => {
                const element = document.getElementById(id);
                if (!element || !element.href) return;
                const rect = element.getBoundingClientRect();
                const containerRect = elementToPrint.getBoundingClientRect();
                pdf.link(
                    (rect.left - containerRect.left) * scaleFactor,
                    (rect.top - containerRect.top) * scaleFactor,
                    rect.width * scaleFactor,
                    rect.height * scaleFactor,
                    { url: element.href }
                );
            });

            pdf.save(`${document.getElementById('cotizacion-numero').value}.pdf`);
        } catch (error) { alert("Error generando PDF"); } 
        finally { document.getElementById('loader-overlay').style.display = 'none'; }
    });

});
