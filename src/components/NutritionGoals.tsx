import {nutritionOpeningGoals} from "../data/nutritionOpening";
import {StageGuide} from "./StageGuide";
import {Leaf,Sun,Wind,FlaskConical,Network,Rabbit} from "lucide-react";
export function NutritionGoals(){
 const icons=[Leaf,Sun,Wind,FlaskConical,Network,Rabbit];
 return <section className="nutrition-goals"><h2>أهداف رحلتك</h2><p>في نهاية درس التغذية، يُتوقع من الطالب أن:</p><StageGuide context="nutrition.goals" text="تعرّف إلى ما ستكتشفه خلال رحلتك العلمية."/><div className="nutrition-goal-grid">{nutritionOpeningGoals.map((goal,i)=>{const Icon=icons[i];return <article className="nutrition-goal" key={goal} style={{'--goal-delay':`${i*40}ms`} as React.CSSProperties}><span><Icon size={26}/></span><p>{goal}</p></article>;})}</div></section>;
}
