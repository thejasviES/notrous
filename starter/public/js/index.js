import"@babel/polyfill";
import {login,logout} from "./login"
import { displayMap } from "./mapbox";

//dom element
//getting data from html so which is stored in location variable for mapbox
const mapBox=document.getElementById("map");
const loginForm=document.querySelector(".form");
const logOutBtn=document.querySelector(".nav__el.nav__el--logout");
//values

//delegation
if(mapBox){
const locations = JSON.parse(document.getElementById("map").dataset.locations);
displayMap(locations);
}
if(loginForm){
document.querySelector(".form").addEventListener("submit",e=>{
    //this will prevent from loading another page
    e.preventDefault();
    const email=document.getElementById("email").value;
    const password=document.getElementById("password").value;
    console.log(email,password);
    try{login(email,password);}catch(err){
      //  console.log(err.response.data);
    }
})}; 


if(logOutBtn) logOutBtn.addEventListener("click",logout)