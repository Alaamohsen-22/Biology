export function Materials({prefix}:{prefix:string}) {
 const ramps:Record<string,string[]>={water:["#c3e7e5","#80b9c8","#4c92a9"],metal:["#f4f3e9","#8c9d98","#d4ded6","#6e817b"],soil:["#a88559","#775333","#4d3929"],bread:["#fff0c6","#e4c993","#cda565"],crust:["#e4bc79","#aa733f","#774925"],skin:["#eccab1","#d5a18e","#aa7067"],lung:["#e9bab0","#c98078","#ae6462"],nucleus:["#d9d8ed","#999eb8","#657b95"],wood:["#d9c49c","#b29b6e","#8f7854"]};
 return <>{Object.entries(ramps).map(([name,colors])=><linearGradient key={name} id={`${prefix}-${name}`} x1="0" x2="1" y1="0" y2="1">{colors.map((c,i)=><stop key={i} offset={i/(colors.length-1)} stopColor={c}/>)}</linearGradient>)}
 <radialGradient id={`${prefix}-molecule-gold`} cx=".3" cy=".25"><stop stopColor="#fff2ba"/><stop offset=".55" stopColor="#d6b975"/><stop offset="1" stopColor="#9b763e"/></radialGradient>
 <radialGradient id={`${prefix}-molecule-green`} cx=".3" cy=".25"><stop stopColor="#d5eddb"/><stop offset=".55" stopColor="#87af9a"/><stop offset="1" stopColor="#4e7966"/></radialGradient>
 <radialGradient id={`${prefix}-light`} cx=".35" cy=".18" r=".95"><stop stopColor="#fffef8"/><stop offset="1" stopColor="#e7ece2"/></radialGradient>
 <filter id={`${prefix}-depth`} x="-15%" y="-15%" width="130%" height="135%"><feDropShadow dx="1" dy="3" stdDeviation="2" floodColor="#344c3e" floodOpacity=".12"/></filter>
 <pattern id={`${prefix}-pores`} width="23" height="19" patternUnits="userSpaceOnUse"><circle cx="5" cy="8" r="2.3" fill="#b88b51" opacity=".27"/><ellipse cx="16" cy="15" rx="3.2" ry="1.8" fill="#fff6d8" opacity=".7"/></pattern>
 </>;
}
