const d = new Date("2026-04-09");
console.log("Original:", d.toISOString(), d.toString());
d.setHours(23, 59, 59, 999);
console.log("Locally set to 23:59:", d.toISOString());
