const APPS = [
  {
    id: 1,
    name: "Roam",
    key: "roamjs",
  },
  {
    id: 2,
    name: "LogSeq",
  },
  {
    id: 3,
    name: "Obsidian",
  },
] as const;

export const appsById = Object.fromEntries(APPS.map(({ id, ...a }) => [id, a]));

export default APPS;
