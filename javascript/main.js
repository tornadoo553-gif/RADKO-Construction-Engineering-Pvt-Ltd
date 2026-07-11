/**
 * RADKO main.js
 * Simplified according to the approved architecture.
 * Dynamic:
 *   - HeroSlider
 *   - Projects
 *   - Contact Form
 *   - Career Form
 * Static:
 *   - About
 *   - Services
 *   - Team
 *   - Certificates
 *   - footer
 */

document.addEventListener("DOMContentLoaded", () => {

const $=(s,p=document)=>p.querySelector(s);
const $$=(s,p=document)=>[...p.querySelectorAll(s)];
const IMAGE_SEPARATOR = "(##IMG##)";
function esc(v){
  return String(v??"")
  .replace(/&/g,"&amp;")
  .replace(/</g,"&lt;")
  .replace(/>/g,"&gt;")
  .replace(/"/g,"&quot;");
}

function drive(url){
  const m=String(url).match(/[-\w]{25,}/);
  if(url.includes("drive.google.com") && m)
      return `https://drive.google.com/uc?export=view&id=${m[0]}`;
  return url;
}
function getProjectImages(mediaURL){

if(!mediaURL) return [];

return mediaURL
.split(IMAGE_SEPARATOR)
.map(url=>drive(url.trim()))
.filter(Boolean);

}
async function loadSheet(name){
   const res=await CONFIG.get(name);
   return Array.isArray(res)?res:[];
}

/* ---------- Navigation ---------- */

const menu=$(".nav-menu");
const btn=$(".menu-btn");

if(btn){
btn.onclick=()=>{
 menu.classList.toggle("active");
};
}

$("#copyrightYear") &&
($("#copyrightYear").textContent=new Date().getFullYear());

const topBtn=$("#scrollTop");
if(topBtn){
window.addEventListener("scroll",()=>{
 topBtn.classList.toggle("visible",window.scrollY>250);
});
topBtn.onclick=()=>window.scrollTo({top:0,behavior:"smooth"});
}

/* ---------- Hero ---------- */

(async()=>{

const slider=$("#heroSlider");
if(!slider) return;

let slides=await loadSheet("HeroSlider");

slides=slides
.filter(x=>String(x.active).toLowerCase()!="false")
.sort((a,b)=>Number(a.displayOrder)-Number(b.displayOrder));

slider.innerHTML=slides.map((s,i)=>`
<div class="slide ${i==0?"active":""}"
style="background-image:url('${drive(s.mediaURL)}')">

<div class="hero-overlay"></div>

<div class="container">
<div class="hero-content">
<span class="hero-kicker">Construction & Engineering</span>
<h2>${esc(s.title)}</h2>
<p>${esc(s.description)}</p>
<a href="projects.html" class="primary-btn">
View Projects
</a>
</div>
</div>

</div>
`).join("");

let index=0;
const items=$$(".slide",slider);

function show(i){
items.forEach((e,n)=>e.classList.toggle("active",n==i));
}

$("#prevSlide")?.addEventListener("click",()=>{
index=(index-1+items.length)%items.length;
show(index);
});

$("#nextSlide")?.addEventListener("click",()=>{
index=(index+1)%items.length;
show(index);
});

setInterval(()=>{
if(!items.length) return;
index=(index+1)%items.length;
show(index);
},6000);

})();

/* ---------- Projects ---------- */

(async()=>{

const home=$("#featuredProjects");
const page=$("#projectsContainer");

if(!home && !page) return;

let projects=await loadSheet("Projects");

projects=projects
.filter(p=>String(p.active).toLowerCase()!="false")
.sort((a,b)=>Number(a.displayOrder)-Number(b.displayOrder));

function card(p){
const images = getProjectImages(p.mediaURL);

return `
<div class="project-card"
data-images='${JSON.stringify(images)}'
data-title="${esc(p.title)}"
data-category="${esc(p.category)}"
data-location="${esc(p.location)}"
data-description="${esc(p.description)}"
data-date="${esc(p.completedDate || "")}">

<div class="project-image">
<img src="${images[0] || ""}" alt="">
<span>${esc(p.category)}</span>
</div>

<div class="project-content">
<h3>${esc(p.title)}</h3>
<p class="project-meta">${esc(p.location)}</p>
<p>${esc(p.description)}</p>
${p.completedDate ? `<strong>${esc(p.completedDate)}</strong>` : ""}
</div>

</div>`;
}

if(home){
home.innerHTML=projects.slice(0,6).map(card).join("");
}

if(home || page){

const filters = page ? $("#projectFilters") : null;

if(filters){

const cats=["All",...new Set(projects.map(x=>x.category))];

filters.innerHTML=cats.map(c=>
`<button data-cat="${c}" class="${c=="All"?"active":""}">${c}</button>`
).join("");

}

function render(cat){

const arr=cat=="All"
?projects
:projects.filter(p=>p.category==cat);

page.innerHTML=arr.map(card).join("");

}

if(page){
render("All");
}
const gallery=$("#projectGallery");
const galleryImage=$("#galleryImage");
galleryImage.onload=()=>{
galleryImage.style.opacity="1";
};
const galleryTitle=$("#galleryTitle");
const galleryLocation=$("#galleryLocation");
const galleryDescription=$("#galleryDescription");
const galleryDate=$("#galleryDate");
const galleryCounter=$("#galleryCounter");
const galleryThumbnails=$("#galleryThumbnails");
let currentImages=[];
let currentIndex=0;
function updateGalleryUI(){

galleryCounter.textContent=
`${String(currentIndex+1).padStart(2,"0")} / ${String(currentImages.length).padStart(2,"0")}`;

galleryThumbnails.innerHTML=currentImages.map((img,index)=>`
<div class="gallery-thumb ${index===currentIndex?"active":""}" data-index="${index}">
<img src="${img}" alt="">
</div>
`).join("");

}
function openGallery(e){

const card=e.target.closest(".project-card");

if(!card) return;

currentImages=JSON.parse(card.dataset.images||"[]");
currentIndex=0;

galleryImage.src=currentImages[0]||"";
galleryTitle.textContent=card.dataset.title;
galleryLocation.textContent=card.dataset.location;
galleryDescription.textContent=card.dataset.description;
galleryDate.textContent=card.dataset.date;

updateGalleryUI();

gallery.classList.add("active");

}

home?.addEventListener("click",openGallery);
page?.addEventListener("click",openGallery);

$(".gallery-close").onclick=()=>{
gallery.classList.remove("active");
};

$(".gallery-overlay").onclick=()=>{
gallery.classList.remove("active");
};
function showImage(index){

if(!currentImages.length) return;

if(index<0){
index=currentImages.length-1;
}

if(index>=currentImages.length){
index=0;
}

currentIndex=index;

galleryImage.style.opacity="0";

setTimeout(()=>{

galleryImage.src=currentImages[currentIndex];

updateGalleryUI();

},150);

}

$(".gallery-prev").onclick=()=>{
showImage(currentIndex-1);
};

$(".gallery-next").onclick=()=>{
showImage(currentIndex+1);
};
galleryThumbnails.onclick=e=>{

const thumb=e.target.closest(".gallery-thumb");

if(!thumb) return;

showImage(Number(thumb.dataset.index));

};
filters.onclick=e=>{

const b=e.target.closest("button");

if(!b) return;

$$("button",filters).forEach(x=>x.classList.remove("active"));
b.classList.add("active");

render(b.dataset.cat);

};

}

})();
/* ---------- Job Openings ---------- */

(async()=>{

const container=$("#jobOpenings");

if(!container) return;

let jobs=await loadSheet("JobOpenings");

jobs=jobs
.filter(j=>String(j.active).toLowerCase()!="false")
.sort((a,b)=>Number(a.displayOrder)-Number(b.displayOrder));

if(!jobs.length){

container.innerHTML=`
<div class="section-header">
<div>
<span class="section-subtitle">CURRENT OPENINGS</span>
<h2 class="section-title">We're Hiring</h2>
</div>
</div>

<div class="empty-state">
<h3>No Current Openings</h3>
<p>
We currently do not have any active job openings.
However, we are always interested in connecting with talented
professionals. Please submit your resume using the application
form below for future opportunities.
</p>
</div>
`;

return;

}

container.innerHTML=`

<div class="section-header">
<div>
<span class="section-subtitle">CURRENT OPENINGS</span>
<h2 class="section-title">We're Hiring</h2>
</div>
</div>

<div class="job-list">

${jobs.map(job=>`

<div class="job-card">

<div>

<span>${esc(job.department)}</span>

<h3>${esc(job.title)}</h3>

<p><i class="fa-solid fa-location-dot"></i>${esc(job.location)}</p>

<p><i class="fa-solid fa-briefcase"></i>${esc(job.employmentType)}</p>

<p><i class="fa-solid fa-user-clock"></i>${esc(job.experience)}</p>

</div>

<div>

<p>${esc(job.description)}</p>

<br>

<a href="#careerForm" class="primary-btn">
Apply Now
</a>

</div>

</div>

`).join("")}

</div>

`;

})();
/* ---------- Contact ---------- */

const contact=$("#contactForm");

if(contact){

contact.onsubmit=async e=>{

e.preventDefault();

const f=new FormData(contact);

await CONFIG.post({
action:"contact",
name:f.get("name"),
phone:f.get("phone"),
email:f.get("email"),
subject:f.get("subject"),
message:f.get("message")
});

alert("Message sent successfully.");
contact.reset();

};

}

/* ---------- Career ---------- */

function b64(file){
return new Promise((ok,err)=>{
const r=new FileReader();
r.onload=()=>ok(r.result.split(",")[1]);
r.onerror=err;
r.readAsDataURL(file);
});
}

const career=$("#careerForm");

if(career){

career.onsubmit=async e=>{

e.preventDefault();

const f=new FormData(career);

const resume = f.get("resume");

// Maximum 5 MB
if (resume && resume.size > 5 * 1024 * 1024) {
    alert("Maximum file size is 5 MB.");
    return;
}

const data = resume && resume.size
    ? await b64(resume)
    : "";

await CONFIG.post({

action:"career",

name:f.get("name"),
phone:f.get("phone"),
email:f.get("email"),
subject:"Career",
position:f.get("position"),
message:f.get("message"),

resumeName:resume.name,
resumeType:resume.type,
resumeBase64:data

});

alert("Application submitted successfully.");

career.reset();

};

}

});
