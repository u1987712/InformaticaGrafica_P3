var gl, program;
var myZeta = 0.0, myPhi = Math.PI/2.0, radius = 4, fovy = 1.4;
var selectedPrimitive = exampleOBJ;

// Variables de cámara
var cameraPosition = [0.0, 2.0, 5.0];  // Posición inicial más cercana al suelo
var cameraFront = [0.0, 0.0, -1.0];    // Mirando hacia adelante por defecto
var cameraUp = [0.0, 1.0, 0.0];
var yaw = -90.0;                       // Rotación inicial
var pitch = 0.0;
var moveSpeed = 0.1;                   // Velocidad reducida para más control
var sensitivity = 0.1;

function getWebGLContext() {
  var canvas = document.getElementById("myCanvas");
  try {
    return canvas.getContext("webgl2");
  } catch (e) {}
  return null;
}

function initShaders() { 
  var vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, document.getElementById("myVertexShader").text);
  gl.compileShader(vertexShader);
  if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(vertexShader));
    return null;
  }

  var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, document.getElementById("myFragmentShader").text);
  gl.compileShader(fragmentShader);
  if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(fragmentShader));
    return null;
  }

  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  program.vertexPositionAttribute = gl.getAttribLocation(program, "VertexPosition");
  gl.enableVertexAttribArray(program.vertexPositionAttribute);

  program.modelViewMatrixIndex = gl.getUniformLocation(program, "modelViewMatrix");
  program.projectionMatrixIndex = gl.getUniformLocation(program, "projectionMatrix");

  program.vertexNormalAttribute = gl.getAttribLocation(program, "VertexNormal");
  program.normalMatrixIndex = gl.getUniformLocation(program, "normalMatrix");
  gl.enableVertexAttribArray(program.vertexNormalAttribute);

  program.LaIndex = gl.getUniformLocation(program, "Light.La");
  program.LdIndex = gl.getUniformLocation(program, "Light.Ld");
  program.LsIndex = gl.getUniformLocation(program, "Light.Ls");
  program.PositionIndex = gl.getUniformLocation(program, "Light.Position");
}

function initRendering() { 
  gl.clearColor(0.95, 0.95, 0.95, 1.0);
  gl.enable(gl.DEPTH_TEST);
  setShaderLight();
}

function initBuffers(model) {
  model.idBufferVertices = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);

  model.idBufferNormals = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferNormals);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertexNormals), gl.STATIC_DRAW);

  model.idBufferIndices = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
}

function initPrimitives() {
  initBuffers(examplePlane); //Suelo
  initBuffers(exampleCube); //Cubo

  initBuffers(exampleOBJ); //Suzzane
}

function setShaderProjectionMatrix(projectionMatrix) {
  gl.uniformMatrix4fv(program.projectionMatrixIndex, false, projectionMatrix);
}

function setShaderModelViewMatrix(modelViewMatrix) {
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
}

function setShaderNormalMatrix(normalMatrix) {
  gl.uniformMatrix3fv(program.normalMatrixIndex, false, normalMatrix);
}

function getNormalMatrix(modelViewMatrix) {
  return mat3.normalFromMat4(mat3.create(), modelViewMatrix);
}

function getProjectionMatrix() {
  return mat4.perspective(mat4.create(), fovy, 1.0, 0.1, 100.0);
}

function getCameraMatrix() {
  var x = radius * Math.sin(myPhi) * Math.sin(myZeta);
  var y = radius * Math.cos(myPhi);
  var z = radius * Math.sin(myPhi) * Math.cos(myZeta);
  return mat4.lookAt(mat4.create(), [x, y, z], [0, 0, 0], [0, 1, 0]);
}

function setShaderLight() {
  gl.uniform3f(program.LaIndex, 1.0, 1.0, 1.0);
  gl.uniform3f(program.LdIndex, 1.0, 1.0, 1.0);
  gl.uniform3f(program.LsIndex, 1.0, 1.0, 1.0);
  gl.uniform3f(program.PositionIndex, 0.0, 0.0, 10.0);
}

function drawSolidOBJ(model) { 
  gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferNormals);
  gl.vertexAttribPointer(program.vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
}

function drawSolid(model) { 
  gl.bindBuffer(gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 2*3*4, 0);
  gl.vertexAttribPointer(program.vertexNormalAttribute, 3, gl.FLOAT, false, 2*3*4, 3*4);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.drawElements(gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
}

function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  setShaderProjectionMatrix(getProjectionMatrix());

  // Dibujar el objeto seleccionado
  var modelMatrix = mat4.create();
  var modelViewMatrix = mat4.create();
  mat4.fromTranslation(modelMatrix, [0.0, 2, 0.0]);
  mat4.multiply(modelViewMatrix, getCameraMatrix(), modelMatrix);
  setShaderModelViewMatrix(modelViewMatrix);

  setShaderNormalMatrix(getNormalMatrix(modelViewMatrix));
  drawSolidOBJ(selectedPrimitive);

  // Dibujar el cubo
  var modelMatrixCube = mat4.create();
  var modelViewMatrixCube = mat4.create();
  mat4.translate(modelMatrixCube, modelMatrixCube, [0.0, 0.5, 0.0]);
  mat4.scale(modelMatrixCube, modelMatrixCube, [3, 1, 3]);
  mat4.multiply(modelViewMatrixCube, getCameraMatrix(), modelMatrixCube);
  setShaderModelViewMatrix(modelViewMatrixCube);
  setShaderNormalMatrix(getNormalMatrix(modelViewMatrixCube));
  drawSolid(exampleCube);

  // Dibujar el plano (suelo)
  var modelMatrixPlane = mat4.create();
  var modelViewMatrixPlane = mat4.create();
  mat4.fromTranslation(modelMatrixPlane, [0.0, 0.0, 0.0]); // Mover el plano debajo del cubo
  mat4.fromScaling(modelMatrixPlane, [20.0, 1.0, 20.0]); // Escalar el plano
  mat4.multiply(modelViewMatrixPlane, getCameraMatrix(), modelMatrixPlane);
  setShaderModelViewMatrix(modelViewMatrixPlane);
  setShaderNormalMatrix(getNormalMatrix(modelViewMatrixPlane));
  drawSolid(examplePlane); // Dibujar el plano

  // Ajustes para las paredes
  var wallThickness = 0.5; // Grosor de las paredes
  var wallHeight = 5.0;    // Altura de las paredes
  var planeLength = 20.0;  // Dimensiones del plano (escala aplicada)

  // Pared Frontal
  var modelMatrixWallFront = mat4.create();
  var modelViewMatrixWallFront = mat4.create();
  mat4.translate(modelMatrixWallFront, modelMatrixWallFront, [0.0, wallHeight / 2.0, planeLength/2]);
  mat4.scale(modelMatrixWallFront, modelMatrixWallFront, [planeLength, wallHeight, wallThickness]);
  mat4.multiply(modelViewMatrixWallFront, getCameraMatrix(), modelMatrixWallFront);
  setShaderModelViewMatrix(modelViewMatrixWallFront);
  setShaderNormalMatrix(getNormalMatrix(modelViewMatrixWallFront));
  drawSolid(exampleCube);

  // Pared Trasera
  var modelMatrixWallBack = mat4.create();
  var modelViewMatrixWallBack = mat4.create();
  mat4.translate(modelMatrixWallBack, modelMatrixWallBack, [0.0, wallHeight / 2.0, -planeLength/2]);
  mat4.scale(modelMatrixWallBack, modelMatrixWallBack, [planeLength, wallHeight, wallThickness]);
  mat4.multiply(modelViewMatrixWallBack, getCameraMatrix(), modelMatrixWallBack);
  setShaderModelViewMatrix(modelViewMatrixWallBack);
  setShaderNormalMatrix(getNormalMatrix(modelViewMatrixWallBack));
  drawSolid(exampleCube);

  // Pared Izquierda
  var modelMatrixWallLeft = mat4.create();
  var modelViewMatrixWallLeft = mat4.create();
  mat4.translate(modelMatrixWallLeft, modelMatrixWallLeft, [-planeLength/2, wallHeight / 2.0, 0.0]);
  mat4.scale(modelMatrixWallLeft, modelMatrixWallLeft, [wallThickness, wallHeight, planeLength]);
  mat4.multiply(modelViewMatrixWallLeft, getCameraMatrix(), modelMatrixWallLeft);
  setShaderModelViewMatrix(modelViewMatrixWallLeft);
  setShaderNormalMatrix(getNormalMatrix(modelViewMatrixWallLeft));
  drawSolid(exampleCube);

  // Pared Derecha
  var modelMatrixWallRight = mat4.create();
  var modelViewMatrixWallRight = mat4.create();
  mat4.translate(modelMatrixWallRight, modelMatrixWallRight, [planeLength/2, wallHeight / 2.0, 0.0]);
  mat4.scale(modelMatrixWallRight, modelMatrixWallRight, [wallThickness, wallHeight, planeLength]);
  mat4.multiply(modelViewMatrixWallRight, getCameraMatrix(), modelMatrixWallRight);
  setShaderModelViewMatrix(modelViewMatrixWallRight);
  setShaderNormalMatrix(getNormalMatrix(modelViewMatrixWallRight));
  drawSolid(exampleCube);

  // Dibujar el plano (techo)
  var modelMatrixCeiling = mat4.create();
  var modelViewMatrixCeiling = mat4.create();
  mat4.translate(modelMatrixCeiling, modelMatrixCeiling, [0.0, wallHeight, 0.0]);
  mat4.scale(modelMatrixCeiling, modelMatrixCeiling, [20.0, 1.0, 20.0]);
  mat4.multiply(modelViewMatrixCeiling, getCameraMatrix(), modelMatrixCeiling);
  setShaderModelViewMatrix(modelViewMatrixCeiling);
  setShaderNormalMatrix(getNormalMatrix(modelViewMatrixCeiling));
  drawSolid(examplePlane); // Dibujar el plano
}

// Función para actualizar los vectores de la cámara
function updateCameraVectors() {
    // Convertir los ángulos a radianes y calcular las componentes del vector
    const yawRad = glMatrix.toRadian(yaw);
    const pitchRad = glMatrix.toRadian(pitch);
    
    // Calcular el nuevo vector frontal
    cameraFront[0] = Math.cos(yawRad) * Math.cos(pitchRad);
    cameraFront[1] = Math.sin(pitchRad);
    cameraFront[2] = Math.sin(yawRad) * Math.cos(pitchRad);
    
    // Normalizar el vector frontal
    vec3.normalize(cameraFront, cameraFront);
}

function checkCollision(newPosition) {
    // Dimensiones de la habitación (tomadas del código original)
    const roomWidth = 20.0;  // Ancho total de la habitación
    const roomDepth = 20.0;  // Profundidad total de la habitación
    
    // Margen de colisión para evitar que la cámara se pegue demasiado a las paredes
    const collisionMargin = 0.5;
    
    // Límites de la habitación
    const minX = -roomWidth/2 + collisionMargin;
    const maxX = roomWidth/2 - collisionMargin;
    const minZ = -roomDepth/2 + collisionMargin;
    const maxZ = roomDepth/2 - collisionMargin;
    
    // Aplicar restricciones
    return [
        Math.max(minX, Math.min(maxX, newPosition[0])),  // X
        newPosition[1],                                   // Y (sin restricción)
        Math.max(minZ, Math.min(maxZ, newPosition[2]))   // Z
    ];
}

function initHandlers() {
    const canvas = document.getElementById("myCanvas");
    const keys = {};
    let isMouseLocked = false;

    // Manejo de teclado
    document.addEventListener("keydown", (event) => {
        keys[event.key.toLowerCase()] = true;
    });

    document.addEventListener("keyup", (event) => {
        keys[event.key.toLowerCase()] = false;
    });

    // Control de ratón
    canvas.addEventListener("click", () => {
        if (!isMouseLocked) {
            canvas.requestPointerLock();
        }
    });

    document.addEventListener("pointerlockchange", () => {
        isMouseLocked = document.pointerLockElement === canvas;
    });

    document.addEventListener("mousemove", (event) => {
        if (!isMouseLocked) return;

        const deltaX = event.movementX * sensitivity;
        const deltaY = event.movementY * sensitivity;

        yaw += deltaX;
        pitch = Math.max(-89.0, Math.min(89.0, pitch - deltaY));

        updateCameraVectors();
        requestAnimationFrame(drawScene);
    });

    function updateMovement() {
        if (Object.values(keys).some(key => key)) {
            // Vector derecho para movimiento lateral
            const rightVector = vec3.create();
            vec3.cross(rightVector, cameraFront, cameraUp);
            vec3.normalize(rightVector, rightVector);

            // Vector frontal normalizado para movimiento adelante/atrás
            const frontVector = vec3.fromValues(cameraFront[0], 0, cameraFront[2]);
            vec3.normalize(frontVector, frontVector);

            const moveVector = vec3.create();

            // Movimiento adelante/atrás
            if (keys["w"]) vec3.scaleAndAdd(moveVector, moveVector, frontVector, moveSpeed);
            if (keys["s"]) vec3.scaleAndAdd(moveVector, moveVector, frontVector, -moveSpeed);

            // Movimiento lateral
            if (keys["a"]) vec3.scaleAndAdd(moveVector, moveVector, rightVector, -moveSpeed);
            if (keys["d"]) vec3.scaleAndAdd(moveVector, moveVector, rightVector, moveSpeed);

            // Calcular la nueva posición deseada
        const newPosition = vec3.create();
        vec3.add(newPosition, cameraPosition, moveVector);
        
        // Verificar y ajustar la posición para evitar colisiones
        const adjustedPosition = checkCollision(newPosition);
        
        // Actualizar la posición de la cámara
        vec3.copy(cameraPosition, adjustedPosition);
        
        requestAnimationFrame(drawScene);
        }

        requestAnimationFrame(updateMovement);
    }

    requestAnimationFrame(updateMovement);
}

function getCameraMatrix() {
    const target = vec3.create();
    vec3.add(target, cameraPosition, cameraFront);
    return mat4.lookAt(mat4.create(), cameraPosition, target, cameraUp);
}

function initWebGL() {
  gl = getWebGLContext();
  if (!gl) {
    alert("WebGL 2.0 no está disponible");
    return;
  }

  initShaders();
  initPrimitives();
  initRendering();
  initHandlers();
  updateCameraVectors();
  requestAnimationFrame(drawScene);
}

initWebGL();