// State Management
let currentCategory = '';
let selectedLawyer = null;
let savedCases = JSON.parse(localStorage.getItem('legalCases')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Initialize Auth State
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    if (currentUser) {
        showScreen('home');
    }
    lucide.createIcons();
});

function updateAuthUI() {
    const authNav = document.getElementById('auth-nav');
    const userNav = document.getElementById('user-nav');
    const mainNav = document.getElementById('main-nav');
    const userDisplayName = document.getElementById('user-display-name');

    if (currentUser) {
        authNav.style.display = 'none';
        userNav.style.display = 'flex';
        mainNav.style.display = 'flex';
        userDisplayName.innerText = `Hola, ${currentUser.name.split(' ')[0]}`;
    } else {
        authNav.style.display = 'block';
        userNav.style.display = 'none';
        mainNav.style.display = 'none';
    }
}

// Authentication Logic
function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));

    if (tab === 'login') {
        document.querySelector('.auth-tab:nth-child(1)').classList.add('active');
        document.getElementById('login-form').classList.add('active');
    } else {
        document.querySelector('.auth-tab:nth-child(2)').classList.add('active');
        document.getElementById('register-form').classList.add('active');
    }
}

function handleRegister() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    if (!name || !email || !password) {
        showToast('Por favor, complete todos los campos.');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.email === email)) {
        showToast('El correo ya está registrado.');
        return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showToast('Cuenta creada con éxito. Ya puede iniciar sesión.');
    switchAuthTab('login');
}

function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showToast('Por favor, complete todos los campos.');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showToast(`¡Bienvenido de nuevo, ${user.name}!`);
        updateAuthUI();
        showScreen('home');
    } else {
        showToast('Credenciales inválidas.');
    }
}

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVSaFoE4RSl4UB8_3yOCVtCBqZ1BHb7BA",
  authDomain: "karin-ley.firebaseapp.com",
  projectId: "karin-ley",
  storageBucket: "karin-ley.firebasestorage.app",
  messagingSenderId: "994713536898",
  appId: "1:994713536898:web:216bf65c1175c2d5d4279b",
  measurementId: "G-H5NWVWP7BY"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

function handleGoogleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            currentUser = {
                name: user.displayName,
                email: user.email,
                id: user.uid
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showToast(`¡Bienvenido, ${user.displayName}!`);
            updateAuthUI();
            showScreen('home');
        }).catch((error) => {
            console.error(error);
            showToast('Error al iniciar sesión con Google.');
        });
}

function handleFacebookLogin() {
    const provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            currentUser = {
                name: user.displayName,
                email: user.email,
                id: user.uid
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            showToast(`¡Bienvenido, ${user.displayName}!`);
            updateAuthUI();
            showScreen('home');
        }).catch((error) => {
            console.error(error);
            showToast('Error al iniciar sesión con Facebook.');
        });
}

function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showToast('Sesión cerrada.');
    updateAuthUI();
    showScreen('home');
}

// Chile Regions and Comunas Data (Full List)
const locationData = {
    "Región de Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
    "Región de Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"],
    "Región de Antofagasta": ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"],
    "Región de Atacama": ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"],
    "Región de Coquimbo": ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paihuano", "Vicuña", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado", "Illapel", "Canela", "Los Vilos", "Salamanca"],
    "Región de Valparaíso": ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "Hijuelas", "La Calera", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María", "Quilpué", "Limache", "Olmué", "Villa Alemana"],
    "Región Metropolitana de Santiago": ["Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Granja", "La Florida", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "Colina", "Lampa", "Tiltil", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"],
    "Región del Libertador Gral. B. O'Higgins": ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente de Tagua Tagua", "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"],
    "Región del Maule": ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"],
    "Región de Ñuble": ["Chillán", "Chillán Viejo", "Bulnes", "El Carmen", "Pemuco", "Pinto", "Quillón", "San Ignacio", "Yungay", "Quirihue", "Cobquecura", "Coelemu", "Ninhue", "Portezuelo", "Ránquil", "Trehuaco", "San Carlos", "Coihueco", "Ñiquén", "San Fabián", "San Nicolás"],
    "Región del Biobío": ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualpén", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel"],
    "Región de la Araucanía": ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"],
    "Región de Los Ríos": ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"],
    "Región de Los Lagos": ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"],
    "Región de Aysén del Gral. C. Ibáñez del Campo": ["Coyhaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"],
    "Región de Magallanes y de la Antártica Chilena": ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"]
};

const lawyerData = {
    "Santiago": [
        { name: "Dr. Roberto Jara", specialty: "Ley Karin / Acoso Laboral", rating: "4.9" },
        { name: "Dra. Marcela Soto", specialty: "Código del Trabajo / Despidos", rating: "4.8" }
    ],
    "Las Condes": [
        { name: "Lic. Ignacio Valdés", specialty: "Derecho Laboral Corporativo", rating: "5.0" }
    ],
    "Viña del Mar": [
        { name: "Andrés Vicuña", specialty: "Enfermedades Profesionales", rating: "4.7" },
        { name: "Carla Pizarro", specialty: "Derecho Civil / Laboral", rating: "4.9" }
    ],
    "Concepción": [
        { name: "Pedro Montt", specialty: "Estatuto Administrativo", rating: "4.8" }
    ],
    "Iquique": [
        { name: "Dra. Francisca Molina Arroyo", specialty: "Ley Karin Acoso / Civil", rating: "5.0" }
    ]
};

// Navigation Logic
function showScreen(screenId) {
    // Auth Guard
    if (!currentUser && screenId !== 'auth') {
        screenId = 'auth';
        showToast('Debe iniciar sesión para acceder.');
    }

    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });

    const target = document.getElementById(`${screenId}-screen`);
    if (target) {
        target.classList.add('active');
        window.scrollTo(0, 0);
        
        if (screenId === 'lawyers') {
            initLawyersScreen();
        }
    }
}

function selectCategory(category) {
    currentCategory = category;
    document.getElementById('selected-category-title').innerText = category;
    showScreen('input');
}

// Tab Switching
function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    if (tabId === 'text') document.querySelector('.tab-btn:nth-child(1)').classList.add('active');
    if (tabId === 'file') document.querySelector('.tab-btn:nth-child(2)').classList.add('active');
    if (tabId === 'audio') document.querySelector('.tab-btn:nth-child(3)').classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabId}-input`).classList.add('active');
}

// Analysis Processing (AI Integration)
async function processAnalysis() {
    const caseText = document.getElementById('case-text').value;
    
    if (!caseText.trim()) {
        showToast('Por favor, describa los detalles de su caso antes de continuar.');
        return;
    }

    showToast('Analizando caso usando Inteligencia Artificial...');
    
    const resultsContainer = document.getElementById('ai-results-container');
    resultsContainer.innerHTML = `
        <div class="glass-card" style="grid-column: 1 / -1; text-align: center;">
            <div class="spinner"></div>
            <p>La IA está evaluando las normativas y antecedentes... esto puede tomar unos segundos.</p>
        </div>
    `;
    
    showScreen('results');

    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: caseText,
                category: document.getElementById('selected-category-title').innerText
            })
        });

        if (!response.ok) {
            throw new Error('Error en la comunicación con la API');
        }

        const data = await response.json();
        
        if (data.result) {
            resultsContainer.innerHTML = `
                <div class="glass-card" style="grid-column: 1 / -1; text-align: left;">
                    ${data.result}
                </div>
            `;
            saveCase();
            showToast('Análisis completado exitosamente.');
        } else {
            throw new Error('Respuesta vacía');
        }

    } catch (error) {
        console.error(error);
        resultsContainer.innerHTML = `
            <div class="glass-card" style="grid-column: 1 / -1; text-align: center; border-color: #ef4444;">
                <i data-lucide="alert-triangle" style="color: #ef4444; width: 48px; height: 48px; margin-bottom: 1rem;"></i>
                <h3 style="color: #ef4444;">No se pudo completar el análisis</h3>
                <p>Ocurrió un error al contactar al motor de Inteligencia Artificial. Por favor, asegúrese de que la clave de API esté configurada correctamente en Vercel.</p>
                <button class="btn-secondary" onclick="showScreen('input')" style="margin-top: 1rem;">Volver e intentar de nuevo</button>
            </div>
        `;
        // Re-initialize Lucide icons for the error message
        lucide.createIcons();
    }
}

// Case Storage
function saveCase() {
    const newCase = {
        id: Date.now(),
        category: currentCategory,
        date: new Date().toLocaleDateString(),
        status: 'Analizado'
    };
    savedCases.push(newCase);
    localStorage.setItem('legalCases', JSON.stringify(savedCases));
}

// Lawyers Screen Logic
function initLawyersScreen() {
    const regionSelect = document.getElementById('region-select');
    regionSelect.innerHTML = '<option value="">Seleccione Región</option>';
    
    Object.keys(locationData).sort().forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        regionSelect.appendChild(option);
    });
}

function updateComunas() {
    const region = document.getElementById('region-select').value;
    const comunaSelect = document.getElementById('comuna-select');
    comunaSelect.innerHTML = '<option value="">Seleccione Comuna</option>';
    
    if (region && locationData[region]) {
        locationData[region].sort().forEach(comuna => {
            const option = document.createElement('option');
            option.value = comuna;
            option.textContent = comuna;
            comunaSelect.appendChild(option);
        });
    }
    searchLawyers();
}

function searchLawyers() {
    const comuna = document.getElementById('comuna-select').value;
    const lawyersList = document.getElementById('lawyers-list');
    
    if (!comuna) {
        lawyersList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="search"></i>
                <p>Seleccione una comuna para ver abogados disponibles.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    const lawyers = lawyerData[comuna] || [];
    
    if (lawyers.length === 0) {
        lawyersList.innerHTML = `
            <div class="empty-state">
                <i data-lucide="user-x"></i>
                <p>No se encontraron abogados especialistas en ${comuna} actualmente.</p>
            </div>
        `;
    } else {
        lawyersList.innerHTML = lawyers.map((lawyer, index) => `
            <div class="lawyer-card">
                <div class="lawyer-info">
                    <h4>${lawyer.name}</h4>
                    <p>${lawyer.specialty}</p>
                    <p>⭐ ${lawyer.rating}</p>
                </div>
                <div class="lawyer-contact">
                    <button class="contact-btn" onclick="contactLawyer('${comuna}', ${index})">Contactar</button>
                </div>
            </div>
        `).join('');
    }
    lucide.createIcons();
}

// New Contact Logic
function contactLawyer(comuna, index) {
    selectedLawyer = lawyerData[comuna][index];
    document.getElementById('selected-lawyer-name').innerText = selectedLawyer.name;
    document.getElementById('auth-check-box').checked = false;
    document.getElementById('user-phone').value = '';
    showScreen('contact');
}

function sendContactRequest() {
    const isAuthorized = document.getElementById('auth-check-box').checked;
    const phone = document.getElementById('user-phone').value;

    if (!isAuthorized) {
        showToast('Debe autorizar el envío de información para continuar.');
        return;
    }

    if (!phone) {
        showToast('Por favor, ingrese un teléfono de contacto.');
        return;
    }

    showToast('Enviando información y documentos al abogado...');
    
    // Save the message for the lawyer's portal
    const lawyerMessages = JSON.parse(localStorage.getItem('lawyerMessages')) || [];
    lawyerMessages.push({
        id: Date.now(),
        targetLawyer: selectedLawyer.name,
        clientName: currentUser ? currentUser.name : 'Cliente Anónimo',
        clientPhone: phone,
        category: currentCategory || 'Consulta General',
        date: new Date().toLocaleDateString()
    });
    localStorage.setItem('lawyerMessages', JSON.stringify(lawyerMessages));
    
    setTimeout(() => {
        showToast(`¡Solicitud enviada con éxito! ${selectedLawyer.name} se pondrá en contacto pronto.`);
        setTimeout(() => showScreen('home'), 2000);
    }, 2000);
}

// Document Generation (Simulation)
function generateDoc(organism) {
    showToast(`Generando presentación jurídica para ${organism}...`);
    setTimeout(() => {
        showToast('¡Documento generado con éxito! Iniciando descarga...');
    }, 1500);
}

function downloadFormat(format) {
    showToast(`Preparando documento en formato ${format}...`);
    setTimeout(() => {
        showToast(`¡Descarga de ${format} iniciada con éxito!`);
    }, 1500);
}

// Toast System
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Audio Recording (UI Simulation)
const recordBtn = document.querySelector('.record-btn');
let isRecording = false;

if (recordBtn) {
    recordBtn.addEventListener('click', () => {
        isRecording = !isRecording;
        const icon = recordBtn.querySelector('i');
        if (isRecording) {
            recordBtn.style.background = '#ef4444';
            recordBtn.style.color = 'white';
            icon.setAttribute('data-lucide', 'square');
            showToast('Grabando audio...');
        } else {
            recordBtn.style.background = 'rgba(239, 68, 68, 0.2)';
            recordBtn.style.color = '#ef4444';
            icon.setAttribute('data-lucide', 'mic');
            showToast('Grabación finalizada');
        }
        lucide.createIcons();
    });
}

// Lawyer Registration Logic
function updateLawyerComunas() {
    const region = document.getElementById('lawyer-region').value;
    const comunaSelect = document.getElementById('lawyer-comuna');
    comunaSelect.innerHTML = '<option value="">Seleccione Comuna</option>';
    
    if (region && locationData[region]) {
        locationData[region].sort().forEach(comuna => {
            const option = document.createElement('option');
            option.value = comuna;
            option.textContent = comuna;
            comunaSelect.appendChild(option);
        });
    }
}

function nextLawyerStep(step) {
    if (step === 2) {
        // Validation for Step 1
        const fields = ['lawyer-name', 'lawyer-rut', 'lawyer-email', 'lawyer-phone', 'lawyer-password', 'lawyer-region', 'lawyer-comuna'];
        for (let field of fields) {
            if (!document.getElementById(field).value) {
                showToast('Por favor, complete todos los campos obligatorios.');
                return;
            }
        }
        
        // Specialty check
        const selectedSpecialties = Array.from(document.querySelectorAll('input[name="specialty"]:checked'));
        if (selectedSpecialties.length === 0) {
            showToast('Por favor, seleccione al menos una especialidad.');
            return;
        }
        
        // Update checkout name
        document.getElementById('card-name-display').innerText = document.getElementById('lawyer-name').value.toUpperCase();
    }

    // Update visibility
    document.querySelectorAll('.reg-step').forEach(el => el.classList.remove('active'));
    document.getElementById(`lawyer-step-${step}`).classList.add('active');

    // Update indicators
    document.querySelectorAll('.progress-step').forEach((el, index) => {
        if (index + 1 <= step) el.classList.add('active');
        else el.classList.remove('active');
    });
}

function processLawyerPayment() {
    showToast('Procesando pago seguro...');
    
    setTimeout(() => {
        const lawyerName = document.getElementById('lawyer-name').value;
        const lawyerComuna = document.getElementById('lawyer-comuna').value;
        
        const selectedSpecialties = Array.from(document.querySelectorAll('input[name="specialty"]:checked'))
            .map(cb => cb.value);
            
        let lawyerSpecialty = "";
        if (selectedSpecialties.includes('Todas')) {
            lawyerSpecialty = "Todas las especialidades";
        } else {
            lawyerSpecialty = selectedSpecialties.join(' / ');
        }
        
        const lawyerEmail = document.getElementById('lawyer-email').value;
        const lawyerPassword = document.getElementById('lawyer-password').value;

        // Simulate adding to database
        if (!lawyerData[lawyerComuna]) lawyerData[lawyerComuna] = [];
        lawyerData[lawyerComuna].push({
            name: lawyerName,
            specialty: lawyerSpecialty,
            rating: "5.0 (Nuevo)"
        });
        
        // Save lawyer credentials for portal login
        const registeredLawyers = JSON.parse(localStorage.getItem('registeredLawyers')) || [];
        registeredLawyers.push({ email: lawyerEmail, password: lawyerPassword, name: lawyerName });
        localStorage.setItem('registeredLawyers', JSON.stringify(registeredLawyers));
        
        document.getElementById('registered-lawyer-name').innerText = lawyerName;
        nextLawyerStep(3);
        showToast('¡Pago exitoso y perfil activado!');
    }, 2500);
}

// Update showScreen to initialize lawyer portal
const originalShowScreen = showScreen;
showScreen = function(screenId) {
    originalShowScreen(screenId);
    
    if (screenId === 'lawyer-registration') {
        const regionSelect = document.getElementById('lawyer-region');
        if (regionSelect.options.length <= 1) {
            Object.keys(locationData).sort().forEach(region => {
                const option = document.createElement('option');
                option.value = region;
                option.textContent = region;
                regionSelect.appendChild(option);
            });
        }
        // Reset to step 1
        document.querySelectorAll('input[name="specialty"]').forEach(cb => cb.checked = false);
        nextLawyerStep(1);
    }
};

// Lawyer Portal Functions
function handleLawyerLogin() {
    const email = document.getElementById('lawyer-login-email').value;
    const password = document.getElementById('lawyer-login-password').value;

    if (!email || !password) {
        showToast('Por favor, ingrese su correo y contraseña.');
        return;
    }

    const registeredLawyers = JSON.parse(localStorage.getItem('registeredLawyers')) || [];
    const lawyer = registeredLawyers.find(l => l.email === email && l.password === password);

    if (lawyer) {
        showToast(`¡Bienvenido al portal, ${lawyer.name}!`);
        renderLawyerMessages(lawyer.name);
        showScreen('lawyer-dashboard');
    } else {
        showToast('Credenciales incorrectas o abogado no registrado.');
    }
}

function renderLawyerMessages(lawyerName) {
    const caseList = document.querySelector('.case-list');
    const lawyerMessages = JSON.parse(localStorage.getItem('lawyerMessages')) || [];
    
    const myMessages = lawyerMessages.filter(msg => msg.targetLawyer === lawyerName);
    
    if (myMessages.length === 0) {
        caseList.innerHTML = `<p class="text-muted" style="text-align: center; margin-top: 2rem;">No tiene solicitudes de contacto en su bandeja.</p>`;
        return;
    }
    
    caseList.innerHTML = myMessages.map(msg => `
        <div class="case-item glass" style="padding: 1rem; border-radius: 10px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <strong>Caso #${msg.id.toString().slice(-4)} - ${msg.category}</strong>
                <p style="font-size: 0.9rem; color: var(--text-muted);">De: ${msg.clientName} | Tel: ${msg.clientPhone}</p>
                <p style="font-size: 0.8rem; color: var(--text-muted);">Fecha: ${msg.date}</p>
            </div>
            <button class="btn-secondary btn-sm" onclick="resendLawyerEmail()">Solicitar Reenvío</button>
        </div>
    `).join('');
}

function handleLawyerLogout() {
    showToast('Sesión cerrada correctamente.');
    showScreen('home');
}

function resendLawyerEmail() {
    showToast('Reenviando solicitud de contacto a su correo...');
    setTimeout(() => {
        showToast('Correo reenviado con éxito.');
    }, 1500);
}

function cancelLawyerSubscription() {
    if(confirm('¿Está seguro que desea dar de baja su suscripción? Dejará de recibir casos de clientes.')) {
        showToast('Procesando cancelación...');
        setTimeout(() => {
            showToast('Suscripción cancelada. Ya no aparecerá en las búsquedas.');
            showScreen('home');
        }, 2000);
    }
}
