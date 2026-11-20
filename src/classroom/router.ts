import { curriculum } from "../data/curriculum";
import { home, type Destination } from "./storage";
export function lessonDestination(
  lesson: number,
  section: Destination["section"] = "intro",
  topic = 0,
  scene?: string,
): Destination {
  const id =
    Number.isInteger(lesson) && lesson >= 1 && lesson <= 7 ? lesson : 1;
  const index = Number.isInteger(topic)
    ? Math.max(0, Math.min(curriculum[id - 1].topics.length - 1, topic))
    : 0;
  return {
    page: "lesson",
    lesson: id,
    section,
    topic: index,
    ...(scene && curriculum[id - 1].topics[index].scenes.includes(scene)
      ? { scene }
      : {}),
  };
}
export function routeFromHash(hash = window.location.hash): Destination {
  const parts = hash.replace(/^#/u, "").split("/");
  if (["progress", "help", "final"].includes(parts[0]))
    return { ...home, page: parts[0] as Destination["page"] };
  if (parts[0] !== "lesson") return home;
  const id = Number(parts[1]),
    section = parts[2] || "intro",
    topic = parts[3] === undefined ? 0 : Number(parts[3]);
  if (
    !Number.isInteger(id) ||
    id < 1 ||
    id > 7 ||
    !["intro", "pre", "concept", "review", "post", "award"].includes(section)
  )
    return home;
  return lessonDestination(
    id,
    section as Destination["section"],
    topic,
    parts[4],
  );
}
export function routeHash(route: Destination) {
  return route.page !== "lesson"
    ? `#${route.page}`
    : `#lesson/${route.lesson}/${route.section}/${route.topic}${route.scene ? `/${route.scene}` : ""}`;
}
