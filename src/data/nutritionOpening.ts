export type DiagnosticQuestion = {
 id:string;
 text:string;
 options:{id:string;text:string}[];
 correctId:string;
};
export const nutritionDiagnostic:DiagnosticQuestion[]=[
 {id:"nutrition-start-1",text:"ماذا يحتاج الإنسان ليعيش وينمو؟",options:[{id:"food",text:"الغذاء."},{id:"toys",text:"الألعاب."},{id:"clothes",text:"الملابس."}],correctId:"food"},
 {id:"nutrition-start-2",text:"أيّ مما يأتي كائن حي؟",options:[{id:"olive",text:"شجرة الزيتون."},{id:"rock",text:"الصخرة."},{id:"chair",text:"الكرسي."}],correctId:"olive"},
 {id:"nutrition-start-3",text:"ماذا يحدث للنبات إذا لم يحصل على الماء مدة طويلة؟",options:[{id:"wilt",text:"يذبل."},{id:"faster",text:"ينمو أسرع."},{id:"flower",text:"يزهر أكثر."}],correctId:"wilt"},
 {id:"nutrition-start-4",text:"لماذا يحتاج الإنسان إلى تناول الطعام؟",options:[{id:"energy",text:"للحصول على الطاقة."},{id:"eyes",text:"لتغيير لون عينيه."},{id:"instant",text:"لزيادة طوله فورًا."}],correctId:"energy"},
 {id:"nutrition-start-5",text:"أيّ مما يأتي يُعدّ غذاءً للأرنب؟",options:[{id:"stones",text:"الحجارة."},{id:"grass",text:"الأعشاب."},{id:"soil",text:"التراب."}],correctId:"grass"},
];
export function diagnosticScore(answers:Record<string,string>){
 const correct=nutritionDiagnostic.filter(q=>answers[q.id]===q.correctId).length;
 return {correct,percent:correct*20,complete:nutritionDiagnostic.every(q=>q.options.some(o=>o.id===answers[q.id]))};
}
export const nutritionOpeningGoals=[
 "يميّز بين التغذية الذاتية والتغذية غير الذاتية.",
 "يحدّد مدخلات عملية البناء الضوئي.",
 "يحدّد نواتج عملية البناء الضوئي.",
 "يكشف عن وجود النشا باستخدام محلول لوغول.",
 "يميّز بين الترمم والتطفل.",
 "يصنّف الحيوانات وفق أنماط تغذيتها.",
];
