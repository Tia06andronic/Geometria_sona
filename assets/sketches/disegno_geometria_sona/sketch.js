// =====================================================
// SISTEMA DI GEOMETRIA SONA - p5.js
// =====================================================
// Questo programma permette di creare pattern ispirati
// alla geometria Sona africana.
//
// L'utente può:
// - posizionare punti (dots)
// - inserire muri/barriere (walls)
//
// La logica principale è:
// i percorsi si muovono diagonalmente e rimbalzano
// quando incontrano muri o assenza di punti.
//
// =====================================================



// =====================================================
// VARIABILI GLOBALI
// =====================================================

// Contiene l'intero sistema Sona
let system;

// Dimensione di ogni cella della griglia
let cellSize = 50;

// Offset per centrare il sistema nello schermo
let offsetX, offsetY;

// Mostra o nasconde la griglia
let showGrid = true;

// Strumento corrente:
// 'DOTS'  = aggiunge/rimuove punti
// 'WALLS' = aggiunge/rimuove muri
let drawingTool = 'DOTS';

// Variabili per l'animazione dei percorsi
let animationTime = 0;
let animationSpeed = 0.5;



// =====================================================
// SETUP
// =====================================================
// Viene eseguito una sola volta all'avvio
// =====================================================
function setup() {

  // Canvas grande quanto la finestra
  createCanvas(windowWidth, windowHeight);

  // Centro dello schermo
  offsetX = Math.floor(windowWidth / 2);
  offsetY = Math.floor(windowHeight / 2);

  // Creazione del sistema principale
  system = new SonaSystem();
}



// =====================================================
// DRAW
// =====================================================
// Viene eseguito continuamente (~60 FPS)
// =====================================================
function draw() {

  // Sfondo color avorio chiaro
  background(252, 250, 245);



  // ===================================================
  // INTERFACCIA TESTUALE
  // ===================================================

  noStroke();
  fill(0, 150);

  textAlign(LEFT, TOP);

  textSize(14);
  text("African Sona Geometry Explorer", 15, 15);

  textSize(12);

  // Testo dinamico in base allo strumento selezionato
  let modeStr =
    drawingTool === 'DOTS'
      ? '● DOTS (Click grid to toggle dots)'
      : '▐ WALLS (Click between dots to toggle walls)';

  // Colore diverso per distinguere la modalità
  fill(
    drawingTool === 'DOTS'
      ? color(0, 150)
      : color(200, 50, 50, 200)
  );

  text(`Current Tool: ${modeStr}`, 15, 35);

  fill(0, 150);

  text(
    "W - Toggle Tool | Z - Undo | C - Clear | G - Grid | S - Save PNG",
    15,
    55
  );

  fill(200, 50, 50, 200);

  text("R - Generate Asymmetry (Random Walls)", 15, 75);



  // ===================================================
  // SISTEMA DI TRASFORMAZIONE
  // ===================================================
  // Tutto ciò che viene disegnato dopo sarà centrato
  // rispetto allo schermo
  // ===================================================

  push();

  translate(offsetX, offsetY);



  // ===================================================
  // DISEGNO DELLA GRIGLIA
  // ===================================================

  if (showGrid) {
    drawGrid();
  }



  // ===================================================
  // DISEGNO DEI PUNTI
  // ===================================================

  fill(40);
  noStroke();

  for (let dot of system.dots) {

    // Le coordinate sono salvate come stringa "x,y"
    let [x, y] = dot.split(",").map(Number);

    // Disegna un piccolo cerchio
    circle(x * cellSize, y * cellSize, 6);
  }



  // ===================================================
  // DISEGNO DEI MURI
  // ===================================================

  stroke(200, 50, 50, 150);
  strokeWeight(4);
  strokeCap(ROUND);

  for (let wall of system.walls) {

    let [x, y] = wall.split(",").map(Number);

    // Se x contiene .5 significa muro verticale
    if (x % 1 !== 0) {

      line(
        x * cellSize,
        (y - 0.25) * cellSize,

        x * cellSize,
        (y + 0.25) * cellSize
      );

    } else {

      // Altrimenti muro orizzontale
      line(
        (x - 0.25) * cellSize,
        y * cellSize,

        (x + 0.25) * cellSize,
        y * cellSize
      );
    }
  }



  // ===================================================
  // DISEGNO DEI PERCORSI
  // ===================================================

  let loops = system.loops;

  // Se esistono percorsi, l'animazione avanza
  if (loops.length > 0) {
    animationTime += animationSpeed;
  }

  // Disegna ogni loop
  for (let i = 0; i < loops.length; i++) {
    drawPath(loops[i], animationTime);
  }

  pop();
}



// =====================================================
// RIDIMENSIONAMENTO FINESTRA
// =====================================================
function windowResized() {

  resizeCanvas(windowWidth, windowHeight);

  offsetX = Math.floor(windowWidth / 2);
  offsetY = Math.floor(windowHeight / 2);
}



// =====================================================
// CLICK DEL MOUSE
// =====================================================
function mousePressed() {

  // Evita click sopra la UI testuale
  if (mouseX < 400 && mouseY < 110) return;



  // Coordinate del mouse convertite
  // nel sistema della griglia
  let px = (mouseX - offsetX) / cellSize;
  let py = (mouseY - offsetY) / cellSize;



  // ===================================================
  // MODALITÀ PUNTI
  // ===================================================

  if (drawingTool === 'DOTS') {

    // Arrotonda alla cella più vicina
    let gridX = Math.round(px);
    let gridY = Math.round(py);

    // Aggiunge o rimuove il punto
    system.toggleDot(gridX, gridY);
  }



  // ===================================================
  // MODALITÀ MURI
  // ===================================================

  else if (drawingTool === 'WALLS') {

    // Parte decimale della posizione
    let diffX = px - Math.floor(px);
    let diffY = py - Math.floor(py);

    // Distanza dal centro della cella
    let dx = diffX - 0.5;
    let dy = diffY - 0.5;

    let wallX, wallY;

    // Decide se il muro sarà verticale o orizzontale
    if (Math.abs(dx) > Math.abs(dy)) {

      wallX = Math.floor(px) + (dx > 0 ? 0.5 : -0.5);
      wallY = Math.round(py);

    } else {

      wallX = Math.round(px);
      wallY = Math.floor(py) + (dy > 0 ? 0.5 : -0.5);
    }

    // Aggiunge/rimuove il muro
    system.toggleWall(wallX, wallY);
  }

  // Riavvia l'animazione
  animationTime = 0;
}



// =====================================================
// GESTIONE TASTIERA
// =====================================================
function keyPressed() {

  // Undo
  if (key === 'z' || key === 'Z') {
    system.undo();
    animationTime = 0;
  }

  // Cancella tutto
  if (key === 'c' || key === 'C') {
    system.clear();
    animationTime = 0;
  }

  // Mostra/nasconde griglia
  if (key === 'g' || key === 'G') {
    showGrid = !showGrid;
  }

  // Cambia strumento
  if (key === 'w' || key === 'W') {
    drawingTool =
      drawingTool === 'DOTS'
        ? 'WALLS'
        : 'DOTS';
  }

  // Salva immagine
  if (key === 's' || key === 'S') {
    saveCanvas("Sona_Geometry", "png");
  }

  // Genera muri casuali
  if (key === 'r' || key === 'R') {
    system.generateAsymmetry();
    animationTime = 0;
  }
}



// =====================================================
// DISEGNO DELLA GRIGLIA
// =====================================================
function drawGrid() {
  
// colore della griglia
  stroke(0, 0, 0, 15);
  strokeWeight(1);

  let cols = Math.ceil(width / cellSize);
  let rows = Math.ceil(height / cellSize);

  // Linee verticali
  for (let i = -cols; i <= cols; i++) {
    line(i * cellSize, -height, i * cellSize, height);
  }

  // Linee orizzontali
  for (let i = -rows; i <= rows; i++) {
    line(-width, i * cellSize, width, i * cellSize);
  }
}



// =====================================================
// DISEGNO DI UN PERCORSO
// =====================================================
// path     = lista di punti del percorso
// progress = quantità di animazione visibile
// =====================================================
function drawPath(path, progress) {

  if (path.length < 2) return;

  // Limite massimo di punti da disegnare
  let limit = min(floor(progress), path.length);



  // Punto medio iniziale
  // Serve per creare curve morbide
  let firstMidX = (path[0].x + path[1].x) / 2;
  let firstMidY = (path[0].y + path[1].y) / 2;



  // ===================================================
  // STROKE ESTERNO
  // ===================================================
  // Serve per simulare intrecci tessili
  // ===================================================

  noFill();

  stroke(252, 250, 245);
  strokeWeight(8);

  strokeCap(ROUND);
  strokeJoin(ROUND);

  beginShape();

  vertex(firstMidX * cellSize, firstMidY * cellSize);

  for (let i = 1; i <= limit; i++) {

    let curr = path[i % path.length];
    let next = path[(i + 1) % path.length];

    let midX = (curr.x + next.x) / 2;
    let midY = (curr.y + next.y) / 2;

    quadraticVertex(
      curr.x * cellSize,
      curr.y * cellSize,

      midX * cellSize,
      midY * cellSize
    );
  }

  endShape();



  // ===================================================
  // LINEA INTERNA REALE
  // ===================================================

  stroke(30, 30, 35);
  strokeWeight(2.5);

  beginShape();

  vertex(firstMidX * cellSize, firstMidY * cellSize);

  for (let i = 1; i <= limit; i++) {

    let curr = path[i % path.length];
    let next = path[(i + 1) % path.length];

    let midX = (curr.x + next.x) / 2;
    let midY = (curr.y + next.y) / 2;

    quadraticVertex(
      curr.x * cellSize,
      curr.y * cellSize,

      midX * cellSize,
      midY * cellSize
    );
  }

  endShape();
}



// =====================================================
// CLASSE PRINCIPALE DEL SISTEMA SONA
// =====================================================
class SonaSystem {

  constructor() {

    // Insieme dei punti
    this.dots = new Set();

    // Insieme dei muri
    this.walls = new Set();

    // Storico per undo
    this.history = [];

    // Percorsi generati
    this.loops = [];
  }



  // ===================================================
  // SALVA STATO NELLA CRONOLOGIA
  // ===================================================
  _saveHistory() {

    this.history.push({

      dots: new Set(this.dots),
      walls: new Set(this.walls)

    });
  }



  // ===================================================
  // AGGIUNGE/RIMUOVE UN PUNTO
  // ===================================================
  toggleDot(x, y) {

    let key = x + "," + y;

    if (this.dots.has(key)) {
      this.dots.delete(key);
    } else {
      this.dots.add(key);
    }

    this._saveHistory();

    // Rigenera i percorsi
    this.loops = this.generateLoops();
  }



  // ===================================================
  // AGGIUNGE/RIMUOVE UN MURO
  // ===================================================
  toggleWall(x, y) {

    let key = x + "," + y;

    if (this.walls.has(key)) {
      this.walls.delete(key);
    } else {
      this.walls.add(key);
    }

    this._saveHistory();

    this.loops = this.generateLoops();
  }



  // ===================================================
  // GENERAZIONE ASIMMETRIA CASUALE
  // ===================================================
  // Inserisce muri casuali tra punti adiacenti
  // ===================================================
  generateAsymmetry() {

    this.walls.clear();

    let isDot = (dx, dy) =>
      this.dots.has(dx + "," + dy);

    for (let dotStr of this.dots) {

      let [X, Y] = dotStr.split(",").map(Number);



      // Controlla il vicino destro
      if (isDot(X + 1, Y)) {

        // 25% probabilità di creare muro
        if (random() < 0.25) {
          this.walls.add((X + 0.5) + "," + Y);
        }
      }



      // Controlla il vicino sotto
      if (isDot(X, Y + 1)) {

        if (random() < 0.25) {
          this.walls.add(X + "," + (Y + 0.5));
        }
      }
    }

    this._saveHistory();

    this.loops = this.generateLoops();
  }



  // ===================================================
  // UNDO
  // ===================================================
  undo() {

    if (this.history.length > 1) {

      this.history.pop();

      let prev = this.history[this.history.length - 1];

      this.dots = new Set(prev.dots);
      this.walls = new Set(prev.walls);

    } else if (this.history.length === 1) {

      this.history = [];

      this.dots.clear();
      this.walls.clear();
    }

    this.loops = this.generateLoops();
  }



  // ===================================================
  // CANCELLA TUTTO
  // ===================================================
  clear() {

    this.dots.clear();
    this.walls.clear();

    this.history = [];

    this.loops = [];
  }



  // ===================================================
  // GENERAZIONE DEI PERCORSI SONA
  // ===================================================
  // Questa è la parte più importante del programma.
  //
  // Il sistema:
  // - parte dai bordi dei punti
  // - crea traiettorie diagonali
  // - rimbalza contro muri o vuoti
  // - salva il percorso generato
  // ===================================================
  generateLoops() {

    let generatedLoops = [];

    // Memorizza stati già visitati
    let visited = new Set();

    let isDot = (dx, dy) =>
      this.dots.has(dx + "," + dy);

    let isWall = (x, y) =>
      this.walls.has(x + "," + y);



    // Analizza ogni punto
    for (let dotStr of this.dots) {

      let [X, Y] = dotStr.split(",").map(Number);



      // Possibili punti di partenza
      let edges = [

        { cx: X + 0.5, cy: Y },
        { cx: X - 0.5, cy: Y },

        { cx: X, cy: Y + 0.5 },
        { cx: X, cy: Y - 0.5 }
      ];



      for (let e of edges) {

        // Direzioni diagonali possibili
        let velocities = [

          [0.5, 0.5],
          [0.5, -0.5],

          [-0.5, 0.5],
          [-0.5, -0.5]
        ];



        for (let v of velocities) {

          let [vx, vy] = v;

          let stateKey =
            `${e.cx},${e.cy},${vx},${vy}`;



          // Evita di rifare percorsi già esplorati
          if (!visited.has(stateKey)) {

            let loop = [];

            let curX = e.cx;
            let curY = e.cy;

            let curVx = vx;
            let curVy = vy;

            // Protezione anti-loop infinito
            let securityCount = 0;



            while (securityCount < 10000) {

              securityCount++;

              let currentKey =
                `${curX},${curY},${curVx},${curVy}`;



              // Se già visitato interrompe
              if (visited.has(currentKey)) break;

              visited.add(currentKey);



              // Salva punto del percorso
              loop.push({
                x: curX,
                y: curY
              });



              // =======================================
              // CONTROLLO RIMBALZI
              // =======================================

              // Se siamo su un muro verticale
              if (curX % 1 !== 0) {

                let d1 = Math.floor(curX);
                let d2 = Math.ceil(curX);

                // Rimbalzo
                if (
                  !isDot(d1, curY) ||
                  !isDot(d2, curY) ||
                  isWall(curX, curY)
                ) {
                  curVx = -curVx;
                }
              }

              // Se siamo su muro orizzontale
              else if (curY % 1 !== 0) {

                let d1 = Math.floor(curY);
                let d2 = Math.ceil(curY);

                if (
                  !isDot(curX, d1) ||
                  !isDot(curX, d2) ||
                  isWall(curX, curY)
                ) {
                  curVy = -curVy;
                }
              }



              // Avanza nel percorso
              curX += curVx;
              curY += curVy;
            }



            // Salva il loop generato
            if (loop.length > 0) {
              generatedLoops.push(loop);
            }
          }
        }
      }
    }

    return generatedLoops;
  }
}