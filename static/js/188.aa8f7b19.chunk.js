(self.webpackChunktask_manager_frontend=self.webpackChunktask_manager_frontend||[]).push([[188],{188:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>u});var o=a(555),n=a(43),r=a(216),i=a(505),s=a(872),c=a.n(s),l=(a(347),a(579));const u=()=>{const[e,t]=(0,n.useState)(null),[a,s]=(0,n.useState)(null),[u,h]=(0,n.useState)(""),[d,p]=(0,n.useState)(""),[g,m]=(0,n.useState)(1),[f,v]=(0,n.useState)(0),[y,b]=(0,n.useState)(!1),w=(0,r.Zp)(),x=(0,n.useRef)(null);(0,n.useEffect)((()=>{(async()=>{try{const e=await(0,i.E$)();if(!e)throw new Error("Received no data");t(e)}catch(e){h("Failed to fetch profile data: ".concat(e.message||e.toString()))}})()}),[]);const j=a=>{const{name:n,value:r}=a.target;e&&t((0,o.A)((0,o.A)({},e),{},{[n]:r}))},C=async a=>{a.append("firstName",e.firstName),a.append("lastName",e.lastName),a.append("phoneNumber",e.phoneNumber),a.append("dob",e.dob),a.append("bio",e.bio||"");try{const e=await(0,i.r7)(a);t(e.user),p("Profile updated successfully!"),setTimeout((()=>w("/profile-overview")),2e3)}catch(o){h("Failed to update profile."),console.error(o)}finally{b(!1)}};return e||u?u?(0,l.jsxs)("div",{className:"profile-container",children:[(0,l.jsx)("h2",{className:"profile-title",children:"Edit Profile"}),(0,l.jsx)("p",{className:"text-danger text-center",children:u})]}):(0,l.jsx)("div",{className:"profile-container",children:(0,l.jsxs)("div",{className:"profile-card shadow rounded",children:[(0,l.jsx)("h2",{className:"profile-title text-center mb-4",children:"Edit Profile"}),d&&(0,l.jsx)("p",{className:"text-success text-center",children:d}),y&&(0,l.jsx)("div",{className:"loading-overlay",children:"Updating..."}),(0,l.jsxs)("form",{onSubmit:async t=>{if(t.preventDefault(),!e)return void h("No profile data available.");b(!0);const o=new FormData;if(a&&x.current){x.current.getImageScaledToCanvas().toBlob((async e=>{const t=new File([e],a.name,{type:"image/jpeg",lastModified:Date.now()});o.append("avatar",t),C(o)}),"image/jpeg")}else C(o)},children:[(0,l.jsxs)("div",{className:"text-center mb-4",children:[(0,l.jsx)("label",{htmlFor:"avatarUpload",className:"profile-image-preview",children:a?(0,l.jsx)(c(),{ref:x,image:a,width:250,height:250,border:25,borderRadius:125,color:[255,255,255,.6],scale:g,rotate:f,className:"avatar-editor"}):e.avatar?(0,l.jsx)("img",{src:e.avatar,alt:"Profile",className:"rounded-circle profile-image"}):(0,l.jsx)("div",{className:"placeholder-avatar",children:e?(0,l.jsxs)(l.Fragment,{children:[e.firstName&&e.firstName[0]?e.firstName[0].toUpperCase():"",e.lastName&&e.lastName[0]?e.lastName[0].toUpperCase():""]}):null})}),(0,l.jsx)("input",{type:"file",id:"avatarUpload",accept:"image/*",onChange:e=>{const t=e.target.files[0];t&&(s(t),m(1),v(0))},className:"d-none"})]}),a&&(0,l.jsxs)("div",{className:"image-controls mb-4",children:[(0,l.jsxs)("div",{className:"control-group",children:[(0,l.jsx)("label",{htmlFor:"zoomRange",children:"Zoom:"}),(0,l.jsx)("input",{type:"range",id:"zoomRange",min:"1",max:"2",step:"0.01",value:g,onChange:e=>{const t=parseFloat(e.target.value);m(t)}})]}),(0,l.jsxs)("div",{className:"control-group",children:[(0,l.jsx)("label",{htmlFor:"rotateRange",children:"Rotate:"}),(0,l.jsx)("input",{type:"range",id:"rotateRange",min:"0",max:"360",step:"1",value:f,onChange:e=>{const t=parseInt(e.target.value,10);v(t)}})]})]}),Object.entries({firstName:"First Name",lastName:"Last Name",phoneNumber:"Phone Number",dob:"Date of Birth",bio:"Bio"}).map((t=>{let[a,o]=t;return(0,l.jsxs)("div",{className:"form-group mb-3",children:[(0,l.jsx)("label",{htmlFor:a,className:"form-label",children:o}),"bio"===a?(0,l.jsx)("textarea",{className:"form-control",id:a,name:a,value:e[a]||"",onChange:j,placeholder:"Enter your ".concat(o.toLowerCase(),"..."),rows:"4"}):(0,l.jsx)("input",{type:"dob"===a?"date":"text",className:"form-control",id:a,name:a,value:e[a]||"",onChange:j,placeholder:"Enter your ".concat(o.toLowerCase(),"..."),required:"bio"!==a&&"phoneNumber"!==a})]},a)})),(0,l.jsxs)("div",{className:"row mt-4",children:[(0,l.jsx)("div",{className:"col-12 col-md-6 mb-2 mb-md-0",children:(0,l.jsx)("button",{type:"button",className:"btn btn-secondary w-100",onClick:()=>w("/profile-overview"),disabled:y,children:"Cancel"})}),(0,l.jsx)("div",{className:"col-12 col-md-6",children:(0,l.jsx)("button",{type:"submit",className:"btn sign-in-btn w-100",disabled:y,children:"Save Changes"})})]})]})]})}):(0,l.jsx)("div",{className:"profile-container",children:(0,l.jsx)("div",{className:"loading-spinner",children:"Loading profile..."})})}},505:(e,t,a)=>{"use strict";a.d(t,{A7:()=>h,DY:()=>u,E$:()=>f,J2:()=>d,Lx:()=>l,U0:()=>p,UT:()=>r,ec:()=>m,j:()=>n,lC:()=>i,r7:()=>v,vF:()=>c,vq:()=>s,xw:()=>g});const o=a(722).A.create({baseURL:"https://task-manager-sigma-ashen.vercel.app/api",headers:{"ngrok-skip-browser-warning":"true"}});o.interceptors.request.use((e=>{const t=localStorage.getItem("token");return t&&(e.headers.Authorization="Bearer ".concat(t)),e}),(e=>Promise.reject(e)));const n=()=>o.get("/tasks"),r=e=>o.post("/tasks",e),i=(e,t)=>o.put("/tasks/".concat(e),t),s=e=>o.delete("/tasks/".concat(e)),c=(e,t)=>o.put("/tasks/".concat(e,"/priority"),{priority:t}),l=(e,t)=>o.post("/auth/login",{email:e,password:t}),u=(e,t,a,n)=>o.post("/auth/register",{firstName:e,lastName:t,email:a,password:n}),h=(e,t)=>o.post("/auth/verify-registration",{email:e,verificationCode:t}),d=e=>o.post("/auth/resend-verification",{email:e}),p=e=>o.post("/auth/forgot-password",{email:e}),g=(e,t,a)=>o.post("/auth/verify-code",{email:e,verificationCode:t,newPassword:a}),m=(e,t)=>o.post("/auth/change-password",{currentPassword:e,newPassword:t}),f=async()=>{try{return(await o.get("/profile")).data}catch(e){throw console.error("Error fetching profile:",e),e}},v=async e=>{try{return(await o.put("/profile",e,{headers:{"Content-Type":"multipart/form-data"}})).data}catch(t){throw console.error("Error updating profile:",t),t}}},497:(e,t,a)=>{"use strict";var o=a(218);function n(){}function r(){}r.resetWarningCache=n,e.exports=function(){function e(e,t,a,n,r,i){if(i!==o){var s=new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");throw s.name="Invariant Violation",s}}function t(){return e}e.isRequired=e;var a={array:e,bigint:e,bool:e,func:e,number:e,object:e,string:e,symbol:e,any:e,arrayOf:t,element:e,elementType:e,instanceOf:t,node:e,objectOf:t,oneOf:t,oneOfType:t,shape:t,exact:t,checkPropTypes:r,resetWarningCache:n};return a.PropTypes=a,a}},173:(e,t,a)=>{e.exports=a(497)()},218:e=>{"use strict";e.exports="SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED"},872:function(e,t,a){e.exports=function(e,t){"use strict";function a(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var o=a(e),n=a(t);function r(e,t){for(var a=0;a<t.length;a++){var o=t[a];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function i(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function s(){return(s=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var a=arguments[t];for(var o in a)Object.prototype.hasOwnProperty.call(a,o)&&(e[o]=a[o])}return e}).apply(this,arguments)}function c(e,t){var a,o=Object.keys(e);return Object.getOwnPropertySymbols&&(a=Object.getOwnPropertySymbols(e),t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),o.push.apply(o,a)),o}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?c(Object(a),!0).forEach((function(t){i(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):c(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function u(e){return(u=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function h(e,t){return(h=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function d(e,t){if(null==e)return{};var a,o=function(e,t){if(null==e)return{};for(var a,o={},n=Object.keys(e),r=0;r<n.length;r++)a=n[r],0<=t.indexOf(a)||(o[a]=e[a]);return o}(e,t);if(Object.getOwnPropertySymbols)for(var n=Object.getOwnPropertySymbols(e),r=0;r<n.length;r++)a=n[r],0<=t.indexOf(a)||Object.prototype.propertyIsEnumerable.call(e,a)&&(o[a]=e[a]);return o}function p(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function g(t){var a=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(e){return!1}}();return function(){var e,o,n=u(t);return!(o=a?(e=u(this).constructor,Reflect.construct(n,arguments,e)):n.apply(this,arguments))||"object"!=typeof o&&"function"!=typeof o?p(this):o}}function m(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e)){var a=[],o=!0,n=!1,r=void 0;try{for(var i,s=e[Symbol.iterator]();!(o=(i=s.next()).done)&&(a.push(i.value),!t||a.length!==t);o=!0);}catch(e){n=!0,r=e}finally{try{o||null==s.return||s.return()}finally{if(n)throw r}}return a}}(e,t)||f(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function f(e,t){if(e){if("string"==typeof e)return v(e,t);var a=Object.prototype.toString.call(e).slice(8,-1);return"Object"===a&&e.constructor&&(a=e.constructor.name),"Map"===a||"Set"===a?Array.from(e):"Arguments"===a||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(a)?v(e,t):void 0}}function v(e,t){(null==t||t>e.length)&&(t=e.length);for(var a=0,o=new Array(t);a<t;a++)o[a]=e[a];return o}function y(e,t){return new Promise((function(a,o){var n,r=new Image;r.onload=function(){return a(r)},r.onerror=o,0==(null!==(n=e)&&!!n.match(/^\s*data:([a-z]+\/[a-z]+(;[a-z-]+=[a-z-]+)?)?(;base64)?,[a-z0-9!$&',()*+;=\-._~:@/?%\s]*\s*$/i))&&t&&(r.crossOrigin=t),r.src=e}))}var b,w=!("undefined"==typeof window||"undefined"==typeof navigator||!("ontouchstart"in window||0<navigator.msMaxTouchPoints)),x="undefined"!=typeof File,j={touch:{react:{down:"onTouchStart",mouseDown:"onMouseDown",drag:"onTouchMove",move:"onTouchMove",mouseMove:"onMouseMove",up:"onTouchEnd",mouseUp:"onMouseUp"},native:{down:"touchstart",mouseDown:"mousedown",drag:"touchmove",move:"touchmove",mouseMove:"mousemove",up:"touchend",mouseUp:"mouseup"}},desktop:{react:{down:"onMouseDown",drag:"onDragOver",move:"onMouseMove",up:"onMouseUp"},native:{down:"mousedown",drag:"dragStart",move:"mousemove",up:"mouseup"}}},C=w?j.touch:j.desktop,M="undefined"!=typeof window&&window.devicePixelRatio?window.devicePixelRatio:1,O={x:.5,y:.5},P=function(){!function(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&h(e,t)}(c,n.default.Component);var e,t,a,o=g(c);function c(e){var t;return function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,c),i(p(t=o.call(this,e)),"state",{drag:!1,my:null,mx:null,image:O}),i(p(t),"handleImageReady",(function(e){var a=t.getInitialSize(e.width,e.height);a.resource=e,a.x=.5,a.y=.5,a.backgroundColor=t.props.backgroundColor,t.setState({drag:!1,image:a},t.props.onImageReady),t.props.onLoadSuccess(a)})),i(p(t),"clearImage",(function(){t.canvas.getContext("2d").clearRect(0,0,t.canvas.width,t.canvas.height),t.setState({image:O})})),i(p(t),"handleMouseDown",(function(e){(e=e||window.event).preventDefault(),t.setState({drag:!0,mx:null,my:null})})),i(p(t),"handleMouseUp",(function(){t.state.drag&&(t.setState({drag:!1}),t.props.onMouseUp())})),i(p(t),"handleMouseMove",(function(e){var a,o,n,r,i,s,c,u,h,d,p,g,m,f,v,y;e=e||window.event,!1!==t.state.drag&&(e.preventDefault(),n={mx:a=e.targetTouches?e.targetTouches[0].pageX:e.clientX,my:o=e.targetTouches?e.targetTouches[0].pageY:e.clientY},y=t.props.rotate,y=(y%=360)<0?y+360:y,t.state.mx&&t.state.my&&(r=t.state.mx-a,i=t.state.my-o,s=t.state.image.width*t.props.scale,c=t.state.image.height*t.props.scale,h=(u=t.getCroppingRect()).x,d=u.y,h*=s,d*=c,p=function(e){return e*(Math.PI/180)},g=Math.cos(p(y)),f=d+-r*(m=Math.sin(p(y)))+i*g,v={x:(h+r*g+i*m)/s+1/t.props.scale*t.getXScale()/2,y:f/c+1/t.props.scale*t.getYScale()/2},t.props.onPositionChange(v),n.image=l(l({},t.state.image),v)),t.setState(n),t.props.onMouseMove(e))})),i(p(t),"setCanvas",(function(e){t.canvas=e})),t.canvas=null,t}return e=c,(t=[{key:"componentDidMount",value:function(){this.props.disableHiDPIScaling&&(M=1);var e,t,a=this.canvas.getContext("2d");this.props.image&&this.loadImage(this.props.image),this.paint(a),document&&(e=!!function(){var e=!1;try{var t=Object.defineProperty({},"passive",{get:function(){e=!0}});window.addEventListener("test",t,t),window.removeEventListener("test",t,t)}catch(t){e=!1}return e}()&&{passive:!1},t=C.native,document.addEventListener(t.move,this.handleMouseMove,e),document.addEventListener(t.up,this.handleMouseUp,e),w&&(document.addEventListener(t.mouseMove,this.handleMouseMove,e),document.addEventListener(t.mouseUp,this.handleMouseUp,e)))}},{key:"componentDidUpdate",value:function(e,t){this.props.image&&this.props.image!==e.image||this.props.width!==e.width||this.props.height!==e.height||this.props.backgroundColor!==e.backgroundColor?this.loadImage(this.props.image):this.props.image||t.image===O||this.clearImage();var a=this.canvas.getContext("2d");a.clearRect(0,0,this.canvas.width,this.canvas.height),this.paint(a),this.paintImage(a,this.state.image,this.props.border),e.image===this.props.image&&e.width===this.props.width&&e.height===this.props.height&&e.position===this.props.position&&e.scale===this.props.scale&&e.rotate===this.props.rotate&&t.my===this.state.my&&t.mx===this.state.mx&&t.image.x===this.state.image.x&&t.image.y===this.state.image.y&&t.backgroundColor===this.state.backgroundColor||this.props.onImageChange()}},{key:"componentWillUnmount",value:function(){var e;document&&(e=C.native,document.removeEventListener(e.move,this.handleMouseMove,!1),document.removeEventListener(e.up,this.handleMouseUp,!1),w&&(document.removeEventListener(e.mouseMove,this.handleMouseMove,!1),document.removeEventListener(e.mouseUp,this.handleMouseUp,!1)))}},{key:"isVertical",value:function(){return!this.props.disableCanvasRotation&&this.props.rotate%180!=0}},{key:"getBorders",value:function(e){var t=0<arguments.length&&void 0!==e?e:this.props.border;return Array.isArray(t)?t:[t,t]}},{key:"getDimensions",value:function(){var e=this.props,t=e.width,a=e.height,o=e.rotate,n=e.border,r={},i=m(this.getBorders(n),2),s=i[0],c=i[1],l=t,u=a;return this.isVertical()?(r.width=u,r.height=l):(r.width=l,r.height=u),r.width+=2*s,r.height+=2*c,{canvas:r,rotate:o,width:t,height:a,border:n}}},{key:"getImage",value:function(){var e=this.getCroppingRect(),t=this.state.image;e.x*=t.resource.width,e.y*=t.resource.height,e.width*=t.resource.width,e.height*=t.resource.height;var a=document.createElement("canvas");this.isVertical()?(a.width=e.height,a.height=e.width):(a.width=e.width,a.height=e.height);var o=a.getContext("2d");return o.translate(a.width/2,a.height/2),o.rotate(this.props.rotate*Math.PI/180),o.translate(-a.width/2,-a.height/2),this.isVertical()&&o.translate((a.width-a.height)/2,(a.height-a.width)/2),t.backgroundColor&&(o.fillStyle=t.backgroundColor,o.fillRect(-e.x,-e.y,t.resource.width,t.resource.height)),o.drawImage(t.resource,-e.x,-e.y),a}},{key:"getImageScaledToCanvas",value:function(){var e=this.getDimensions(),t=e.width,a=e.height,o=document.createElement("canvas");return this.isVertical()?(o.width=a,o.height=t):(o.width=t,o.height=a),this.paintImage(o.getContext("2d"),this.state.image,0,1),o}},{key:"getXScale",value:function(){var e=this.props.width/this.props.height,t=this.state.image.width/this.state.image.height;return Math.min(1,e/t)}},{key:"getYScale",value:function(){var e=this.props.height/this.props.width,t=this.state.image.height/this.state.image.width;return Math.min(1,e/t)}},{key:"getCroppingRect",value:function(){var e=this.props.position||{x:this.state.image.x,y:this.state.image.y},t=1/this.props.scale*this.getXScale(),a=1/this.props.scale*this.getYScale(),o={x:e.x-t/2,y:e.y-a/2,width:t,height:a},n=0,r=1-o.width,i=0,s=1-o.height;return(this.props.disableBoundaryChecks||1<t||1<a)&&(n=-o.width,i=-o.height,s=r=1),l(l({},o),{},{x:Math.max(n,Math.min(o.x,r)),y:Math.max(i,Math.min(o.y,s))})}},{key:"loadImage",value:function(e){var t;x&&e instanceof File?this.loadingImage=(t=e,new Promise((function(e,a){var o=new FileReader;o.onload=function(t){try{var o=y(t.target.result);e(o)}catch(t){a(t)}},o.readAsDataURL(t)})).then(this.handleImageReady).catch(this.props.onLoadFailure)):"string"==typeof e&&(this.loadingImage=y(e,this.props.crossOrigin).then(this.handleImageReady).catch(this.props.onLoadFailure))}},{key:"getInitialSize",value:function(e,t){var a,o,n=this.getDimensions();return t/e<n.height/n.width?o=e*((a=this.getDimensions().height)/t):a=t*((o=this.getDimensions().width)/e),{height:a,width:o}}},{key:"paintImage",value:function(e,t,a,o){var n,r=3<arguments.length&&void 0!==o?o:M;t.resource&&(n=this.calculatePosition(t,a),e.save(),e.translate(e.canvas.width/2,e.canvas.height/2),e.rotate(this.props.rotate*Math.PI/180),e.translate(-e.canvas.width/2,-e.canvas.height/2),this.isVertical()&&e.translate((e.canvas.width-e.canvas.height)/2,(e.canvas.height-e.canvas.width)/2),e.scale(r,r),e.globalCompositeOperation="destination-over",e.drawImage(t.resource,n.x,n.y,n.width,n.height),t.backgroundColor&&(e.fillStyle=t.backgroundColor,e.fillRect(n.x,n.y,n.width,n.height)),e.restore())}},{key:"calculatePosition",value:function(e,t){e=e||this.state.image;var a=m(this.getBorders(t),2),o=a[0],n=a[1],r=this.getCroppingRect(),i=e.width*this.props.scale,s=e.height*this.props.scale,c=-r.x*i,l=-r.y*s;return this.isVertical()?(c+=n,l+=o):(c+=o,l+=n),{x:c,y:l,height:s,width:i}}},{key:"paint",value:function(e){e.save(),e.scale(M,M),e.translate(0,0),e.fillStyle="rgba("+this.props.color.slice(0,4).join(",")+")";var t,a,o,n,r,i,s,c,l=this.props.borderRadius,u=this.getDimensions(),h=m(this.getBorders(u.border),2),d=h[0],p=h[1],g=u.canvas.height,f=u.canvas.width;l=Math.max(l,0),l=Math.min(l,f/2-d,g/2-p),e.beginPath(),t=e,n=f-2*(a=d),r=g-2*(o=p),0===(i=l)?t.rect(a,o,n,r):(s=n-i,c=r-i,t.translate(a,o),t.arc(i,i,i,Math.PI,1.5*Math.PI),t.lineTo(s,0),t.arc(s,i,i,1.5*Math.PI,2*Math.PI),t.lineTo(n,c),t.arc(s,c,i,2*Math.PI,.5*Math.PI),t.lineTo(i,r),t.arc(i,c,i,.5*Math.PI,Math.PI),t.translate(-a,-o)),e.rect(f,0,-f,g),e.fill("evenodd"),e.restore()}},{key:"render",value:function(){var e=this.props,t=(e.scale,e.rotate,e.image,e.border,e.borderRadius,e.width,e.height,e.position,e.color,e.backgroundColor,e.style),a=(e.crossOrigin,e.onLoadFailure,e.onLoadSuccess,e.onImageReady,e.onImageChange,e.onMouseUp,e.onMouseMove,e.onPositionChange,e.disableBoundaryChecks,e.disableHiDPIScaling,e.disableCanvasRotation,d(e,["scale","rotate","image","border","borderRadius","width","height","position","color","backgroundColor","style","crossOrigin","onLoadFailure","onLoadSuccess","onImageReady","onImageChange","onMouseUp","onMouseMove","onPositionChange","disableBoundaryChecks","disableHiDPIScaling","disableCanvasRotation"])),o=this.getDimensions(),r={width:o.canvas.width,height:o.canvas.height,cursor:this.state.drag?"grabbing":"grab",touchAction:"none"},i={width:o.canvas.width*M,height:o.canvas.height*M,style:l(l({},r),t)};return i[C.react.down]=this.handleMouseDown,w&&(i[C.react.mouseDown]=this.handleMouseDown),n.default.createElement("canvas",s({ref:this.setCanvas},i,a))}}])&&r(e.prototype,t),a&&r(e,a),c}();return i(P,"propTypes",{scale:o.default.number,rotate:o.default.number,image:o.default.oneOfType([o.default.string].concat(function(e){if(Array.isArray(e))return v(e)}(b=x?[o.default.instanceOf(File)]:[])||function(e){if("undefined"!=typeof Symbol&&Symbol.iterator in Object(e))return Array.from(e)}(b)||f(b)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}())),border:o.default.oneOfType([o.default.number,o.default.arrayOf(o.default.number)]),borderRadius:o.default.number,width:o.default.number,height:o.default.number,position:o.default.shape({x:o.default.number,y:o.default.number}),color:o.default.arrayOf(o.default.number),backgroundColor:o.default.string,crossOrigin:o.default.oneOf(["","anonymous","use-credentials"]),onLoadFailure:o.default.func,onLoadSuccess:o.default.func,onImageReady:o.default.func,onImageChange:o.default.func,onMouseUp:o.default.func,onMouseMove:o.default.func,onPositionChange:o.default.func,disableBoundaryChecks:o.default.bool,disableHiDPIScaling:o.default.bool,disableCanvasRotation:o.default.bool}),i(P,"defaultProps",{scale:1,rotate:0,border:25,borderRadius:0,width:200,height:200,color:[0,0,0,.5],onLoadFailure:function(){},onLoadSuccess:function(){},onImageReady:function(){},onImageChange:function(){},onMouseUp:function(){},onMouseMove:function(){},onPositionChange:function(){},disableBoundaryChecks:!1,disableHiDPIScaling:!1,disableCanvasRotation:!0}),P}(a(173),a(43))},347:()=>{}}]);
//# sourceMappingURL=188.aa8f7b19.chunk.js.map