"use strict";(self.webpackChunktask_manager_frontend=self.webpackChunktask_manager_frontend||[]).push([[731],{421:()=>{},535:(t,e,n)=>{n.d(e,{GP:()=>nt});const r={lessThanXSeconds:{one:"less than a second",other:"less than {{count}} seconds"},xSeconds:{one:"1 second",other:"{{count}} seconds"},halfAMinute:"half a minute",lessThanXMinutes:{one:"less than a minute",other:"less than {{count}} minutes"},xMinutes:{one:"1 minute",other:"{{count}} minutes"},aboutXHours:{one:"about 1 hour",other:"about {{count}} hours"},xHours:{one:"1 hour",other:"{{count}} hours"},xDays:{one:"1 day",other:"{{count}} days"},aboutXWeeks:{one:"about 1 week",other:"about {{count}} weeks"},xWeeks:{one:"1 week",other:"{{count}} weeks"},aboutXMonths:{one:"about 1 month",other:"about {{count}} months"},xMonths:{one:"1 month",other:"{{count}} months"},aboutXYears:{one:"about 1 year",other:"about {{count}} years"},xYears:{one:"1 year",other:"{{count}} years"},overXYears:{one:"over 1 year",other:"over {{count}} years"},almostXYears:{one:"almost 1 year",other:"almost {{count}} years"}};function a(t){return function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};const n=e.width?String(e.width):t.defaultWidth;return t.formats[n]||t.formats[t.defaultWidth]}}const o={date:a({formats:{full:"EEEE, MMMM do, y",long:"MMMM do, y",medium:"MMM d, y",short:"MM/dd/yyyy"},defaultWidth:"full"}),time:a({formats:{full:"h:mm:ss a zzzz",long:"h:mm:ss a z",medium:"h:mm:ss a",short:"h:mm a"},defaultWidth:"full"}),dateTime:a({formats:{full:"{{date}} 'at' {{time}}",long:"{{date}} 'at' {{time}}",medium:"{{date}}, {{time}}",short:"{{date}}, {{time}}"},defaultWidth:"full"})},i={lastWeek:"'last' eeee 'at' p",yesterday:"'yesterday at' p",today:"'today at' p",tomorrow:"'tomorrow at' p",nextWeek:"eeee 'at' p",other:"P"};function u(t){return(e,n)=>{let r;if("formatting"===(null!==n&&void 0!==n&&n.context?String(n.context):"standalone")&&t.formattingValues){const e=t.defaultFormattingWidth||t.defaultWidth,a=null!==n&&void 0!==n&&n.width?String(n.width):e;r=t.formattingValues[a]||t.formattingValues[e]}else{const e=t.defaultWidth,a=null!==n&&void 0!==n&&n.width?String(n.width):t.defaultWidth;r=t.values[a]||t.values[e]}return r[t.argumentCallback?t.argumentCallback(e):e]}}function s(t){return function(e){let n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};const r=n.width,a=r&&t.matchPatterns[r]||t.matchPatterns[t.defaultMatchWidth],o=e.match(a);if(!o)return null;const i=o[0],u=r&&t.parsePatterns[r]||t.parsePatterns[t.defaultParseWidth],s=Array.isArray(u)?function(t,e){for(let n=0;n<t.length;n++)if(e(t[n]))return n;return}(u,(t=>t.test(i))):function(t,e){for(const n in t)if(Object.prototype.hasOwnProperty.call(t,n)&&e(t[n]))return n;return}(u,(t=>t.test(i)));let d;d=t.valueCallback?t.valueCallback(s):s,d=n.valueCallback?n.valueCallback(d):d;return{value:d,rest:e.slice(i.length)}}}var d;const l={code:"en-US",formatDistance:(t,e,n)=>{let a;const o=r[t];return a="string"===typeof o?o:1===e?o.one:o.other.replace("{{count}}",e.toString()),null!==n&&void 0!==n&&n.addSuffix?n.comparison&&n.comparison>0?"in "+a:a+" ago":a},formatLong:o,formatRelative:(t,e,n,r)=>i[t],localize:{ordinalNumber:(t,e)=>{const n=Number(t),r=n%100;if(r>20||r<10)switch(r%10){case 1:return n+"st";case 2:return n+"nd";case 3:return n+"rd"}return n+"th"},era:u({values:{narrow:["B","A"],abbreviated:["BC","AD"],wide:["Before Christ","Anno Domini"]},defaultWidth:"wide"}),quarter:u({values:{narrow:["1","2","3","4"],abbreviated:["Q1","Q2","Q3","Q4"],wide:["1st quarter","2nd quarter","3rd quarter","4th quarter"]},defaultWidth:"wide",argumentCallback:t=>t-1}),month:u({values:{narrow:["J","F","M","A","M","J","J","A","S","O","N","D"],abbreviated:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],wide:["January","February","March","April","May","June","July","August","September","October","November","December"]},defaultWidth:"wide"}),day:u({values:{narrow:["S","M","T","W","T","F","S"],short:["Su","Mo","Tu","We","Th","Fr","Sa"],abbreviated:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],wide:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]},defaultWidth:"wide"}),dayPeriod:u({values:{narrow:{am:"a",pm:"p",midnight:"mi",noon:"n",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"},abbreviated:{am:"AM",pm:"PM",midnight:"midnight",noon:"noon",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"},wide:{am:"a.m.",pm:"p.m.",midnight:"midnight",noon:"noon",morning:"morning",afternoon:"afternoon",evening:"evening",night:"night"}},defaultWidth:"wide",formattingValues:{narrow:{am:"a",pm:"p",midnight:"mi",noon:"n",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"},abbreviated:{am:"AM",pm:"PM",midnight:"midnight",noon:"noon",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"},wide:{am:"a.m.",pm:"p.m.",midnight:"midnight",noon:"noon",morning:"in the morning",afternoon:"in the afternoon",evening:"in the evening",night:"at night"}},defaultFormattingWidth:"wide"})},match:{ordinalNumber:(d={matchPattern:/^(\d+)(th|st|nd|rd)?/i,parsePattern:/\d+/i,valueCallback:t=>parseInt(t,10)},function(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};const n=t.match(d.matchPattern);if(!n)return null;const r=n[0],a=t.match(d.parsePattern);if(!a)return null;let o=d.valueCallback?d.valueCallback(a[0]):a[0];return o=e.valueCallback?e.valueCallback(o):o,{value:o,rest:t.slice(r.length)}}),era:s({matchPatterns:{narrow:/^(b|a)/i,abbreviated:/^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,wide:/^(before christ|before common era|anno domini|common era)/i},defaultMatchWidth:"wide",parsePatterns:{any:[/^b/i,/^(a|c)/i]},defaultParseWidth:"any"}),quarter:s({matchPatterns:{narrow:/^[1234]/i,abbreviated:/^q[1234]/i,wide:/^[1234](th|st|nd|rd)? quarter/i},defaultMatchWidth:"wide",parsePatterns:{any:[/1/i,/2/i,/3/i,/4/i]},defaultParseWidth:"any",valueCallback:t=>t+1}),month:s({matchPatterns:{narrow:/^[jfmasond]/i,abbreviated:/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,wide:/^(january|february|march|april|may|june|july|august|september|october|november|december)/i},defaultMatchWidth:"wide",parsePatterns:{narrow:[/^j/i,/^f/i,/^m/i,/^a/i,/^m/i,/^j/i,/^j/i,/^a/i,/^s/i,/^o/i,/^n/i,/^d/i],any:[/^ja/i,/^f/i,/^mar/i,/^ap/i,/^may/i,/^jun/i,/^jul/i,/^au/i,/^s/i,/^o/i,/^n/i,/^d/i]},defaultParseWidth:"any"}),day:s({matchPatterns:{narrow:/^[smtwf]/i,short:/^(su|mo|tu|we|th|fr|sa)/i,abbreviated:/^(sun|mon|tue|wed|thu|fri|sat)/i,wide:/^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i},defaultMatchWidth:"wide",parsePatterns:{narrow:[/^s/i,/^m/i,/^t/i,/^w/i,/^t/i,/^f/i,/^s/i],any:[/^su/i,/^m/i,/^tu/i,/^w/i,/^th/i,/^f/i,/^sa/i]},defaultParseWidth:"any"}),dayPeriod:s({matchPatterns:{narrow:/^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,any:/^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i},defaultMatchWidth:"any",parsePatterns:{any:{am:/^a/i,pm:/^p/i,midnight:/^mi/i,noon:/^no/i,morning:/morning/i,afternoon:/afternoon/i,evening:/evening/i,night:/night/i}},defaultParseWidth:"any"})},options:{weekStartsOn:0,firstWeekContainsDate:1}};let c={};function h(){return c}Math.pow(10,8);const f=6048e5,m=Symbol.for("constructDateFrom");function g(t,e){return"function"===typeof t?t(e):t&&"object"===typeof t&&m in t?t[m](e):t instanceof Date?new t.constructor(e):new Date(e)}function v(t,e){return g(e||t,t)}function w(t){const e=v(t),n=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate(),e.getHours(),e.getMinutes(),e.getSeconds(),e.getMilliseconds()));return n.setUTCFullYear(e.getFullYear()),+t-+n}function b(t,e){const n=v(t,null===e||void 0===e?void 0:e.in);return n.setHours(0,0,0,0),n}function y(t,e,n){const[r,a]=function(t){for(var e=arguments.length,n=new Array(e>1?e-1:0),r=1;r<e;r++)n[r-1]=arguments[r];const a=g.bind(null,t||n.find((t=>"object"===typeof t)));return n.map(a)}(null===n||void 0===n?void 0:n.in,t,e),o=b(r),i=b(a),u=+o-w(o),s=+i-w(i);return Math.round((u-s)/864e5)}function p(t,e){const n=v(t,null===e||void 0===e?void 0:e.in);return n.setFullYear(n.getFullYear(),0,1),n.setHours(0,0,0,0),n}function M(t,e){const n=v(t,null===e||void 0===e?void 0:e.in);return y(n,p(n))+1}var k=n(555);function P(t,e){var n,r,a,o,i,u;const s=h(),d=null!==(n=null!==(r=null!==(a=null!==(o=null===e||void 0===e?void 0:e.weekStartsOn)&&void 0!==o?o:null===e||void 0===e||null===(i=e.locale)||void 0===i||null===(i=i.options)||void 0===i?void 0:i.weekStartsOn)&&void 0!==a?a:s.weekStartsOn)&&void 0!==r?r:null===(u=s.locale)||void 0===u||null===(u=u.options)||void 0===u?void 0:u.weekStartsOn)&&void 0!==n?n:0,l=v(t,null===e||void 0===e?void 0:e.in),c=l.getDay(),f=(c<d?7:0)+c-d;return l.setDate(l.getDate()-f),l.setHours(0,0,0,0),l}function x(t,e){return P(t,(0,k.A)((0,k.A)({},e),{},{weekStartsOn:1}))}function S(t,e){const n=v(t,null===e||void 0===e?void 0:e.in),r=n.getFullYear(),a=g(n,0);a.setFullYear(r+1,0,4),a.setHours(0,0,0,0);const o=x(a),i=g(n,0);i.setFullYear(r,0,4),i.setHours(0,0,0,0);const u=x(i);return n.getTime()>=o.getTime()?r+1:n.getTime()>=u.getTime()?r:r-1}function W(t,e){const n=S(t,e),r=g((null===e||void 0===e?void 0:e.in)||t,0);return r.setFullYear(n,0,4),r.setHours(0,0,0,0),x(r)}function D(t,e){const n=v(t,null===e||void 0===e?void 0:e.in),r=+x(n)-+W(n);return Math.round(r/f)+1}function T(t,e){var n,r,a,o,i,u;const s=v(t,null===e||void 0===e?void 0:e.in),d=s.getFullYear(),l=h(),c=null!==(n=null!==(r=null!==(a=null!==(o=null===e||void 0===e?void 0:e.firstWeekContainsDate)&&void 0!==o?o:null===e||void 0===e||null===(i=e.locale)||void 0===i||null===(i=i.options)||void 0===i?void 0:i.firstWeekContainsDate)&&void 0!==a?a:l.firstWeekContainsDate)&&void 0!==r?r:null===(u=l.locale)||void 0===u||null===(u=u.options)||void 0===u?void 0:u.firstWeekContainsDate)&&void 0!==n?n:1,f=g((null===e||void 0===e?void 0:e.in)||t,0);f.setFullYear(d+1,0,c),f.setHours(0,0,0,0);const m=P(f,e),w=g((null===e||void 0===e?void 0:e.in)||t,0);w.setFullYear(d,0,c),w.setHours(0,0,0,0);const b=P(w,e);return+s>=+m?d+1:+s>=+b?d:d-1}function C(t,e){var n,r,a,o,i,u;const s=h(),d=null!==(n=null!==(r=null!==(a=null!==(o=null===e||void 0===e?void 0:e.firstWeekContainsDate)&&void 0!==o?o:null===e||void 0===e||null===(i=e.locale)||void 0===i||null===(i=i.options)||void 0===i?void 0:i.firstWeekContainsDate)&&void 0!==a?a:s.firstWeekContainsDate)&&void 0!==r?r:null===(u=s.locale)||void 0===u||null===(u=u.options)||void 0===u?void 0:u.firstWeekContainsDate)&&void 0!==n?n:1,l=T(t,e),c=g((null===e||void 0===e?void 0:e.in)||t,0);c.setFullYear(l,0,d),c.setHours(0,0,0,0);return P(c,e)}function Y(t,e){const n=v(t,null===e||void 0===e?void 0:e.in),r=+P(n,e)-+C(n,e);return Math.round(r/f)+1}function O(t,e){return(t<0?"-":"")+Math.abs(t).toString().padStart(e,"0")}const q={y(t,e){const n=t.getFullYear(),r=n>0?n:1-n;return O("yy"===e?r%100:r,e.length)},M(t,e){const n=t.getMonth();return"M"===e?String(n+1):O(n+1,2)},d:(t,e)=>O(t.getDate(),e.length),a(t,e){const n=t.getHours()/12>=1?"pm":"am";switch(e){case"a":case"aa":return n.toUpperCase();case"aaa":return n;case"aaaaa":return n[0];default:return"am"===n?"a.m.":"p.m."}},h:(t,e)=>O(t.getHours()%12||12,e.length),H:(t,e)=>O(t.getHours(),e.length),m:(t,e)=>O(t.getMinutes(),e.length),s:(t,e)=>O(t.getSeconds(),e.length),S(t,e){const n=e.length,r=t.getMilliseconds();return O(Math.trunc(r*Math.pow(10,n-3)),e.length)}},F="midnight",H="noon",N="morning",E="afternoon",j="evening",z="night",A={G:function(t,e,n){const r=t.getFullYear()>0?1:0;switch(e){case"G":case"GG":case"GGG":return n.era(r,{width:"abbreviated"});case"GGGGG":return n.era(r,{width:"narrow"});default:return n.era(r,{width:"wide"})}},y:function(t,e,n){if("yo"===e){const e=t.getFullYear(),r=e>0?e:1-e;return n.ordinalNumber(r,{unit:"year"})}return q.y(t,e)},Y:function(t,e,n,r){const a=T(t,r),o=a>0?a:1-a;if("YY"===e){return O(o%100,2)}return"Yo"===e?n.ordinalNumber(o,{unit:"year"}):O(o,e.length)},R:function(t,e){return O(S(t),e.length)},u:function(t,e){return O(t.getFullYear(),e.length)},Q:function(t,e,n){const r=Math.ceil((t.getMonth()+1)/3);switch(e){case"Q":return String(r);case"QQ":return O(r,2);case"Qo":return n.ordinalNumber(r,{unit:"quarter"});case"QQQ":return n.quarter(r,{width:"abbreviated",context:"formatting"});case"QQQQQ":return n.quarter(r,{width:"narrow",context:"formatting"});default:return n.quarter(r,{width:"wide",context:"formatting"})}},q:function(t,e,n){const r=Math.ceil((t.getMonth()+1)/3);switch(e){case"q":return String(r);case"qq":return O(r,2);case"qo":return n.ordinalNumber(r,{unit:"quarter"});case"qqq":return n.quarter(r,{width:"abbreviated",context:"standalone"});case"qqqqq":return n.quarter(r,{width:"narrow",context:"standalone"});default:return n.quarter(r,{width:"wide",context:"standalone"})}},M:function(t,e,n){const r=t.getMonth();switch(e){case"M":case"MM":return q.M(t,e);case"Mo":return n.ordinalNumber(r+1,{unit:"month"});case"MMM":return n.month(r,{width:"abbreviated",context:"formatting"});case"MMMMM":return n.month(r,{width:"narrow",context:"formatting"});default:return n.month(r,{width:"wide",context:"formatting"})}},L:function(t,e,n){const r=t.getMonth();switch(e){case"L":return String(r+1);case"LL":return O(r+1,2);case"Lo":return n.ordinalNumber(r+1,{unit:"month"});case"LLL":return n.month(r,{width:"abbreviated",context:"standalone"});case"LLLLL":return n.month(r,{width:"narrow",context:"standalone"});default:return n.month(r,{width:"wide",context:"standalone"})}},w:function(t,e,n,r){const a=Y(t,r);return"wo"===e?n.ordinalNumber(a,{unit:"week"}):O(a,e.length)},I:function(t,e,n){const r=D(t);return"Io"===e?n.ordinalNumber(r,{unit:"week"}):O(r,e.length)},d:function(t,e,n){return"do"===e?n.ordinalNumber(t.getDate(),{unit:"date"}):q.d(t,e)},D:function(t,e,n){const r=M(t);return"Do"===e?n.ordinalNumber(r,{unit:"dayOfYear"}):O(r,e.length)},E:function(t,e,n){const r=t.getDay();switch(e){case"E":case"EE":case"EEE":return n.day(r,{width:"abbreviated",context:"formatting"});case"EEEEE":return n.day(r,{width:"narrow",context:"formatting"});case"EEEEEE":return n.day(r,{width:"short",context:"formatting"});default:return n.day(r,{width:"wide",context:"formatting"})}},e:function(t,e,n,r){const a=t.getDay(),o=(a-r.weekStartsOn+8)%7||7;switch(e){case"e":return String(o);case"ee":return O(o,2);case"eo":return n.ordinalNumber(o,{unit:"day"});case"eee":return n.day(a,{width:"abbreviated",context:"formatting"});case"eeeee":return n.day(a,{width:"narrow",context:"formatting"});case"eeeeee":return n.day(a,{width:"short",context:"formatting"});default:return n.day(a,{width:"wide",context:"formatting"})}},c:function(t,e,n,r){const a=t.getDay(),o=(a-r.weekStartsOn+8)%7||7;switch(e){case"c":return String(o);case"cc":return O(o,e.length);case"co":return n.ordinalNumber(o,{unit:"day"});case"ccc":return n.day(a,{width:"abbreviated",context:"standalone"});case"ccccc":return n.day(a,{width:"narrow",context:"standalone"});case"cccccc":return n.day(a,{width:"short",context:"standalone"});default:return n.day(a,{width:"wide",context:"standalone"})}},i:function(t,e,n){const r=t.getDay(),a=0===r?7:r;switch(e){case"i":return String(a);case"ii":return O(a,e.length);case"io":return n.ordinalNumber(a,{unit:"day"});case"iii":return n.day(r,{width:"abbreviated",context:"formatting"});case"iiiii":return n.day(r,{width:"narrow",context:"formatting"});case"iiiiii":return n.day(r,{width:"short",context:"formatting"});default:return n.day(r,{width:"wide",context:"formatting"})}},a:function(t,e,n){const r=t.getHours()/12>=1?"pm":"am";switch(e){case"a":case"aa":return n.dayPeriod(r,{width:"abbreviated",context:"formatting"});case"aaa":return n.dayPeriod(r,{width:"abbreviated",context:"formatting"}).toLowerCase();case"aaaaa":return n.dayPeriod(r,{width:"narrow",context:"formatting"});default:return n.dayPeriod(r,{width:"wide",context:"formatting"})}},b:function(t,e,n){const r=t.getHours();let a;switch(a=12===r?H:0===r?F:r/12>=1?"pm":"am",e){case"b":case"bb":return n.dayPeriod(a,{width:"abbreviated",context:"formatting"});case"bbb":return n.dayPeriod(a,{width:"abbreviated",context:"formatting"}).toLowerCase();case"bbbbb":return n.dayPeriod(a,{width:"narrow",context:"formatting"});default:return n.dayPeriod(a,{width:"wide",context:"formatting"})}},B:function(t,e,n){const r=t.getHours();let a;switch(a=r>=17?j:r>=12?E:r>=4?N:z,e){case"B":case"BB":case"BBB":return n.dayPeriod(a,{width:"abbreviated",context:"formatting"});case"BBBBB":return n.dayPeriod(a,{width:"narrow",context:"formatting"});default:return n.dayPeriod(a,{width:"wide",context:"formatting"})}},h:function(t,e,n){if("ho"===e){let e=t.getHours()%12;return 0===e&&(e=12),n.ordinalNumber(e,{unit:"hour"})}return q.h(t,e)},H:function(t,e,n){return"Ho"===e?n.ordinalNumber(t.getHours(),{unit:"hour"}):q.H(t,e)},K:function(t,e,n){const r=t.getHours()%12;return"Ko"===e?n.ordinalNumber(r,{unit:"hour"}):O(r,e.length)},k:function(t,e,n){let r=t.getHours();return 0===r&&(r=24),"ko"===e?n.ordinalNumber(r,{unit:"hour"}):O(r,e.length)},m:function(t,e,n){return"mo"===e?n.ordinalNumber(t.getMinutes(),{unit:"minute"}):q.m(t,e)},s:function(t,e,n){return"so"===e?n.ordinalNumber(t.getSeconds(),{unit:"second"}):q.s(t,e)},S:function(t,e){return q.S(t,e)},X:function(t,e,n){const r=t.getTimezoneOffset();if(0===r)return"Z";switch(e){case"X":return Q(r);case"XXXX":case"XX":return G(r);default:return G(r,":")}},x:function(t,e,n){const r=t.getTimezoneOffset();switch(e){case"x":return Q(r);case"xxxx":case"xx":return G(r);default:return G(r,":")}},O:function(t,e,n){const r=t.getTimezoneOffset();switch(e){case"O":case"OO":case"OOO":return"GMT"+L(r,":");default:return"GMT"+G(r,":")}},z:function(t,e,n){const r=t.getTimezoneOffset();switch(e){case"z":case"zz":case"zzz":return"GMT"+L(r,":");default:return"GMT"+G(r,":")}},t:function(t,e,n){return O(Math.trunc(+t/1e3),e.length)},T:function(t,e,n){return O(+t,e.length)}};function L(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";const n=t>0?"-":"+",r=Math.abs(t),a=Math.trunc(r/60),o=r%60;return 0===o?n+String(a):n+String(a)+e+O(o,2)}function Q(t,e){if(t%60===0){return(t>0?"-":"+")+O(Math.abs(t)/60,2)}return G(t,e)}function G(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"";const n=t>0?"-":"+",r=Math.abs(t);return n+O(Math.trunc(r/60),2)+e+O(r%60,2)}const X=(t,e)=>{switch(t){case"P":return e.date({width:"short"});case"PP":return e.date({width:"medium"});case"PPP":return e.date({width:"long"});default:return e.date({width:"full"})}},B=(t,e)=>{switch(t){case"p":return e.time({width:"short"});case"pp":return e.time({width:"medium"});case"ppp":return e.time({width:"long"});default:return e.time({width:"full"})}},J={p:B,P:(t,e)=>{const n=t.match(/(P+)(p+)?/)||[],r=n[1],a=n[2];if(!a)return X(t,e);let o;switch(r){case"P":o=e.dateTime({width:"short"});break;case"PP":o=e.dateTime({width:"medium"});break;case"PPP":o=e.dateTime({width:"long"});break;default:o=e.dateTime({width:"full"})}return o.replace("{{date}}",X(r,e)).replace("{{time}}",B(a,e))}},I=/^D+$/,R=/^Y+$/,U=["D","DD","YY","YYYY"];function $(t){return t instanceof Date||"object"===typeof t&&"[object Date]"===Object.prototype.toString.call(t)}function V(t){return!(!$(t)&&"number"!==typeof t||isNaN(+v(t)))}const _=/[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g,K=/P+p+|P+|p+|''|'(''|[^'])+('|$)|./g,Z=/^'([^]*?)'?$/,tt=/''/g,et=/[a-zA-Z]/;function nt(t,e,n){var r,a,o,i,u,s,d,c,f,m,g,w,b,y;const p=h(),M=null!==(r=null!==(a=null===n||void 0===n?void 0:n.locale)&&void 0!==a?a:p.locale)&&void 0!==r?r:l,k=null!==(o=null!==(i=null!==(u=null!==(s=null===n||void 0===n?void 0:n.firstWeekContainsDate)&&void 0!==s?s:null===n||void 0===n||null===(d=n.locale)||void 0===d||null===(d=d.options)||void 0===d?void 0:d.firstWeekContainsDate)&&void 0!==u?u:p.firstWeekContainsDate)&&void 0!==i?i:null===(c=p.locale)||void 0===c||null===(c=c.options)||void 0===c?void 0:c.firstWeekContainsDate)&&void 0!==o?o:1,P=null!==(f=null!==(m=null!==(g=null!==(w=null===n||void 0===n?void 0:n.weekStartsOn)&&void 0!==w?w:null===n||void 0===n||null===(b=n.locale)||void 0===b||null===(b=b.options)||void 0===b?void 0:b.weekStartsOn)&&void 0!==g?g:p.weekStartsOn)&&void 0!==m?m:null===(y=p.locale)||void 0===y||null===(y=y.options)||void 0===y?void 0:y.weekStartsOn)&&void 0!==f?f:0,x=v(t,null===n||void 0===n?void 0:n.in);if(!V(x))throw new RangeError("Invalid time value");let S=e.match(K).map((t=>{const e=t[0];if("p"===e||"P"===e){return(0,J[e])(t,M.formatLong)}return t})).join("").match(_).map((t=>{if("''"===t)return{isToken:!1,value:"'"};const e=t[0];if("'"===e)return{isToken:!1,value:rt(t)};if(A[e])return{isToken:!0,value:t};if(e.match(et))throw new RangeError("Format string contains an unescaped latin alphabet character `"+e+"`");return{isToken:!1,value:t}}));M.localize.preprocessor&&(S=M.localize.preprocessor(x,S));const W={firstWeekContainsDate:k,weekStartsOn:P,locale:M};return S.map((r=>{if(!r.isToken)return r.value;const a=r.value;(null!==n&&void 0!==n&&n.useAdditionalWeekYearTokens||!function(t){return R.test(t)}(a))&&(null!==n&&void 0!==n&&n.useAdditionalDayOfYearTokens||!function(t){return I.test(t)}(a))||function(t,e,n){const r=function(t,e,n){const r="Y"===t[0]?"years":"days of the month";return"Use `".concat(t.toLowerCase(),"` instead of `").concat(t,"` (in `").concat(e,"`) for formatting ").concat(r," to the input `").concat(n,"`; see: https://github.com/date-fns/date-fns/blob/master/docs/unicodeTokens.md")}(t,e,n);if(console.warn(r),U.includes(t))throw new RangeError(r)}(a,e,String(t));return(0,A[a[0]])(x,a,M.localize,W)})).join("")}function rt(t){const e=t.match(Z);return e?e[1].replace(tt,"'"):t}}}]);
//# sourceMappingURL=731.c90c82e8.chunk.js.map