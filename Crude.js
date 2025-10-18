


const uid = () => 'id_' + Math.random().toString(36).slice(2,9);


function seedData() {
  if(!localStorage.getItem('teachers')){
    const t = [
      {id:uid(), name:'Chhun Eng-Srorng', email:'vibol@nu.edu', subject:'English'},
      {id:uid(), name:'Long Sothea', email:'lisa@nu.edu', subject:'IT'},
    ];
    localStorage.setItem('teachers', JSON.stringify(t));
  }
  if(!localStorage.getItem('students')){
    const s = [
      {id:uid(), name:'Sokha', email:'sokha@student.nu', grade:'12'},
      {id:uid(), name:'Rith', email:'rith@student.nu', grade:'11'},
    ];
    localStorage.setItem('students', JSON.stringify(s));
  }
  if(!localStorage.getItem('courses')){
    const t = JSON.parse(localStorage.getItem('teachers') || '[]');
    const c = [
      {id:uid(), title:'Web Development', code:'WD101', teacherId: t[1]?.id || null, students: []},
      {id:uid(), title:'Basic English', code:'EN101', teacherId: t[0]?.id || null, students: []}
    ];
    localStorage.setItem('courses', JSON.stringify(c));
  }
}

seedData();
const db = {
  teachers: ()=> JSON.parse(localStorage.getItem('teachers') || '[]'),
  students: ()=> JSON.parse(localStorage.getItem('students') || '[]'),
  courses: ()=> JSON.parse(localStorage.getItem('courses') || '[]'),
  saveTeachers: (arr)=> localStorage.setItem('teachers', JSON.stringify(arr)),
  saveStudents: (arr)=> localStorage.setItem('students', JSON.stringify(arr)),
  saveCourses: (arr)=> localStorage.setItem('courses', JSON.stringify(arr)),
};


const tabs = document.querySelectorAll('.tab-btn');
const sections = {teachers: document.getElementById('teachers'), students: document.getElementById('students'), courses: document.getElementById('courses')};
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const modalTitle = document.getElementById('modalTitle');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');

function renderTeachers(filter=''){
  const arr = db.teachers().filter(t => (t.name + t.email + t.subject).toLowerCase().includes(filter.toLowerCase()));
  document.getElementById('countTeachers').textContent = arr.length;
  const wrap = document.getElementById('teachersTableWrap');
  if(!arr.length){ wrap.innerHTML = '<div class="empty">No teachers yet.</div>'; return; }
  let html = `<table><thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Actions</th></tr></thead><tbody>`;
  for(const t of arr){
    html += `<tr>
      <td>${escapeHtml(t.name)}</td>
      <td class="muted">${escapeHtml(t.email)}</td>
      <td><span class="pill">${escapeHtml(t.subject)}</span></td>
      <td class="actions">
        <div class="actions">
          <button class="btn-sm btn-edit" onclick="openEditTeacher('${t.id}')">Edit</button>
          <button class="btn-sm btn-delete" onclick="deleteTeacher('${t.id}')">Delete</button>
        </div>
      </td>
    </tr>`;
  }
  html += `</tbody></table>`;
  wrap.innerHTML = html;
}

function renderStudents(filter=''){
  const arr = db.students().filter(s => (s.name + s.email + s.grade).toLowerCase().includes(filter.toLowerCase()));
  document.getElementById('countStudents').textContent = arr.length;
  const wrap = document.getElementById('studentsTableWrap');
  if(!arr.length){ wrap.innerHTML = '<div class="empty">No students yet.</div>'; return; }
  let html = `<table><thead><tr><th>Name</th><th>Email</th><th>Grade</th><th>Actions</th></tr></thead><tbody>`;
  for(const s of arr){
    html += `<tr>
      <td>${escapeHtml(s.name)}</td>
      <td class="muted">${escapeHtml(s.email)}</td>
      <td><span class="pill">${escapeHtml(s.grade)}</span></td>
      <td class="actions">
        <button class="btn-sm btn-edit" onclick="openEditStudent('${s.id}')">Edit</button>
        <button class="btn-sm btn-delete" onclick="deleteStudent('${s.id}')">Delete</button>
      </td>
    </tr>`;
  }
  html += `</tbody></table>`;
  wrap.innerHTML = html;
}

function renderCourses(filter=''){
  const arr = db.courses().filter(c => (c.title + c.code).toLowerCase().includes(filter.toLowerCase()));
  document.getElementById('countCourses').textContent = arr.length;
  const wrap = document.getElementById('coursesTableWrap');
  if(!arr.length){ wrap.innerHTML = '<div class="empty">No courses yet.</div>'; return; }
  const teachersMap = Object.fromEntries(db.teachers().map(t => [t.id, t]));
  const studentsMap = Object.fromEntries(db.students().map(s => [s.id, s]));
  let html = `<table><thead><tr><th>Title</th><th>Code</th><th>Teacher</th><th>Enrolled</th><th>Actions</th></tr></thead><tbody>`;
  for(const c of arr){
    const t = teachersMap[c.teacherId];
    const teacherName = t ? t.name : '<span class="muted">Unassigned</span>';
    html += `<tr>
      <td>${escapeHtml(c.title)}</td>
      <td class="muted">${escapeHtml(c.code)}</td>
      <td>${teacherName}</td>
      <td><span class="pill">${c.students ? c.students.length : 0}</span></td>
      <td class="actions">
        <button class="btn-sm btn-view" onclick="openViewCourse('${c.id}')">View</button>
        <button class="btn-sm btn-edit" onclick="openEditCourse('${c.id}')">Edit</button>
        <button class="btn-sm btn-delete" onclick="deleteCourse('${c.id}')">Delete</button>
      </td>
    </tr>`;
  }
  html += `</tbody></table>`;
  wrap.innerHTML = html;
}

function escapeHtml(str){
  if(!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Initial render
function renderAll(){
  renderTeachers();
  renderStudents();
  renderCourses();
}
renderAll();

// Tab logic
tabs.forEach(btn => {
  btn.addEventListener('click', ()=> {
    tabs.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const t = btn.dataset.tab;
    for(const key in sections){
      sections[key].style.display = (key === t) ? '' : 'none';
    }
    // scroll into view (nice UX)
    sections[t].scrollIntoView({behavior:'smooth'});
  });
});

// Search handlers
document.getElementById('searchTeacher').addEventListener('input', e => renderTeachers(e.target.value));
document.getElementById('searchStudent').addEventListener('input', e => renderStudents(e.target.value));
document.getElementById('searchCourse').addEventListener('input', e => renderCourses(e.target.value));

// Modal helpers
function openModal(title, contentHtml, onSave){
  modalTitle.textContent = title;
  modalContent.innerHTML = contentHtml;
  modal.classList.add('show');
  saveBtn.onclick = () => { onSave(); modal.classList.remove('show'); }
  cancelBtn.onclick = () => modal.classList.remove('show');
}

// ---------- TEACHER CRUD ----------
document.getElementById('addTeacherBtn').addEventListener('click', ()=> {
  openModal('Add Teacher', teacherFormHtml(), ()=> {
    const name = modalContent.querySelector('[name=name]').value.trim();
    const email = modalContent.querySelector('[name=email]').value.trim();
    const subject = modalContent.querySelector('[name=subject]').value.trim();
    if(!name || !email){ alert('Please provide name and email'); return; }
    const arr = db.teachers();
    arr.push({id:uid(), name, email, subject});
    db.saveTeachers(arr);
    renderTeachers();
  });
});

window.openEditTeacher = function(id){
  const t = db.teachers().find(x=>x.id===id);
  if(!t) return alert('Teacher not found');
  openModal('Edit Teacher', teacherFormHtml(t), ()=> {
    const name = modalContent.querySelector('[name=name]').value.trim();
    const email = modalContent.querySelector('[name=email]').value.trim();
    const subject = modalContent.querySelector('[name=subject]').value.trim();
    if(!name || !email){ alert('Please provide name and email'); return; }
    const arr = db.teachers().map(x => x.id===id ? {...x, name, email, subject} : x);
    db.saveTeachers(arr);
    renderTeachers(); renderCourses(); // re-render courses to update teacher names
  });
}

window.deleteTeacher = function(id){
  if(!confirm('Delete this teacher?')) return;
  // If teacher assigned to courses -> unset
  const courses = db.courses().map(c => c.teacherId === id ? {...c, teacherId: null} : c);
  db.saveCourses(courses);
  const arr = db.teachers().filter(x=>x.id!==id);
  db.saveTeachers(arr);
  renderTeachers(); renderCourses();
}

function teacherFormHtml(data = {}){
  return `
    <div class="form-grid">
      <div>
        <label>Name</label>
        <input name="name" type="text" value="${escapeHtml(data.name || '')}" />
      </div>
      <div>
        <label>Email</label>
        <input name="email" type="email" value="${escapeHtml(data.email || '')}" />
      </div>
      <div>
        <label>Subject</label>
        <input name="subject" type="text" value="${escapeHtml(data.subject || '')}" />
      </div>
    </div>
  `;
}

// ---------- STUDENT CRUD ----------
document.getElementById('addStudentBtn').addEventListener('click', ()=> {
  openModal('Add Student', studentFormHtml(), ()=> {
    const name = modalContent.querySelector('[name=name]').value.trim();
    const email = modalContent.querySelector('[name=email]').value.trim();
    const grade = modalContent.querySelector('[name=grade]').value.trim();
    if(!name || !email){ alert('Please provide name and email'); return; }
    const arr = db.students();
    arr.push({id:uid(), name, email, grade});
    db.saveStudents(arr);
    renderStudents();
  });
});

window.openEditStudent = function(id){
  const s = db.students().find(x=>x.id===id);
  if(!s) return alert('Student not found');
  openModal('Edit Student', studentFormHtml(s), ()=> {
    const name = modalContent.querySelector('[name=name]').value.trim();
    const email = modalContent.querySelector('[name=email]').value.trim();
    const grade = modalContent.querySelector('[name=grade]').value.trim();
    if(!name || !email){ alert('Please provide name and email'); return; }
    const arr = db.students().map(x => x.id===id ? {...x, name, email, grade} : x);
    db.saveStudents(arr);
    renderStudents(); renderCourses();
  });
}

window.deleteStudent = function(id){
  if(!confirm('Delete this student?')) return;
  // remove student from any course lists
  const courses = db.courses().map(c => {
    if(!c.students) return c;
    return {...c, students: c.students.filter(sid => sid !== id)};
  });
  db.saveCourses(courses);
  const arr = db.students().filter(x=>x.id!==id);
  db.saveStudents(arr);
  renderStudents(); renderCourses();
}

function studentFormHtml(data = {}){
  return `
    <div class="form-grid">
      <div>
        <label>Name</label>
        <input name="name" type="text" value="${escapeHtml(data.name || '')}" />
      </div>
      <div>
        <label>Email</label>
        <input name="email" type="email" value="${escapeHtml(data.email || '')}" />
      </div>
      <div>
        <label>Grade</label>
        <input name="grade" type="text" value="${escapeHtml(data.grade || '')}" />
      </div>
    </div>
  `;
}

// ---------- COURSE CRUD ----------
document.getElementById('addCourseBtn').addEventListener('click', ()=> {
  openModal('Add Course', courseFormHtml(), ()=> {
    const title = modalContent.querySelector('[name=title]').value.trim();
    const code = modalContent.querySelector('[name=code]').value.trim();
    const teacherId = modalContent.querySelector('[name=teacherId]').value || null;
    const students = Array.from(modalContent.querySelectorAll('[name=students] option:checked')).map(o=>o.value);
    if(!title || !code){ alert('Please provide title and code'); return; }
    const arr = db.courses();
    arr.push({id:uid(), title, code, teacherId: teacherId || null, students});
    db.saveCourses(arr);
    renderCourses();
  });
});

window.openEditCourse = function(id){
  const c = db.courses().find(x=>x.id===id);
  if(!c) return alert('Course not found');
  openModal('Edit Course', courseFormHtml(c), ()=> {
    const title = modalContent.querySelector('[name=title]').value.trim();
    const code = modalContent.querySelector('[name=code]').value.trim();
    const teacherId = modalContent.querySelector('[name=teacherId]').value || null;
    const students = Array.from(modalContent.querySelectorAll('[name=students] option:checked')).map(o=>o.value);
    if(!title || !code){ alert('Please provide title and code'); return; }
    const arr = db.courses().map(x => x.id===id ? {...x, title, code, teacherId: teacherId || null, students} : x);
    db.saveCourses(arr);
    renderCourses();
  });
}

window.deleteCourse = function(id){
  if(!confirm('Delete this course?')) return;
  const arr = db.courses().filter(x=>x.id!==id);
  db.saveCourses(arr);
  renderCourses();
}

window.openViewCourse = function(id){
  const c = db.courses().find(x=>x.id===id);
  if(!c) return alert('Course not found');
  const teachers = db.teachers();
  const students = db.students();
  const teacher = teachers.find(t=>t.id===c.teacherId);
  const enrolled = (c.students || []).map(sid => students.find(s=>s.id===sid)).filter(Boolean);
  let html = `<div style="margin-bottom:8px"><strong>Title:</strong> ${escapeHtml(c.title)}</div>`;
  html += `<div style="margin-bottom:8px"><strong>Code:</strong> ${escapeHtml(c.code)}</div>`;
  html += `<div style="margin-bottom:8px"><strong>Teacher:</strong> ${teacher ? escapeHtml(teacher.name) : '<span class="muted">Unassigned</span>'}</div>`;
  html += `<div style="margin-top:8px"><strong>Enrolled Students (${enrolled.length}):</strong><ul>`;
  if(enrolled.length){
    for(const s of enrolled) html += `<li>${escapeHtml(s.name)} — <span class="muted">${escapeHtml(s.email)}</span></li>`;
  } else html += `<li class="muted">No students enrolled</li>`;
  html += `</ul></div>`;
  openModal('Course Detail', html, ()=> modal.classList.remove('show'));
  saveBtn.style.display = 'none';
  cancelBtn.textContent = 'Close';
  cancelBtn.onclick = ()=> { saveBtn.style.display=''; cancelBtn.textContent='Cancel'; modal.classList.remove('show'); renderCourses(); };
}

function courseFormHtml(data = {}){
  const teachers = db.teachers();
  const students = db.students();
  const teacherOptions = `<option value="">-- Select teacher (optional) --</option>` + teachers.map(t => `<option value="${t.id}" ${t.id===data.teacherId?'selected':''}>${escapeHtml(t.name)} (${escapeHtml(t.subject)})</option>`).join('');
  const studentOptions = students.map(s => `<option value="${s.id}" ${ (data.students || []).includes(s.id) ? 'selected' : '' }>${escapeHtml(s.name)} — ${escapeHtml(s.email)}</option>`).join('');
  return `
    <div class="form-grid">
      <div>
        <label>Title</label>
        <input name="title" type="text" value="${escapeHtml(data.title || '')}" />
      </div>
      <div>
        <label>Code</label>
        <input name="code" type="text" value="${escapeHtml(data.code || '')}" />
      </div>
      <div>
        <label>Teacher</label>
        <select name="teacherId">${teacherOptions}</select>
      </div>
      <div style="grid-column:1 / -1;">
        <label>Enroll Students (Ctrl/Cmd select multiple)</label>
        <select name="students" multiple size="6" style="width:100%; padding:8px; border-radius:8px; border:1px solid #e6edf6">
          ${studentOptions}
        </select>
      </div>
    </div>
  `;
}

// =====================
// Helpers: re-render after changes
// =====================
// observe localStorage changes within this tab (for multi-tab UX)
window.addEventListener('storage', () => renderAll());

// Initial: attach visibility animation
const faders = document.querySelectorAll('.fade-in');
const obs = new IntersectionObserver((entries)=> {
  entries.forEach(e=> { if(e.isIntersecting) e.target.classList.add('visible'); });
}, {threshold:0.12});
faders.forEach(f => obs.observe(f));

// Basic escape close modal by clicking backdrop
modal.addEventListener('click', (e)=>{
  if(e.target === modal) modal.classList.remove('show');
});

// initial render done above, but call again to be safe
renderAll();

// Expose render functions to scope for inline calls
window.renderTeachers = renderTeachers;
window.renderStudents = renderStudents;
window.renderCourses = renderCourses;

