//import axios from "axios";
import { showAlert } from "./alert";
//to support older vesion of broweres
export const login=async (email,password)=>{
    console.log(email,password);
    try{
   const res =await axios({
    method:"POST",
    url:"/api/v1/users/me",
    data:{
        email:email,
        password:password
    }
   })
  // const cookie = res.headers['set-cookie'];

// Now 'cookie' contains the cookie value that you can use or store as needed
//console.log(cookie);
   console.log(res);
   if(res.data.status==="success"){
   showAlert("Logged in successfully");
    window.setTimeout(()=>{
location.assign('/')
   },1500)
}}
  catch(err){
    showAlert("error",err.response.data.message);
   }
};

export const logout=async ()=>{
  try{

  const res =await axios({
    method:"GET",
    url:"/api/v1/users/logout",
   
   });
   console.log(res);
   if(res.data.status==="success")location.reload(true)
  }catch(err){
console.log(err);
    showAlert("error","error logging out! try again");
  }
}