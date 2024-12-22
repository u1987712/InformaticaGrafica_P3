var gl, program;
var myZeta = 0.0, myPhi = Math.PI/2.0, radius = 4, fovy = 1.4;

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

  initBuffers(suzzane); //Suzzane
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
          const rightVector = vec3.create();
          vec3.cross(rightVector, cameraFront, cameraUp);
          vec3.normalize(rightVector, rightVector);
  
          const frontVector = vec3.fromValues(cameraFront[0], 0, cameraFront[2]);
          vec3.normalize(frontVector, frontVector);
  
          const moveVector = vec3.create();
          const newPosition = vec3.create();
          vec3.copy(newPosition, cameraPosition);
  
          // Calcular y verificar el movimiento por separado para cada dirección
          if (keys["w"] || keys["s"]) {
              const tempPos = vec3.create();
              vec3.copy(tempPos, newPosition);
              vec3.scaleAndAdd(tempPos, tempPos, frontVector, 
                             keys["w"] ? moveSpeed : -moveSpeed);
              const checkedPos = checkCollision(tempPos);
              vec3.copy(newPosition, checkedPos);
          }
  
          if (keys["a"] || keys["d"]) {
              const tempPos = vec3.create();
              vec3.copy(tempPos, newPosition);
              vec3.scaleAndAdd(tempPos, tempPos, rightVector, 
                             keys["d"] ? moveSpeed : -moveSpeed);
              const checkedPos = checkCollision(tempPos);
              vec3.copy(newPosition, checkedPos);
          }
  
          // Actualizar la posición de la cámara
          vec3.copy(cameraPosition, newPosition);
          
          requestAnimationFrame(drawScene);
      }
  
      requestAnimationFrame(updateMovement);
  }

    requestAnimationFrame(updateMovement);
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