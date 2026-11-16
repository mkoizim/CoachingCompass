// Fictional names used when a player chooses to stay anonymous on the survey.
const FIRST_NAMES = [
  'Marcus', 'Diego', 'Tyler', 'Andre', 'Ryan', 'Luis', 'Caleb', 'Owen', 'Mateo', 'Jalen',
  'Cole', 'Hiroshi', 'Evan', 'Rafael', 'Nolan', 'Isaiah', 'Brady', 'Carlos', 'Wyatt', 'Dominic',
];
const LAST_NAMES = [
  'Delgado', 'Whitaker', 'Okafor', 'Brennan', 'Castillo', 'Nakamura', 'Holloway', 'Reyes', 'Lindqvist', 'Mercer',
  'Fontaine', 'Abernathy', 'Quintero', 'Sato', 'Gallagher', 'Ramos', 'Thornton', 'Vasquez', 'Kowalski', 'Hayes',
];

const pick = <T,>(items: T[]) => items[Math.floor(Math.random() * items.length)];

export function randomPlayerAlias(): string {
  return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
}
