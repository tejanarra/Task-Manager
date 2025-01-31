"use strict";(self.webpackChunktask_manager_frontend=self.webpackChunktask_manager_frontend||[]).push([[987],{987:(e,a,t)=>{t.r(a),t.d(a,{default:()=>c});var s=t(43),r=t(216),o=t(475),n=t(729),i=t(505),l=t(579);const c=e=>{let{theme:a}=e;const{login:t}=(0,n.A)(),c=(0,r.Zp)(),[d,p]=(0,s.useState)(""),[u,m]=(0,s.useState)(""),[g,h]=(0,s.useState)(""),[f,w]=(0,s.useState)(!1);return(0,l.jsx)("div",{className:"login-page d-flex align-items-center justify-content-center",children:(0,l.jsxs)("div",{className:"login-form",children:[(0,l.jsx)("h1",{className:"fw-bold mb-2",children:"Welcome back"}),(0,l.jsx)("p",{className:"text-".concat("dark"===a?"light":"muted"," mb-4"),children:"Please enter your details"}),g&&(0,l.jsx)("div",{className:"alert alert-danger",children:g}),(0,l.jsxs)("form",{onSubmit:async e=>{e.preventDefault(),h(""),w(!0);try{const{data:e}=await(0,i.Lx)(d,u),{token:a,userInfo:s}=e;t(a,s),c("/Task-Manager/tasks")}catch(n){var a,s,r,o;console.error("Login failed:",(null===(a=n.response)||void 0===a||null===(s=a.data)||void 0===s?void 0:s.message)||n.message),h((null===(r=n.response)||void 0===r||null===(o=r.data)||void 0===o?void 0:o.message)||"Login failed. Please try again.")}finally{w(!1)}},children:[(0,l.jsx)("div",{className:"mb-3",children:(0,l.jsx)("input",{type:"email",className:"form-control py-2",id:"email",placeholder:"Enter your email",value:d,onChange:e=>p(e.target.value),required:!0})}),(0,l.jsx)("div",{className:"mb-3",children:(0,l.jsx)("input",{type:"password",className:"form-control py-2",id:"password",placeholder:"Enter your password",value:u,onChange:e=>m(e.target.value),required:!0})}),(0,l.jsx)("button",{type:"submit",className:"btn sign-in-btn w-100 mb-3",disabled:f,children:f?(0,l.jsx)("span",{className:"spinner-border spinner-border-sm text-light",role:"status","aria-hidden":"true"}):"Login"})]}),(0,l.jsxs)("div",{className:"d-flex justify-content-between mt-3",children:[(0,l.jsx)(o.N_,{to:"/Task-Manager/register",className:"register-link",children:"Register"}),(0,l.jsx)("button",{className:"btn btn-link forgot-password-link p-0",onClick:()=>{c("/Task-Manager/forgot-password")},children:"Forgot password?"})]})]})})}},505:(e,a,t)=>{t.d(a,{A7:()=>p,DY:()=>d,E$:()=>f,J2:()=>u,Lx:()=>c,U0:()=>m,UT:()=>o,ec:()=>h,j:()=>r,lC:()=>n,r7:()=>w,vF:()=>l,vq:()=>i,xw:()=>g});const s=t(722).A.create({baseURL:"https://task-manager-sigma-ashen.vercel.app/api",headers:{"ngrok-skip-browser-warning":"true"}});s.interceptors.request.use((e=>{const a=localStorage.getItem("token");return a&&(e.headers.Authorization="Bearer ".concat(a)),e}),(e=>Promise.reject(e)));const r=()=>s.get("/tasks"),o=e=>s.post("/tasks",e),n=(e,a)=>s.put("/tasks/".concat(e),a),i=e=>s.delete("/tasks/".concat(e)),l=(e,a)=>s.put("/tasks/".concat(e,"/priority"),{priority:a}),c=(e,a)=>s.post("/auth/login",{email:e,password:a}),d=(e,a,t,r)=>s.post("/auth/register",{firstName:e,lastName:a,email:t,password:r}),p=(e,a)=>s.post("/auth/verify-registration",{email:e,verificationCode:a}),u=e=>s.post("/auth/resend-verification",{email:e}),m=e=>s.post("/auth/forgot-password",{email:e}),g=(e,a,t)=>s.post("/auth/verify-code",{email:e,verificationCode:a,newPassword:t}),h=(e,a)=>s.post("/auth/change-password",{currentPassword:e,newPassword:a}),f=async()=>{try{return(await s.get("/profile")).data}catch(e){throw console.error("Error fetching profile:",e),e}},w=async e=>{try{return(await s.put("/profile",e,{headers:{"Content-Type":"multipart/form-data"}})).data}catch(a){throw console.error("Error updating profile:",a),a}}}}]);
//# sourceMappingURL=987.b1f1a8a4.chunk.js.map