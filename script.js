/* ==========================================
   COTIZADOR PRO - CYAN TRAVEL (VERSIÓN DEFINITIVA Y DEPURADA)
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
    
    // Initialize Firebase safely
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
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

    const REGIMEN_TEMPLATES = {
        'todo_incluido': `Todo incluido: Desayunos, almuerzos, cenas, snacks y bebidas ilimitadas.`,
        'pension_completa': `Pensión Completa: Desayuno, almuerzo y cena.`,
        'media_pension': `Media Pensión: Desayuno y cena.`,
        'desayuno': `Alojamiento y Desayuno.`,
        'solo_hotel': `Solo alojamiento.`
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

    const NAVIERA_LOGOS = {
        'Royal Caribbean': 'https://logo.clearbit.com/royalcaribbean.com',
        'Carnival Cruise Line': 'https://logo.clearbit.com/carnival.com',
        'MSC Cruises': 'https://logo.clearbit.com/msccruises.com',
        'Norwegian Cruise Line (NCL)': 'https://logo.clearbit.com/ncl.com',
        'Princess Cruises': 'https://logo.clearbit.com/princess.com',
        'Celebrity Cruises': 'https://logo.clearbit.com/celebritycruises.com',
        'Disney Cruise Line': 'https://logo.clearbit.com/disneycruise.disney.go.com',
        'Holland America Line': 'https://logo.clearbit.com/hollandamerica.com',
        'Costa Cruceros': 'https://logo.clearbit.com/costacruises.com',
        'Virgin Voyages': 'https://logo.clearbit.com/virginvoyages.com',
        'AmaWaterways': 'https://logo.clearbit.com/amawaterways.com'
    };

    // --- OBTENER TRM OFICIAL ---
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

    // --- COMPRESIÓN SÚPER AGRESIVA ---
    function compressImage(base64Str, maxWidth = 500, quality = 0.4) {
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
    if(loginForm) {
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
    }

    // --- DASHBOARD Y FIREBASE ---
    function showView(view) {
        if(dashboardSection) dashboardSection.style.display = view === 'dashboard' ? 'block' : 'none';
        if(formTitleSection) formTitleSection.style.display = view === 'form' ? 'block' : 'none';
        if(formSection) formSection.style.display = view === 'form' ? 'block' : 'none';
        if(confirmationSection) confirmationSection.style.display = view === 'pdf' ? 'block' : 'none';
        window.scrollTo(0, 0);
    }

    async function loadDashboard() {
        showView('dashboard');
        if(!quotesList) return;
        quotesList.innerHTML = '<p>Cargando cotizaciones...</p>';
        try {
            const snapshot = await db.collection('cotizaciones').orderBy('createdAt', 'desc').limit(30).get();
            renderQuotes(snapshot.docs);
            
            if(searchQuoteInput) {
                searchQuoteInput.addEventListener('input', (e) => {
                    const term = e.target.value.toLowerCase();
                    const filtered = snapshot.docs.filter(doc => {
                        const data = doc.data();
                        return (data.clientName && data.clientName.toLowerCase().includes(term)) || 
                               (data.quoteNumber && data.quoteNumber.toLowerCase().includes(term));
                    });
                    renderQuotes(filtered);
                });
            }
        } catch (error) {
            quotesList.innerHTML = '<p style="color:red;">Error al cargar datos. Por favor, desactiva tu bloqueador de anuncios (AdBlock/Brave Shields) para que la base de datos funcione.</p>';
            console.error(error);
        }
    }

    function renderQuotes(docs) {
        if(!quotesList) return;
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
                <span class="quote-badge">${data.quoteNumber || 'N/A'}</span>
                <h3>${data.clientName || 'Cliente sin nombre'}</h3>
                <p>Asesor: ${data.advisorName || 'N/A'}</p>
                <span class="quote-date">Creada: ${date}</span>
                
                <select class="status-select" data-id="${doc.id}" style="width: 100%; margin-top: 10px; padding: 8px; border-radius: 8px; border: none; color: white; font-weight: bold; background-color: ${statusColors[currentStatus]}; cursor: pointer;">
                    <option value="Pendiente" ${currentStatus === 'Pendiente' ? 'selected' : ''}>🟡 Pendiente</option>
                    <option value="Vendida" ${currentStatus === 'Vendida' ? 'selected' : ''}>🟢 Vendida</option>
                    <option value="Rechazada" ${currentStatus === 'Rechazada' ? 'selected' : ''}>🔴 Rechazada</option>
                </select>

                <button class="btn-duplicate" data-id="${doc.id}">Duplicar Cotización</button>
            `;
            
            const statusSelect = card.querySelector('.status-select');
            if(statusSelect) {
                statusSelect.addEventListener('change', async (e) => {
                    const newStatus = e.target.value;
                    e.target.style.backgroundColor = statusColors[newStatus];
                    try {
                        await db.collection('cotizaciones').doc(doc.id).update({ status: newStatus });
                    } catch (error) {
                        console.error("Error actualizando estado:", error);
                        alert("No se pudo actualizar el estado.");
                    }
                });
            }

            card.addEventListener('click', (e) => {
                if(e.target.classList.contains('btn-duplicate') || e.target.classList.contains('status-select')) return; 
                loadQuoteIntoForm(doc.id, data);
            });

            const btnDuplicate = card.querySelector('.btn-duplicate');
            if(btnDuplicate) {
                btnDuplicate.addEventListener('click', () => {
                    const duplicatedData = { ...data, quoteNumber: generateQuoteNumber(), status: 'Pendiente' };
                    loadQuoteIntoForm(null, duplicatedData); 
                });
            }

            quotesList.appendChild(card);
        });
    }

    if(btnCreateNew) {
        btnCreateNew.addEventListener('click', () => {
            currentQuoteId = null;
            initializeForm();
            showView('form');
        });
    }

    function generateQuoteNumber() {
        const now = new Date();
        return `COT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    }

    // --- LÓGICA DEL FORMULARIO ---
    const toggleNombreCliente = document.getElementById('mostrar-nombre-cliente');
    if(toggleNombreCliente) {
        toggleNombreCliente.addEventListener('change', (e) => {
            const campo = document.getElementById('campo-nombre-cliente');
            if(campo) campo.style.display = e.target.checked ? 'flex' : 'none';
        });
    }

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

        if(dynamicComponentsContainer) {
            dynamicComponentsContainer.appendChild(cloneNode);
        }

        if (sectionKey === 'hotel') {
            populateSelect(`cantidad-noches-${counter}`, 1, 30, 4, 'noche');
            populateSelect(`cantidad-habitaciones-${counter}`, 1, 10, 1, 'habitación', 'habitaciones');
            const btnAdd = document.querySelector(`.add-section-btn[data-section="hotel"]`);
            if (counter === 1 && btnAdd) btnAdd.style.display = 'none';
            if (counter > 1) {
                const prevBtn = document.querySelector(`#hotel-form-wrapper-${counter - 1} .add-subsection-btn`);
                if(prevBtn) prevBtn.style.display = 'none';
            }
        }
        
        if (sectionKey === 'cruises') {
            populateSelect(`noches-crucero-${counter}`, 1, 30, 7, 'noche');
            const trmInput = document.getElementById(`trm-crucero-${counter}`);
            if(trmInput) trmInput.value = currentTRM;
            
            const switchMapa = document.getElementById(`switch-mapa-${counter}`);
            if(switchMapa) {
                switchMapa.addEventListener('change', (e) => {
                    const container = document.getElementById(`container-mapa-${counter}`);
                    if(container) container.style.display = e.target.checked ? 'flex' : 'none';
                });
            }
            
            const switchTabla = document.getElementById(`switch-tabla-${counter}`);
            if(switchTabla) {
                switchTabla.addEventListener('change', (e) => {
                    const container = document.getElementById(`container-tabla-${counter}`);
                    if(container) container.style.display = e.target.checked ? 'block' : 'none';
                });
            }

            const btnAdd = document.querySelector(`.add-section-btn[data-section="cruises"]`);
            if (counter === 1 && btnAdd) btnAdd.style.display = 'none';
            if (counter > 1) {
                const prevBtn = document.querySelector(`#cruises-form-wrapper-${counter - 1} .add-subsection-btn`);
                if(prevBtn) prevBtn.style.display = 'none';
            }
        }

        if (['flights', 'tours', 'transfers'].includes(sectionKey)) {
            const btnAdd = document.querySelector(`.add-section-btn[data-section="${sectionKey}"]`);
            if(btnAdd) btnAdd.style.display = 'none';
        }

        addEventListenersToSection(cloneNode);
    }

    function populateSelect(id, min, max, defaultVal, singular, plural = singular + 's') {
        const select = document.getElementById(id);
        if(!select) return;
        select.innerHTML = ''; 
        for (let i = min; i <= max; i++) {
            const option = new Option(`${i} ${i === 1 ? singular : plural}`, i);
            if (i === defaultVal) option.selected = true;
            select.add(option);
        }
    }

    window.addRow = function(tableId) {
        const tbody = document.querySelector(`#${tableId} tbody`);
        if(!tbody) return;
        const cols = tbody.rows[0] ? tbody.rows[0].cells.length : 4;
        let html = '<tr>';
        for(let i=0; i<cols; i++) html += '<td contenteditable="true">-</td>';
        html += '</tr>';
        tbody.insertAdjacentHTML('beforeend', html);
    };

    window.addCabin = function(cruiseId) {
        const container = document.getElementById(`cabinas-container-${cruiseId}`);
        if(!container) return;
        const cabinCount = container.children.length + 1;
        const cabinId = `${cruiseId}-${cabinCount}`;
        const html = `
            <div class="cabin-row" id="cabin-row-${cabinId}">
                <select id="cabina-tipo-${cabinId}">
                    <option value="Interior">Interior</option>
                    <option value="Vista al Mar (Exterior)">Vista al Mar (Exterior)</option>
                    <option value="Balcón">Balcón</option>
                    <option value="Balcón (vista al mar)">Balcón (vista al mar)</option>
                    <option value="Balcón vista interna">Balcón vista interna</option>
                    <option value="Vista al mar obstruida">Vista al mar obstruida</option>
                    <option value="Suite">Suite</option>
                </select>
                <input type="text" id="cabina-num-${cabinId}" placeholder="Nº Cabina (Ej: Por asignar)">
                <input type="text" id="cabina-pax-${cabinId}" placeholder="Pasajeros (Ej: 2 Adultos)">
                <input type="text" id="cabina-precio-usd-${cabinId}" placeholder="Precio USD">
                <input type="text" id="cabina-precio-cop-${cabinId}" placeholder="Estimado COP (Opcional)">
                <button type="button" class="remove-cabin-btn" onclick="this.parentElement.remove()">X</button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    };

    function removeSection(sectionKey) {
        if (sectionKey.startsWith('hotel-') || sectionKey.startsWith('cruises-')) {
            const type = sectionKey.split('-')[0];
            const num = sectionKey.split('-')[1];
            const wrapper = document.getElementById(`${type}-form-wrapper-${num}`);
            if (wrapper) wrapper.remove();
            
            if (document.querySelectorAll(`.${type}-form-wrapper`).length === 0) {
                const btnAdd = document.querySelector(`.add-section-btn[data-section="${type === 'hotel' ? 'hotel' : 'cruises'}"]`);
                if(btnAdd) btnAdd.style.display = 'block';
                if(type === 'hotel') hotelCounter = 0;
                if(type === 'cruises') cruiseCounter = 0;
            } else {
                const lastItem = Array.from(document.querySelectorAll(`.${type}-form-wrapper`)).pop();
                if(lastItem) {
                    const btnSub = lastItem.querySelector('.add-subsection-btn');
                    if(btnSub) btnSub.style.display = 'block';
                }
            }
        } else {
            const wrapper = document.getElementById(`${sectionKey}-form-wrapper`);
            if (wrapper) {
                wrapper.remove();
                const btnAdd = document.querySelector(`.add-section-btn[data-section="${sectionKey}"]`);
                if(btnAdd) btnAdd.style.display = 'block';
            }
        }
    }

    if(form) {
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
    }

    // --- CARGA DE IMÁGENES ---
    let currentUploadArea = null;
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if(!file || !currentUploadArea) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            const base64 = event.target.result;
            const compressed = await compressImage(base64);
            const imgId = currentUploadArea.dataset.imgId;
            pastedImages[imgId] = compressed;
            const imgEl = currentUploadArea.querySelector('img');
            const pEl = currentUploadArea.querySelector('p');
            if(imgEl) { imgEl.src = compressed; imgEl.style.display = 'block'; }
            if(pEl) pEl.style.display = 'none';
        };
        reader.readAsDataURL(file);
    };

    async function handlePaste(e) {
        e.preventDefault();
        const pasteArea = e.currentTarget; 
        const imageId = pasteArea.dataset.imgId;
        const item = Array.from(e.clipboardData.items).find(i => i.type.startsWith('image/'));
        if (item) {
            const reader = new FileReader();
            reader.onload = async event => {
                const base64Image = event.target.result;
                const compressedImage = await compressImage(base64Image); 
                const previewImg = pasteArea.querySelector('img');
                const pEl = pasteArea.querySelector('p');
                if(previewImg) { previewImg.src = compressedImage; previewImg.style.display = 'block'; }
                if(pEl) pEl.style.display = 'none';
                pastedImages[imageId] = compressedImage;
            };
            reader.readAsDataURL(item.getAsFile());
        }
    }

    function addEventListenersToSection(sectionElement) {
        sectionElement.querySelectorAll('.paste-area').forEach(area => {
            area.addEventListener('paste', handlePaste);
            area.addEventListener('click', (e) => {
                currentUploadArea = e.currentTarget;
                fileInput.click();
            });
        });
    }

    function initializeForm() {
        if(form) form.reset();
        pastedImages = {};
        hotelCounter = 0;
        cruiseCounter = 0;
        if(dynamicComponentsContainer) dynamicComponentsContainer.innerHTML = '';
        document.querySelectorAll('.add-section-btn').forEach(btn => btn.style.display = 'block');
        
        if(advisorSelect) {
            advisorSelect.innerHTML = '<option value="" disabled selected>Selecciona tu nombre</option>' + Object.keys(ADVISORS).map(id => `<option value="${id}">${ADVISORS[id].name}</option>`).join('');
        }
        
        populateSelect('adultos', 1, 20, 2, 'Adulto');
        populateSelect('jovenes', 0, 10, 0, 'Joven', 'Jóvenes');
        populateSelect('ninos', 0, 10, 0, 'Niño');
        
        const quoteNumInput = document.getElementById('cotizacion-numero');
        if(quoteNumInput) quoteNumInput.value = generateQuoteNumber();
    }

    if(advisorSelect) {
        advisorSelect.addEventListener('change', () => {
            const selectedAdvisor = ADVISORS[advisorSelect.value];
            if (selectedAdvisor && advisorWhatsappInput) {
                advisorWhatsappInput.value = selectedAdvisor.defaultWhatsapp;
            }
        });
    }

    // --- GUARDAR EN FIREBASE Y GENERAR PDF ---
    if(form) {
        form.addEventListener('submit', async e => { 
            e.preventDefault(); 
            if (!form.checkValidity()) { form.reportValidity(); return; }
            if (dynamicComponentsContainer && dynamicComponentsContainer.children.length === 0) { 
                alert('Añade al menos un componente.'); 
                return; 
            }
            
            document.querySelectorAll('.editable-table').forEach(table => {
                const id = table.id;
                const html = table.innerHTML;
                let hiddenInput = document.getElementById(`html-${id}`);
                if(!hiddenInput) {
                    hiddenInput = document.createElement('input');
                    hiddenInput.type = 'hidden';
                    hiddenInput.id = `html-${id}`;
                    form.appendChild(hiddenInput);
                }
                hiddenInput.value = html;
            });

            document.querySelectorAll('.cabin-row').forEach(row => {
                const id = row.id;
                const html = row.innerHTML;
                let hiddenInput = document.getElementById(`html-${id}`);
                if(!hiddenInput) {
                    hiddenInput = document.createElement('input');
                    hiddenInput.type = 'hidden';
                    hiddenInput.id = `html-${id}`;
                    form.appendChild(hiddenInput);
                }
                hiddenInput.value = html;
            });

            const quoteData = {
                quoteNumber: document.getElementById('cotizacion-numero') ? document.getElementById('cotizacion-numero').value : '',
                clientName: document.getElementById('nombre-completo') ? document.getElementById('nombre-completo').value : '',
                advisorId: advisorSelect ? advisorSelect.value : '',
                advisorName: (advisorSelect && ADVISORS[advisorSelect.value]) ? ADVISORS[advisorSelect.value].name : '',
                status: 'Pendiente', 
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                formData: serializeForm(form),
                images: pastedImages
            };

            const payloadSize = JSON.stringify(quoteData).length;
            if (payloadSize > 1000000) {
                alert("⚠️ La cotización tiene demasiadas imágenes o son muy pesadas. Por favor, elimina algunas fotos e intenta de nuevo.");
                return;
            }

            try {
                const loader = document.getElementById('loader-overlay');
                const loaderText = document.getElementById('loader-text');
                if(loader) loader.style.display = 'flex';
                if(loaderText) loaderText.textContent = "Guardando en la nube...";
                
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
                alert("Hubo un error guardando la cotización. Revisa tu conexión y asegúrate de no tener bloqueadores de anuncios activos.");
            } finally {
                const loader = document.getElementById('loader-overlay');
                if(loader) loader.style.display = 'none';
            }
        });
    }

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
                if(el) {
                    if(el.type === 'checkbox') el.checked = data.formData[key] === 'on' || data.formData[key] === true;
                    else el.value = data.formData[key];
                }
            });

            keys.filter(k => k.startsWith('html-tabla-itinerario-')).forEach(k => {
                const tableId = k.replace('html-', '');
                const table = document.getElementById(tableId);
                if(table) table.innerHTML = data.formData[k];
            });

            keys.filter(k => k.startsWith('html-cabin-row-')).forEach(k => {
                const rowId = k.replace('html-', '');
                const cruiseId = rowId.split('-')[2];
                const container = document.getElementById(`cabinas-container-${cruiseId}`);
                if(container) {
                    const div = document.createElement('div');
                    div.className = 'cabin-row';
                    div.id = rowId;
                    div.innerHTML = data.formData[k];
                    container.appendChild(div);
                    
                    div.querySelectorAll('input, select').forEach(input => {
                        if(data.formData[input.id]) input.value = data.formData[input.id];
                    });
                }
            });
            
            Object.keys(pastedImages).forEach(imgId => {
                const pasteArea = document.querySelector(`[data-img-id="${imgId}"]`);
                if(pasteArea) {
                    const imgEl = pasteArea.querySelector('img');
                    const pEl = pasteArea.querySelector('p');
                    if(imgEl) { imgEl.src = pastedImages[imgId]; imgEl.style.display = 'block'; }
                    if(pEl) pEl.style.display = 'none';
                }
            });
            
            showView('form');
        }, 100); 
    }

    // --- RENDERIZADO DEL PDF ---
    function formatCurrency(value, currency = 'COP') {
        if(!value) return '';
        const number = parseFloat(String(value).replace(/[^0-9.-]+/g, ""));
        if (isNaN(number)) return '';
        return number.toLocaleString(currency === 'COP' ? 'es-CO' : 'en-US', { style: 'currency', currency, minimumFractionDigits: 0 });
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function populateQuote() {
        const showNameEl = document.getElementById('mostrar-nombre-cliente');
        const showName = showNameEl ? showNameEl.checked : true;
        const clientName = document.getElementById('nombre-completo') ? document.getElementById('nombre-completo').value : '';
        const quoteNumber = document.getElementById('cotizacion-numero') ? document.getElementById('cotizacion-numero').value : '';
        const adultos = document.getElementById('adultos') ? document.getElementById('adultos').value : '0';
        const jovenes = document.getElementById('jovenes') ? document.getElementById('jovenes').value : '0';
        const ninos = document.getElementById('ninos') ? document.getElementById('ninos').value : '0';
        
        const introTextEl = document.getElementById('confirm-intro-text');
        const customerBox = document.getElementById('confirm-customer-data-box');

        if(showName && clientName) {
            if(introTextEl) introTextEl.textContent = `¡Hola, ${clientName.split(' ')[0].toUpperCase()}! Te compartimos las mejores opciones que encontramos para ti.`;
            
            let paxText = `${adultos} Adulto${adultos > 1 ? 's' : ''}`;
            if(jovenes > 0) paxText += `, ${jovenes} Joven${jovenes > 1 ? 'es' : ''}`;
            if(ninos > 0) paxText += ` y ${ninos} Niño${ninos > 1 ? 's' : ''}`;

            const validez = document.getElementById('validez-cupos') ? document.getElementById('validez-cupos').value : '';
            if(customerBox) {
                customerBox.innerHTML = `<p>Para: <strong>${clientName.toUpperCase()}</strong></p><p>Pasajeros: <strong>${paxText}</strong></p><p>Nº Cotización: <strong>${quoteNumber}</strong> | Validez: <strong>${validez}</strong></p>`;
                customerBox.style.display = 'block';
            }
        } else {
            if(introTextEl) introTextEl.textContent = `¡Hola! Te compartimos las mejores opciones que encontramos para ti.`;
            if(customerBox) customerBox.style.display = 'none';
        }

        const advisor = (advisorSelect && ADVISORS[advisorSelect.value]) ? ADVISORS[advisorSelect.value] : {name: '', photoUrl: ''};
        const advisorPhoto = document.getElementById('advisor-photo');
        const advisorNameEl = document.getElementById('advisor-name');
        if(advisorPhoto) advisorPhoto.src = advisor.photoUrl;
        if(advisorNameEl) advisorNameEl.textContent = advisor.name;

        const wppInput = document.getElementById('whatsapp-asesor');
        const whatsappLink = wppInput ? `https://wa.me/${wppInput.value}` : '#';
        
        const btnIds = ['advisor-whatsapp-btn', 'cta-reservar', 'cta-contactar'];
        btnIds.forEach(id => {
            const el = document.getElementById(id);
            if(el) {
                const baseText = id === 'cta-reservar' ? `¡Hola ${advisor.name}! Estoy listo para reservar según la cotización *${quoteNumber}*.` : `Hola ${advisor.name}, tengo una pregunta sobre la cotización *${quoteNumber}*.`;
                el.href = `${whatsappLink}?text=${encodeURIComponent(baseText)}`;
            }
        });

        if(confirmationComponentsContainer) confirmationComponentsContainer.innerHTML = '';
        let dynamicTermsHTML = '';

        // 1. RENDERIZAR HOTELES
        const hotelForms = document.querySelectorAll('.hotel-form-wrapper');
        if(hotelForms.length > 0) dynamicTermsHTML += TERMS_AND_CONDITIONS.hotels;
        hotelForms.forEach((form, index) => {
            const num = form.id.match(/\d+/)[0];
            let galleryHTML =[1, 2, 3].map(i => pastedImages[`hotel-${num}-foto-${i}`] ? `<img src="${pastedImages[`hotel-${num}-foto-${i}`]}">` : '').join('');
            
            const destino = document.getElementById(`destino-${num}`) ? document.getElementById(`destino-${num}`).value : '';
            const fechaViaje = document.getElementById(`fecha-viaje-${num}`) ? document.getElementById(`fecha-viaje-${num}`).value : '';
            const nochesSel = document.getElementById(`cantidad-noches-${num}`);
            const noches = nochesSel ? nochesSel.options[nochesSel.selectedIndex].text : '';
            const habSel = document.getElementById(`cantidad-habitaciones-${num}`);
            const habitaciones = habSel ? habSel.options[habSel.selectedIndex].text : '';
            const regimen = document.getElementById(`regimen-${num}`) ? document.getElementById(`regimen-${num}`).value : '';
            const hotelName = document.getElementById(`hotel-${num}`) ? document.getElementById(`hotel-${num}`).value : '';
            const valorTotal = document.getElementById(`valor-total-${num}`) ? document.getElementById(`valor-total-${num}`).value : '';
            const moneda = document.getElementById(`moneda-${num}`) ? document.getElementById(`moneda-${num}`).value : '';

            let hotelDetailsHTML = `
                <div class="data-item">${ICONS.destination}<div class="data-item-content"><strong>Destino:</strong><p>${destino}</p></div></div>
                <div class="data-item">${ICONS.calendar}<div class="data-item-content"><strong>Fechas:</strong><p>${formatDate(fechaViaje)}</p></div></div>
                <div class="data-item">${ICONS.moon}<div class="data-item-content"><strong>Noches:</strong><p>${noches}</p></div></div>
                <div class="data-item">${ICONS.bed}<div class="data-item-content"><strong>Habitaciones:</strong><p>${habitaciones}</p></div></div>`;

            confirmationComponentsContainer.innerHTML += `
                <div class="quote-option-box">
                    <div class="option-header"><h3>Hotel ${index + 1}</h3><span class="option-price">${formatCurrency(valorTotal, moneda)}</span></div>
                    <div class="option-body">
                        <h4>${hotelName}</h4>
                        <div class="photo-gallery">${galleryHTML}</div>
                        <div class="details-grid">
                            ${hotelDetailsHTML}
                            <div class="data-item full-width">${ICONS.check}<div class="data-item-content"><strong>Plan Incluye:</strong><p>${REGIMEN_TEMPLATES[regimen] || 'No especificado'}</p></div></div>
                        </div>
                    </div>
                </div>`;
        });

        // 2. RENDERIZAR CRUCEROS
        const cruiseForms = document.querySelectorAll('.cruises-form-wrapper');
        if(cruiseForms.length > 0) dynamicTermsHTML += TERMS_AND_CONDITIONS.cruises;
        cruiseForms.forEach((form, index) => {
            const num = form.id.match(/\d+/)[0];
            
            const navieraEl = document.getElementById(`naviera-${num}`);
            const naviera = navieraEl ? navieraEl.value : '';
            const logoUrl = NAVIERA_LOGOS[naviera] || '';
            const logoHTML = logoUrl ? `<img src="${logoUrl}" class="naviera-logo-img" alt="${naviera}">` : `<span style="color:white; font-weight:bold;">${naviera}</span>`;

            let galleryHTML = [1, 2, 3].map(i => pastedImages[`crucero-${num}-foto-${i}`] ? `<img src="${pastedImages[`crucero-${num}-foto-${i}`]}">` : '').join('');
            
            const switchMapaEl = document.getElementById(`switch-mapa-${num}`);
            const showMap = switchMapaEl ? switchMapaEl.checked : false;
            const switchTablaEl = document.getElementById(`switch-tabla-${num}`);
            const showTable = switchTablaEl ? switchTablaEl.checked : false;
            
            let mapHTML = '';
            if(showMap && pastedImages[`crucero-${num}-mapa`]) {
                mapHTML = `<div class="single-photo-container"><img src="${pastedImages[`crucero-${num}-mapa`]}"></div>`;
            }

            let tableHTML = '';
            if(showTable) {
                const tableNodeOriginal = document.getElementById(`tabla-itinerario-${num}`);
                if(tableNodeOriginal) {
                    const tableNode = tableNodeOriginal.cloneNode(true);
                    tableNode.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
                    tableNode.className = 'pdf-table';
                    
                    const imgPeq = pastedImages[`crucero-${num}-img-pequena`] ? `<img src="${pastedImages[`crucero-${num}-img-pequena`]}">` : '';
                    
                    tableHTML = `
                        <div class="cruise-layout-split">
                            ${imgPeq ? `<div class="cruise-layout-left">${imgPeq}</div>` : ''}
                            <div class="cruise-layout-right">${tableNode.outerHTML}</div>
                        </div>
                    `;
                }
            }

            const cabinContainer = document.getElementById(`cabinas-container-${num}`);
            let cabinsHTML = '';
            if(cabinContainer) {
                cabinContainer.querySelectorAll('.cabin-row').forEach(row => {
                    const id = row.id.replace('cabin-row-', '');
                    const tipo = document.getElementById(`cabina-tipo-${id}`) ? document.getElementById(`cabina-tipo-${id}`).value : '';
                    const numCab = document.getElementById(`cabina-num-${id}`) ? document.getElementById(`cabina-num-${id}`).value : '';
                    const pax = document.getElementById(`cabina-pax-${id}`) ? document.getElementById(`cabina-pax-${id}`).value : '';
                    const pUsd = document.getElementById(`cabina-precio-usd-${id}`) ? document.getElementById(`cabina-precio-usd-${id}`).value : '';
                    const pCop = document.getElementById(`cabina-precio-cop-${id}`) ? document.getElementById(`cabina-precio-cop-${id}`).value : '';
                    
                    cabinsHTML += `
                        <div class="pdf-cabin-item">
                            <div class="cabin-info">
                                <strong>${tipo}</strong> | Cabina: ${numCab} | Para: ${pax}
                            </div>
                            <div class="cabin-price">
                                USD ${pUsd} ${pCop ? `<br><span style="font-size:11px; color:#666; font-weight:normal;">~ COP ${pCop}</span>` : ''}
                            </div>
                        </div>
                    `;
                });
            }

            const tituloCrucero = document.getElementById(`titulo-crucero-${num}`) ? document.getElementById(`titulo-crucero-${num}`).value : '';
            const barco = document.getElementById(`barco-${num}`) ? document.getElementById(`barco-${num}`).value : '';
            const puerto = document.getElementById(`puerto-${num}`) ? document.getElementById(`puerto-${num}`).value : '';
            const fechaZarpe = document.getElementById(`fecha-zarpe-${num}`) ? document.getElementById(`fecha-zarpe-${num}`).value : '';
            const nochesCrucero = document.getElementById(`noches-crucero-${num}`) ? document.getElementById(`noches-crucero-${num}`).value : '';
            const inclusiones = document.getElementById(`inclusiones-${num}`) ? document.getElementById(`inclusiones-${num}`).value : '';

            confirmationComponentsContainer.innerHTML += `
                <div class="quote-option-box">
                    <div class="cruise-custom-title">${tituloCrucero}</div>
                    <div class="option-header" style="background-color: var(--c-brand-dark-accent);">
                        <h3>CRUCERO ${index + 1}</h3>
                        ${logoHTML}
                    </div>
                    <div class="option-body">
                        <h4 style="text-align: center; font-size: 24px; margin-bottom: 20px;">🚢 ${barco}</h4>
                        
                        ${mapHTML}
                        ${tableHTML}
                        
                        <div class="photo-gallery">${galleryHTML}</div>
                        
                        <div class="cruise-specs-grid">
                            <div class="cruise-spec-item">${ICONS.destination} <div><strong>Puerto de Embarque:</strong><span>${puerto}</span></div></div>
                            <div class="cruise-spec-item">${ICONS.calendar} <div><strong>Fecha de Embarque:</strong><span>${formatDate(fechaZarpe)}</span></div></div>
                            <div class="cruise-spec-item">${ICONS.moon} <div><strong>Noches:</strong><span>${nochesCrucero}</span></div></div>
                        </div>

                        <div class="cruise-inclusions">
                            <strong style="color: var(--c-brand-primary); display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">${ICONS.check} QUÉ INCLUYE TU CRUCERO:</strong>
                            <p style="margin: 0; font-size: 14px; color: var(--c-dark-blue); font-weight: 600;">${inclusiones}</p>
                        </div>

                        ${cabinsHTML ? `<div class="pdf-cabins-list">${cabinsHTML}</div>` : ''}
                    </div>
                </div>`;
        });

        // 3. RENDERIZAR VUELOS
        if (document.getElementById('flights-form-wrapper')) {
            dynamicTermsHTML += TERMS_AND_CONDITIONS.flights;
            const departureCity = document.getElementById('ciudad-salida') ? document.getElementById('ciudad-salida').value : '';
            
            const extras =['flight-1', 'flight-2'];
            let optionsHTML = '';
            extras.forEach(id => {
                const wrapper = document.getElementById(`${id}-form-wrapper`);
                if ((id === 'flight-1' || (wrapper && wrapper.style.display !== 'none')) && document.getElementById(`${id}-airline`)) {
                    const airline = document.getElementById(`${id}-airline`).value; 
                    const price = document.getElementById(`${id}-price`).value;
                    if (airline && price) {
                        optionsHTML += `<div class="item-option"><strong>Opción ${id.split('-')[1]}:</strong> ${airline} <span class="item-price">Desde ${formatCurrency(price)}</span></div>`;
                    }
                }
            });
            
            confirmationComponentsContainer.innerHTML += `
                <div class="component-section">
                    <div class="option-header"><h3>Vuelos Sugeridos</h3></div>
                    <div class="option-body">
                        ${pastedImages['flight-banner-preview'] ? `<div class="flight-banner"><img src="${pastedImages['flight-banner-preview']}"></div>` : ''}
                        <div id="flight-options-confirm-container">
                            <div class="data-item" style="margin-bottom: 15px;">${ICONS.plane}<div class="data-item-content"><strong>Desde:</strong><p>${departureCity}</p></div></div>
                            ${optionsHTML}
                        </div>
                        <p style="font-size: 11px; color: var(--c-gray); margin-top: 10px;">*Valores por persona, sujetos a cambio.</p>
                    </div>
                </div>`;
        }

        // 4. RENDERIZAR TOURS Y TRASLADOS
        const extrasTours = ['tours', 'transfers'];
        extrasTours.forEach(type => {
            if (document.getElementById(`${type}-form-wrapper`)) {
                if (type === 'transfers') dynamicTermsHTML += TERMS_AND_CONDITIONS.transfers;
                
                const imgHTML = pastedImages[`${type.slice(0, -1)}-main-photo`] ? `<div class="single-photo-container"><img src="${pastedImages[`${type.slice(0, -1)}-main-photo`]}"></div>` : '';
                const nameKey = type === 'tours' ? 'name' : 'desc';
                const descEl = document.getElementById(`${type.slice(0, -1)}-1-${nameKey}`);
                const priceEl = document.getElementById(`${type.slice(0, -1)}-1-price`);
                const desc = descEl ? descEl.value : ''; 
                const price = priceEl ? priceEl.value : '';
                
                confirmationComponentsContainer.innerHTML += `
                    <div class="component-section">
                        <div class="option-header"><h3>${type === 'tours' ? 'Tours Opcionales' : 'Traslados'}</h3></div>
                        <div class="option-body">
                            ${imgHTML}
                            <div class="item-option">
                                <strong>${desc}</strong>
                                <span class="item-price">Desde ${formatCurrency(price)}</span>
                            </div>
                        </div>
                    </div>`;
            }
        });

        // INYECCIÓN DE LA BARRA DE PAGOS
        const pagoReservaEl = document.getElementById('confirm-pago-reserva');
        const fechaLimiteEl = document.getElementById('confirm-fecha-limite');
        const valorTotalEl = document.getElementById('confirm-valor-total-reserva');
        const infoPagoEl = document.getElementById('confirm-info-pago');
        const noIncluyeEl = document.getElementById('confirm-no-incluye');
        const termsContentEl = document.getElementById('confirm-terms-content');
        const termsSectionEl = document.getElementById('terms-section-confirm');

        if(pagoReservaEl) pagoReservaEl.textContent = formatCurrency(document.getElementById('pago-reserva') ? document.getElementById('pago-reserva').value : '', 'USD');
        if(fechaLimiteEl) fechaLimiteEl.textContent = formatDate(document.getElementById('fecha-limite-pago') ? document.getElementById('fecha-limite-pago').value : '');
        if(valorTotalEl) valorTotalEl.textContent = document.getElementById('valor-total-reserva') ? document.getElementById('valor-total-reserva').value : '';
        if(infoPagoEl) infoPagoEl.textContent = document.getElementById('info-pago-personalizada') ? document.getElementById('info-pago-personalizada').value : '';
        if(noIncluyeEl) noIncluyeEl.textContent = document.getElementById('no-incluye') ? document.getElementById('no-incluye').value : '';

        if(termsContentEl) termsContentEl.innerHTML = dynamicTermsHTML + GENERAL_TERMS;
        if(termsSectionEl) termsSectionEl.style.display = 'block';
    }

    const editBtn = document.getElementById('edit-quote-btn');
    if(editBtn) editBtn.addEventListener('click', () => showView('form'));
    
    const newBtn = document.getElementById('new-quote-btn');
    if(newBtn) newBtn.addEventListener('click', () => loadDashboard());
    
    const processBtn = document.getElementById('process-quote-btn');
    if(processBtn) {
        processBtn.addEventListener('click', async () => {
            const loader = document.getElementById('loader-overlay');
            const loaderText = document.getElementById('loader-text');
            if(loader) loader.style.display = 'flex';
            if(loaderText) loaderText.textContent = "Generando PDF...";
            try {
                const elementToPrint = document.getElementById('voucher-to-print');
                if(!elementToPrint) throw new Error("No se encontró el contenedor del PDF");
                
                const canvas = await html2canvas(elementToPrint, { scale: 2, useCORS: true });
                const pdf = new window.jspdf.jsPDF({ orientation: 'p', unit: 'px', format:[canvas.width, canvas.height] });
                pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, canvas.width, canvas.height);
                
                const scaleFactor = canvas.width / elementToPrint.offsetWidth;
                const pdfBtns =['advisor-whatsapp-btn', 'cta-reservar', 'cta-contactar'];
                pdfBtns.forEach(id => {
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

                const quoteNum = document.getElementById('cotizacion-numero') ? document.getElementById('cotizacion-numero').value : 'Cotizacion';
                pdf.save(`${quoteNum}.pdf`);
            } catch (error) { 
                console.error(error);
                alert("Error generando PDF"); 
            } finally { 
                if(loader) loader.style.display = 'none'; 
            }
        });
    }

});
