/* ==========================================
   COTIZADOR PRO - CYAN TRAVEL (FIREBASE + CRUCEROS)
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
    let currentTRM = 4000; // Valor por defecto si falla la API
    let currentQuoteId = null; // Para saber si estamos editando o creando
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

    // --- OBTENER TRM ---
    async function fetchTRM() {
        try {
            const response = await fetch('https://open.er-api.com/v6/latest/USD');
            const data = await response.json();
            currentTRM = Math.round(data.rates.COP);
        } catch (error) {
            console.warn("No se pudo obtener la TRM, usando valor por defecto.");
        }
    }

    // --- COMPRESIÓN DE IMÁGENES (Evita que Firebase colapse) ---
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
            quotesList.innerHTML = '<p style="color:red;">Error al cargar datos.</p>';
            console.error(error);
        }
    }

    function renderQuotes(docs) {
        quotesList.innerHTML = '';
        if (docs.length === 0) { quotesList.innerHTML = '<p>No hay cotizaciones aún.</p>'; return; }
        
        docs.forEach(doc => {
            const data = doc.data();
            const date = data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString('es-ES') : 'Fecha desconocida';
            
            const card = document.createElement('div');
            card.className = 'quote-card';
            card.innerHTML = `
                <span class="quote-badge">${data.quoteNumber}</span>
                <h3>${data.clientName}</h3>
                <p>Asesor: ${data.advisorName}</p>
                <span class="quote-date">Creada: ${date}</span>
                <button class="btn-duplicate" data-id="${doc.id}">Duplicar Cotización</button>
            `;
            
            // Click en la tarjeta para editar
            card.addEventListener('click', (e) => {
                if(e.target.classList.contains('btn-duplicate')) return; // Evita conflicto con el botón duplicar
                loadQuoteIntoForm(doc.id, data);
            });

            // Click en duplicar
            card.querySelector('.btn-duplicate').addEventListener('click', () => {
                const duplicatedData = { ...data, quoteNumber: generateQuoteNumber() };
                loadQuoteIntoForm(null, duplicatedData); // null ID significa que es nueva
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

        // Llenar selects dinámicos
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
                const compressedImage = await compressImage(base64Image); // Comprimir antes de guardar
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
        
        // Recopilar datos para Firebase
        const quoteData = {
            quoteNumber: document.getElementById('cotizacion-numero').value,
            clientName: document.getElementById('nombre-completo').value,
            advisorId: advisorSelect.value,
            advisorName: ADVISORS[advisorSelect.value].name,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            formData: serializeForm(form),
            images: pastedImages
        };

        try {
            document.getElementById('loader-overlay').style.display = 'flex';
            document.getElementById('loader-text').textContent = "Guardando en la nube...";
            
            if (currentQuoteId) {
                await db.collection('cotizaciones').doc(currentQuoteId).update(quoteData);
            } else {
                const docRef = await db.collection('cotizaciones').add(quoteData);
                currentQuoteId = docRef.id;
            }
            
            populateQuote(); 
            showView('pdf');
        } catch (error) {
            console.error("Error guardando:", error);
            alert("Hubo un error guardando la cotización. Revisa tu conexión.");
        } finally {
            document.getElementById('loader-overlay').style.display = 'none';
        }
    });

    // Utilidad para serializar el formulario y guardarlo
    function serializeForm(formNode) {
        const obj = {};
        const elements = formNode.querySelectorAll('input, select, textarea');
        elements.forEach(el => { if(el.id) obj[el.id] = el.value; });
        return obj;
    }

    // Cargar datos desde Firebase al formulario
    function loadQuoteIntoForm(id, data) {
        currentQuoteId = id;
        initializeForm();
        
        // Restaurar imágenes
        pastedImages = data.images || {};
        
        // Reconstruir secciones dinámicas basándose en los IDs guardados
        const keys = Object.keys(data.formData);
        
        // Detectar cuántos hoteles y cruceros hay
        const hotelIds = new Set(keys.filter(k => k.startsWith('hotel-')).map(k => k.split('-')[1]));
        const cruiseIds = new Set(keys.filter(k => k.startsWith('barco-')).map(k => k.split('-')[1]));
        
        hotelIds.forEach(() => addSection('hotel'));
        cruiseIds.forEach(() => addSection('cruises'));
        if(keys.includes('ciudad-salida')) addSection('flights');
        if(keys.includes('tour-1-name')) addSection('tours');
        if(keys.includes('transfer-1-desc')) addSection('transfers');

        // Llenar valores
        setTimeout(() => {
            keys.forEach(key => {
                const el = document.getElementById(key);
                if(el) el.value = data.formData[key];
            });
            
            // Restaurar previsualizaciones de imágenes
            Object.keys(pastedImages).forEach(imgId => {
                const pasteArea = document.querySelector(`[data-img-id="${imgId}"]`);
                if(pasteArea) {
                    pasteArea.querySelector('img').src = pastedImages[imgId];
                    pasteArea.querySelector('img').style.display = 'block';
                    pasteArea.querySelector('p').style.display = 'none';
                }
            });
            
            showView('form');
        }, 100); // Pequeño delay para asegurar que el DOM se pintó
    }

    // --- RENDERIZADO DEL PDF ---
    function formatCurrency(value, currency = 'COP') {
        const number = parseFloat(String(value).replace(/[^0-9.-]+/g, ""));
        if (isNaN(number)) return '';
        return number.toLocaleString(currency === 'COP' ? 'es-CO' : 'en-US', { style: 'currency', currency, minimumFractionDigits: 0 });
    }

    function populateQuote() {
        // (Lógica de renderizado visual del PDF)
        const clientName = document.getElementById('nombre-completo').value;
        document.getElementById('confirm-intro-text').textContent = `¡Hola, ${clientName.split(' ')[0].toUpperCase()}! He preparado estas opciones para tu próximo viaje.`;
        
        const customerBox = document.getElementById('confirm-customer-data-box');
        customerBox.innerHTML = `<p>Para: <strong>${clientName.toUpperCase()}</strong></p><p>Nº Cotización: <strong>${document.getElementById('cotizacion-numero').value}</strong></p>`;

        const advisor = ADVISORS[advisorSelect.value];
        document.getElementById('advisor-photo').src = advisor.photoUrl;
        document.getElementById('advisor-name').textContent = advisor.name;

        confirmationComponentsContainer.innerHTML = '';

        // Renderizar Hoteles
        document.querySelectorAll('.hotel-form-wrapper').forEach((form, index) => {
            const num = form.id.match(/\d+/)[0];
            let galleryHTML = [1, 2, 3].map(i => pastedImages[`hotel-${num}-foto-${i}`] ? `<img src="${pastedImages[`hotel-${num}-foto-${i}`]}">` : '').join('');
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

        // Renderizar Cruceros
        document.querySelectorAll('.cruises-form-wrapper').forEach((form, index) => {
            const num = form.id.match(/\d+/)[0];
            let galleryHTML =[1, 2, 3].map(i => pastedImages[`crucero-${num}-foto-${i}`] ? `<img src="${pastedImages[`crucero-${num}-foto-${i}`]}">` : '').join('');
            let mapHTML = pastedImages[`crucero-${num}-mapa`] ? `<div class="single-photo-container"><img src="${pastedImages[`crucero-${num}-mapa`]}"></div>` : '';
            
            confirmationComponentsContainer.innerHTML += `
                <div class="quote-option-box">
                    <div class="option-header" style="background-color: #005f73;"><h3>Crucero ${index + 1} - ${document.getElementById(`naviera-${num}`).value}</h3><span class="option-price">${formatCurrency(document.getElementById(`valor-crucero-${num}`).value, document.getElementById(`moneda-crucero-${num}`).value)}</span></div>
                    <div class="option-body">
                        <h4>Barco: ${document.getElementById(`barco-${num}`).value}</h4>
                        ${mapHTML}
                        <div class="photo-gallery">${galleryHTML}</div>
                        <div class="details-grid">
                            <div class="data-item">${ICONS.ship}<div class="data-item-content"><strong>Embarque:</strong><p>${document.getElementById(`puerto-${num}`).value}</p></div></div>
                            <div class="data-item">${ICONS.calendar}<div class="data-item-content"><strong>Zarpe:</strong><p>${document.getElementById(`fecha-zarpe-${num}`).value}</p></div></div>
                            <div class="data-item">${ICONS.moon}<div class="data-item-content"><strong>Noches:</strong><p>${document.getElementById(`noches-crucero-${num}`).value}</p></div></div>
                            <div class="data-item">${ICONS.bed}<div class="data-item-content"><strong>Cabina:</strong><p>${document.getElementById(`cabina-${num}`).value}</p></div></div>
                            <div class="data-item full-width">${ICONS.check}<div class="data-item-content"><strong>Inclusiones:</strong><p>${document.getElementById(`inclusiones-${num}`).value} | Propinas: ${document.getElementById(`propinas-${num}`).value}</p></div></div>
                        </div>
                        <div class="data-item full-width" style="margin-top:15px;"><div class="data-item-content"><strong>Itinerario:</strong><p style="white-space: pre-wrap;">${document.getElementById(`itinerario-${num}`).value}</p></div></div>
                    </div>
                </div>`;
        });

        // Renderizar Vuelos, Tours, Traslados (Lógica simplificada para mantener el código limpio)
        if (document.getElementById('flights-form-wrapper')) {
            confirmationComponentsContainer.innerHTML += `<div class="component-section"><h3>Vuelos Sugeridos</h3><div class="option-body"><p>Desde: ${document.getElementById('ciudad-salida').value}</p></div></div>`;
        }

        document.getElementById('confirm-pago-reserva').textContent = formatCurrency(document.getElementById('pago-reserva').value);
        document.getElementById('confirm-pago-segundo').textContent = formatCurrency(document.getElementById('pago-segundo').value);
    }

    // Botones de navegación finales
    document.getElementById('edit-quote-btn').addEventListener('click', () => showView('form'));
    document.getElementById('new-quote-btn').addEventListener('click', () => loadDashboard());
    
    document.getElementById('process-quote-btn').addEventListener('click', async () => {
        document.getElementById('loader-overlay').style.display = 'flex';
        document.getElementById('loader-text').textContent = "Generando PDF...";
        try {
            const elementToPrint = document.getElementById('voucher-to-print');
            const canvas = await html2canvas(elementToPrint, { scale: 2, useCORS: true });
            const pdf = new window.jspdf.jsPDF({ orientation: 'p', unit: 'px', format: [canvas.width, canvas.height] });
            pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, canvas.width, canvas.height);
            pdf.save(`${document.getElementById('cotizacion-numero').value}.pdf`);
        } catch (error) { alert("Error generando PDF"); } 
        finally { document.getElementById('loader-overlay').style.display = 'none'; }
    });

});
