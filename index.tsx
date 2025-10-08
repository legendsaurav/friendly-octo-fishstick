/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// --- MOCK DATA ---
const MOCK_DATA = {
  departments: [
    { id: 'ece', name: 'Electronics & Electrical Communication Eng.', branches: ['vlsi', 'comms', 'rf'] },
    { id: 'physics', name: 'Physics', branches: ['quantum', 'astro'] },
    { id: 'cs', name: 'Computer Science & Eng.', branches: ['ai', 'systems', 'theory'] },
  ],
  branches: {
    vlsi: { id: 'vlsi', name: 'Microelectronics & VLSI' },
    comms: { id: 'comms', name: 'Telecommunication Systems' },
    rf: { id: 'rf', name: 'RF and Microwaves' },
    quantum: { id: 'quantum', name: 'Quantum Physics' },
    astro: { id: 'astro', name: 'Astrophysics' },
    ai: { id: 'ai', name: 'Artificial Intelligence' },
    systems: { id: 'systems', name: 'Computer Systems' },
    theory: { id: 'theory', name: 'Theoretical CS' },
  },
  professors: {
    'prof1': { branch: 'quantum', name: 'Dr. Evelyn Reed', photo: 'https://i.pravatar.cc/150?img=1', degree: 'Ph.D., Stanford University', position: 'Professor', department: 'Physics', email: 'evelyn.reed@example.com', links: { awards: '#', webpage: '#', bio: '#' }, research: 'Quantum Computing', description: 'A leading researcher in quantum computing, focusing on scalable quantum algorithms.', details: 'Ph.D. from Stanford. 15+ years of experience.', projects: ['Project Qubitron', 'Quantum Supremacy Initiative'], companies: ['Google AI', 'IBM Quantum'] },
    'prof2': { branch: 'astro', name: 'Dr. Ben Carter', photo: 'https://i.pravatar.cc/150?img=2', degree: 'Ph.D., MIT', position: 'Associate Professor', department: 'Physics', email: 'ben.carter@example.com', links: { awards: '#', webpage: '#', bio: '#' }, research: 'Astrophysical Jets', description: 'Specializes in observational astrophysics and relativistic jets from active galactic nuclei.', details: 'Postdoc at MIT.', projects: ['Black Hole Imaging', 'Galaxy Cluster Analysis'], companies: ['NASA', 'SpaceX'] },
    'prof3': { branch: 'ai', name: 'Dr. Chloe Yao', photo: 'https://i.pravatar.cc/150?img=3', degree: 'Ph.D., Carnegie Mellon University', position: 'Professor', department: 'Computer Science & Eng.', email: 'chloe.yao@example.com', links: { awards: '#', webpage: '#', bio: '#' }, research: 'Machine Learning', description: 'Expert in deep learning models for natural language processing and computer vision.', details: 'Lead AI researcher at TechCorp.', projects: ['Neural Language Model X', 'Autonomous Vision System'], companies: ['OpenAI', 'DeepMind'] },
    'prof4': { branch: 'vlsi', name: 'Dr. Samuel Chen', photo: 'https://i.pravatar.cc/150?img=4', degree: 'Ph.D., UC Berkeley', position: 'Associate Professor', department: 'Electronics & Electrical Communication Eng.', email: 'samuel.chen@example.com', links: { awards: '#', webpage: '#', bio: '#' }, research: 'Semiconductor Design', description: 'Focuses on next-generation low-power semiconductor design and fabrication.', details: 'Holds 20 patents in chip design.', projects: ['3nm Chip Architecture', 'Photonics Integration'], companies: ['Intel', 'NVIDIA', 'TSMC'] },
    'prof5': { branch: 'vlsi', name: 'Sharba Bandyopadhyay', photo: 'https://i.pravatar.cc/150?img=5', degree: 'Ph.D., Johns Hopkins University, Baltimore, USA', position: 'Assistant Professor Grade-I', department: 'Electronics and Electrical Communication Engg.', email: 'sharba@ece.iitkgp.ac.in', links: { awards: '#', webpage: '#', bio: '#' }, research: 'Semiconductor Devices', description: 'Specializes in novel semiconductor devices and physics.', details: 'Details for Sharba.', projects: ['Project Nano', 'Project Giga'], companies: ['Company A', 'Company B'] },
  },
  news: [
    { title: 'Annual Tech Fest "Kshitij" Dates Announced', date: 'October 26, 2024' },
    { title: 'New Research Grant Awarded to Physics Department', date: 'October 25, 2024' },
    { title: 'AI Workshop for Undergraduates Next Month', date: 'October 22, 2024' },
  ],
};

// --- DOM ELEMENTS ---
const mainContent = document.getElementById('main-content');
const sidePanel = document.getElementById('side-panel');
const menuBtn = document.getElementById('menu-btn');
const closePanelBtn = document.getElementById('close-panel-btn');
const departmentsList = document.getElementById('departments-list');
const modalOverlay = document.getElementById('modal-overlay');

// --- STATE ---
let currentProfessorId = null;
const isAdmin = new URLSearchParams(window.location.search).get('admin') === 'true';

// --- RENDER FUNCTIONS ---
function clearMainContent() {
    if(mainContent) mainContent.innerHTML = '';
}

async function renderNews() {
  clearMainContent();
  const newsSection = document.createElement('section');
  newsSection.className = 'news-section';
  let content = '<h2>Latest Hiring</h2>';

  try {
    const response = await fetch("/api/company-jobs?name=Google"); // Example: Google
    const jobs = await response.json();

    jobs.forEach((job: any) => {
      content += `
        <div class="news-item">
          <h3>${job.title}</h3>
          <p>${job.company} – ${job.location}</p>
          <a href="${job.link}" target="_blank">View Job</a>
        </div>
      `;
    });
  } catch (e) {
    content += `<p>Failed to load jobs.</p>`;
  }

  newsSection.innerHTML = content;
  mainContent?.appendChild(newsSection);
}


function renderProfessors(branchId) {
    clearMainContent();
    const branchName = MOCK_DATA.branches[branchId]?.name || 'Professors';
    const professorSection = document.createElement('section');
    professorSection.className = 'professors-list-section';

    const adminButtonHTML = isAdmin 
        ? `<button id="add-professor-btn" class="add-btn">+ Add Professor</button>` 
        : '';

    professorSection.innerHTML = `
        <div class="section-header">
            <h2>${branchName}</h2>
            ${adminButtonHTML}
        </div>
        <div class="professors-list"></div>
    `;
    
    if (isAdmin) {
        professorSection.querySelector('#add-professor-btn')?.addEventListener('click', () => {
            showAddProfessorModal(branchId);
        });
    }

    const list = professorSection.querySelector('.professors-list');
    const professorsInBranch = Object.entries(MOCK_DATA.professors)
        .filter(([, prof]) => prof.branch === branchId);

    if (professorsInBranch.length > 0) {
        professorsInBranch.forEach(([id, prof]) => {
            const card = document.createElement('div');
            card.className = 'professor-card';
            card.setAttribute('data-id', id);
            card.innerHTML = `
                <img src="${prof.photo}" alt="Photo of ${prof.name}" class="professor-photo" loading="lazy">
                <div class="professor-details">
                    <h3>${prof.name}</h3>
                    <p>${prof.degree}</p>
                    <p class="position">${prof.position}</p>
                    <p>${prof.department}</p>
                    <p class="email">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        <a href="mailto:${prof.email}">${prof.email}</a>
                    </p>
                </div>
                <div class="professor-links">
                    <a href="${prof.links.awards}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> Awards and Accolades</a>
                    <a href="${prof.links.webpage}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg> Personal Webpage</a>
                    <a href="${prof.links.bio}"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg> Bio Sketch</a>
                </div>
            `;
            card.addEventListener('click', () => renderProfile(id));
            list?.appendChild(card);
        });
    } else {
        list.innerHTML = '<p>No professors found for this branch.</p>';
    }
    
    mainContent?.appendChild(professorSection);
}

function renderProfile(profId) {
    currentProfessorId = profId;
    clearMainContent();
    const prof = MOCK_DATA.professors[profId];
    if (!prof) return;

    const profileView = document.createElement('div');
    profileView.className = 'profile-view';
    profileView.innerHTML = `
        <section class="profile-header">
            <div class="profile-photo-wrapper">
                <img src="${prof.photo}" alt="${prof.name}" class="profile-photo">
                <button class="action-btn">ACTION</button>
            </div>
            <div class="profile-info">
                <h2>${prof.name}</h2>
                <p>${prof.description}</p>
            </div>
        </section>
        <section class="tabs-container">
            <nav class="tabs-nav">
                <button class="tab-btn active" data-tab="details">Details</button>
                <button class="tab-btn" data-tab="projects">Current Projects</button>
                <button class="tab-btn" data-tab="companies">Companies Applicable</button>
            </nav>
            <div id="details" class="tab-content active"><p>${prof.details}</p></div>
            <div id="projects" class="tab-content"><ul>${prof.projects.map(p => `<li>${p}</li>`).join('')}</ul></div>
            <div id="companies" class="tab-content"><ul>${prof.companies.map(c => `<li>${c}</li>`).join('')}</ul></div>
        </section>
    `;

    mainContent?.appendChild(profileView);
    setupProfileEventListeners();
}

// --- MODAL & MENU LOGIC ---

function openSidePanel() {
    sidePanel?.classList.add('is-open');
    sidePanel?.setAttribute('aria-hidden', 'false');
}

function closeSidePanel() {
    sidePanel?.classList.remove('is-open');
    sidePanel?.setAttribute('aria-hidden', 'true');
}

function openModal(content) {
    const modalContent = document.getElementById('modal-content');
    if (modalContent) modalContent.innerHTML = content;
    modalOverlay?.classList.add('is-visible');
    modalOverlay?.setAttribute('aria-hidden', 'false');
}

function closeModal() {
    modalOverlay?.classList.remove('is-visible');
    modalOverlay?.setAttribute('aria-hidden', 'true');
}

function showFirstModal() {
    openModal(`
        <div class="modal-header">
            <h3 class="modal-title">Confirmation</h3>
            <button class="close-btn" onclick="document.dispatchEvent(new Event('closeModal'))">&times;</button>
        </div>
        <div class="modal-body"><p>Set this professor as your target?</p></div>
        <div class="modal-actions">
            <button class="modal-btn secondary" onclick="document.dispatchEvent(new Event('closeModal'))">Cancel</button>
            <button class="modal-btn primary" id="confirm-target-btn">Confirm</button>
        </div>
    `);
    document.getElementById('confirm-target-btn')?.addEventListener('click', showSecondModal);
}

function showSecondModal() {
    openModal(`
        <div class="modal-header">
            <h3 class="modal-title">Next Steps</h3>
            <button class="close-btn" onclick="document.dispatchEvent(new Event('closeModal'))">&times;</button>
        </div>
        <div class="modal-body">
            <p>Please follow these steps to proceed:</p>
            <ul>
                <li>Review the professor's recent publications.</li>
                <li>Prepare a statement of purpose.</li>
                <li>Contact the department for application details.</li>
            </ul>
        </div>
        <div class="modal-actions">
            <button class="modal-btn primary" id="accept-steps-btn">Accept</button>
        </div>
    `);
    document.getElementById('accept-steps-btn')?.addEventListener('click', () => {
       if (document.body) document.body.innerHTML = '';
    });
}

function showAddProfessorModal(branchId) {
    const content = `
        <div class="modal-header">
            <h3 class="modal-title">Add New Professor</h3>
            <button class="close-btn" onclick="document.dispatchEvent(new Event('closeModal'))">&times;</button>
        </div>
        <form id="add-professor-form">
            <div class="modal-body">
                <div class="form-group">
                    <label for="prof-name">Full Name</label>
                    <input type="text" id="prof-name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="prof-photo">Photo URL</label>
                    <input type="url" id="prof-photo" name="photo" placeholder="https://example.com/photo.jpg" required>
                </div>
                <div class="form-group">
                    <label for="prof-degree">Degree</label>
                    <input type="text" id="prof-degree" name="degree" placeholder="Ph.D., University Name" required>
                </div>
                <div class="form-group">
                    <label for="prof-position">Position</label>
                    <input type="text" id="prof-position" name="position" required>
                </div>
                <div class="form-group">
                    <label for="prof-department">Department</label>
                    <input type="text" id="prof-department" name="department" required>
                </div>
                <div class="form-group">
                    <label for="prof-email">Email</label>
                    <input type="email" id="prof-email" name="email" required>
                </div>
            </div>
            <div class="modal-actions">
                <button type="button" class="modal-btn secondary" onclick="document.dispatchEvent(new Event('closeModal'))">Cancel</button>
                <button type="submit" class="modal-btn primary">Add Professor</button>
            </div>
        </form>
    `;
    openModal(content);
    
    document.getElementById('add-professor-form')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        
        const newProf = {
            branch: branchId,
            name: formData.get('name') as string,
            photo: formData.get('photo') as string,
            degree: formData.get('degree') as string,
            position: formData.get('position') as string,
            department: formData.get('department') as string,
            email: formData.get('email') as string,
            links: { awards: '#', webpage: '#', bio: '#' },
            research: 'Not specified',
            description: 'No description provided.',
            details: 'No details provided.',
            projects: [],
            companies: [],
        };

        const newId = `prof${Date.now()}`;
        MOCK_DATA.professors[newId] = newProf;

        closeModal();
        renderProfessors(branchId);
    });
}


// --- EVENT LISTENERS & SETUP ---
function setupProfileEventListeners() {
    mainContent.querySelector('.action-btn')?.addEventListener('click', showFirstModal);
    
    const tabs = mainContent.querySelectorAll('.tab-btn');
    const tabContents = mainContent.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === target) {
                    content.classList.add('active');
                }
            });
        });
    });
}

function initialize() {
    // Populate side panel
    MOCK_DATA.departments.forEach(dept => {
        const deptItem = document.createElement('div');
        deptItem.className = 'department-item';
        const deptName = document.createElement('a');
        deptName.className = 'department-name';
        deptName.textContent = dept.name;
        deptItem.appendChild(deptName);
        
        const branchesUl = document.createElement('ul');
        branchesUl.className = 'branches-list';
        dept.branches.forEach(branchId => {
            const branch = MOCK_DATA.branches[branchId];
            const branchLi = document.createElement('li');
            branchLi.className = 'branch-item';
            branchLi.innerHTML = `<a href="#" data-branch="${branch.id}">${branch.name}</a>`;
            branchesUl.appendChild(branchLi);
        });
        deptItem.appendChild(branchesUl);

        deptName.addEventListener('click', (e) => {
            e.preventDefault();
            deptItem.classList.toggle('is-open');
        });
        
        departmentsList?.appendChild(deptItem);
    });

    // Global event listeners
    menuBtn?.addEventListener('click', openSidePanel);
    closePanelBtn?.addEventListener('click', closeSidePanel);
    
    departmentsList?.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.matches('a[data-branch]')) {
            e.preventDefault();
            const branchId = target.getAttribute('data-branch');
            if (branchId) {
                renderProfessors(branchId);
                closeSidePanel();
            }
        }
    });
    
    // Close modal logic
    document.addEventListener('closeModal', closeModal);
    modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    
    // Initial Render
    renderNews();
}

document.addEventListener('DOMContentLoaded', initialize);