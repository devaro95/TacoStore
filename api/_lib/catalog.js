// Catálogo de servidor: precio y stock que se cobran de verdad (el navegador solo envía id + cantidad).
// Mantener sincronizado con la lista "products" de index.html.
export const SHIP_CENTS = 395;
export const FREE_SHIP_CENTS = 5000;

export const CATALOG = {
  "fb08-box": { name: "Caja de sobres FB08 Saiyan's Pride (24 sobres)", cents: 9495, stock: true },
  "fb10-box": { name: "Caja de sobres FB10 Cross Force (24 sobres)", cents: 9495, stock: true },
  "fb09-pack": { name: "Sobre FB09 Dual Evolution", cents: 450, stock: true },
  "fb01-box": { name: "Caja de sobres FB01 (24 sobres)", cents: 8995, stock: true },
  "fb01-pack": { name: "Sobre FB01", cents: 450, stock: true },
  "fb02-box": { name: "Caja de sobres FB02 (24 sobres)", cents: 9250, stock: false },
  "fb02-pack": { name: "Sobre FB02", cents: 450, stock: true },
  "fs01": { name: "Mazo de inicio FS01", cents: 1395, stock: true },
  "fs02": { name: "Mazo de inicio FS02", cents: 1395, stock: false },
  "fs03": { name: "Mazo de inicio FS03", cents: 1395, stock: true },
  "fs04": { name: "Mazo de inicio FS04", cents: 1395, stock: true },
  "fb03-box": { name: "Caja de sobres FB03 (24 sobres)", cents: 9495, stock: true },
  "sleeves": { name: "Fundas oficiales (60 uds.)", cents: 995, stock: true },
  "mat": { name: "Tapete de juego", cents: 2495, stock: false },
  "deckbox": { name: "Caja de mazo", cents: 750, stock: true },
  "bt24-box": { name: "Caja de sobres BT24 (24 sobres)", cents: 9995, stock: true },
  "bt24-pack": { name: "Sobre BT24", cents: 475, stock: true },
  "bt23-box": { name: "Caja de sobres BT23 (24 sobres)", cents: 9750, stock: false },
  "bt23-pack": { name: "Sobre BT23", cents: 475, stock: true },
  "bt22-box": { name: "Caja de sobres BT22 (24 sobres)", cents: 9495, stock: true },
};
