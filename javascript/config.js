const CONFIG = {
API_URL:"https://script.google.com/macros/s/AKfycbxOh9Oinp727G_DbdmVh4thRA2XF1xMvdgW0Yv3FKnnvqJR7U_Abt8w5QATV8tMx5LB/exec",

async get(sheet){
const res=await fetch(`${this.API_URL}?sheet=${encodeURIComponent(sheet)}`);
if(!res.ok) throw new Error("API Error");
const json=await res.json();
return json.data||[];
},

post(data){
return fetch(this.API_URL,{
method:"POST",
body:JSON.stringify(data)
}).then(async r=>{
const text=await r.text();
if(!r.ok) throw new Error(text||"API Error");
if(!text) return {success:true};
try{
const json=JSON.parse(text);
if(json&&json.success===false) throw new Error(json.error||"API Error");
return json;
}catch(error){
if(error.name==="SyntaxError") return {success:true,response:text};
throw error;
}
});
}
};
