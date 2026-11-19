export function bookPageNumber(page:string,lesson:number,stage:number,diagnostic:number){
 if(page==='cover')return 0;
 if(page==='lesson'){
  if(lesson===1)return stage===0?2:stage===1?3+diagnostic:7+stage;
  return 17+(lesson-2)*10+stage;
 }
 return ({name:1,map:1,project:77,final:78,dashboard:79,guide:80,teacher:81,certificate:82} as Record<string,number>)[page]??1;
}
