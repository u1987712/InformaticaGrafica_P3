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
    
  program.vertexPositionAttribute = gl.getAttribLocation( program, "VertexPosition");
  gl.enableVertexAttribArray(program.vertexPositionAttribute);

  program.modelViewMatrixIndex  = gl.getUniformLocation( program, "modelViewMatrix");
  program.projectionMatrixIndex = gl.getUniformLocation( program, "projectionMatrix");
  
  // normales
  // this may not change
  program.vertexNormalAttribute = gl.getAttribLocation ( program, "VertexNormal");
  program.normalMatrixIndex     = gl.getUniformLocation( program, "normalMatrix");
  gl.enableVertexAttribArray(program.vertexNormalAttribute);

  // material
  program.KaIndex               = gl.getUniformLocation( program, "Material.Ka");
  program.KdIndex               = gl.getUniformLocation( program, "Material.Kd");
  program.KsIndex               = gl.getUniformLocation( program, "Material.Ks");
  program.alphaIndex            = gl.getUniformLocation( program, "Material.alpha");

  // fuentes de luz
  program.lightUniforms = [];
    for(let i = 0; i < 3; i++) {
        program.lightUniforms[i] = {
            LaIndex: gl.getUniformLocation(program, `Light[${i}].La`),
            LdIndex: gl.getUniformLocation(program, `Light[${i}].Ld`),
            LsIndex: gl.getUniformLocation(program, `Light[${i}].Ls`),
            PositionIndex: gl.getUniformLocation(program, `Light[${i}].Position`)
        };
    }  
}

function initRendering() { 

  gl.clearColor(0.95,0.95,0.95,1.0);
  gl.enable(gl.DEPTH_TEST);
  
  setShaderLight();

}

function initBuffers(model) {
    
  model.idBufferVertices = gl.createBuffer ();
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
    
  model.idBufferNormals = gl.createBuffer ();
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferNormals);
  gl.bufferData (gl.ARRAY_BUFFER, new Float32Array(model.vertexNormals), gl.STATIC_DRAW);
  
  model.idBufferIndices = gl.createBuffer ();
  gl.bindBuffer (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.bufferData (gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);

}

function initPrimitives() {
  initBuffers(examplePlane); //Planos
  initBuffers(exampleCube); //Cubo
  initBuffers(exampleSphere); //Esfera

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

function setShaderMaterial(material) {

  gl.uniform3fv(program.KaIndex,    material.mat_ambient);
  gl.uniform3fv(program.KdIndex,    material.mat_diffuse);
  gl.uniform3fv(program.KsIndex,    material.mat_specular);
  gl.uniform1f (program.alphaIndex, material.alpha);
  
}

function setShaderLight() {

    //Luz 1 (Frontal)
    gl.uniform3f(program.lightUniforms[0].LaIndex, 0.2, 0.2, 0.2);  // Ambiente suave
    gl.uniform3f(program.lightUniforms[0].LdIndex, 1.0, 1.0, 1.0);  // Difusa blanca
    gl.uniform3f(program.lightUniforms[0].LsIndex, 1.0, 1.0, 1.0);  // Especular blanca
    gl.uniform3f(program.lightUniforms[0].PositionIndex, 0.0, 4.75, 9.75,);  // Posición arriba

    // Luz 2 (lateral izquierda)
    gl.uniform3f(program.lightUniforms[1].LaIndex, 0.1, 0.1, 0.1);
    gl.uniform3f(program.lightUniforms[1].LdIndex, 0.8, 0.0, 0.0);  // Luz roja
    gl.uniform3f(program.lightUniforms[1].LsIndex, 0.8, 0.0, 0.0);
    gl.uniform3f(program.lightUniforms[1].PositionIndex, -9.75, 4.75, 0.0);

    // Luz 3 (lateral derecha)
    gl.uniform3f(program.lightUniforms[2].LaIndex, 0.1, 0.1, 0.1);
    gl.uniform3f(program.lightUniforms[2].LdIndex, 0.0, 0.0, 0.8);  // Luz azul
    gl.uniform3f(program.lightUniforms[2].LsIndex, 1.0, 1.0, 1.0);
    gl.uniform3f(program.lightUniforms[2].PositionIndex, 9.75, 4.75, 0.0);
  /*gl.uniform3f(program.LaIndex,        1.0,  1.0, 1.0);
  gl.uniform3f(program.LdIndex,        1.0,  1.0, 1.0);
  gl.uniform3f(program.LsIndex,        1.0,  1.0, 1.0);
  gl.uniform3f(program.PositionIndex, Lpos[0], Lpos[1], Lpos[2]);*/
}

// draw OBJ
function drawSolidOBJ(model) { 
  // here we should change the way to decode the vertex and normals
  // vertex
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.vertexAttribPointer (program.vertexPositionAttribute, 3, gl.FLOAT, false, 0,   0);
  
  // normals
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferNormals);
  gl.vertexAttribPointer (program.vertexNormalAttribute,   3, gl.FLOAT, false, 0, 0);
    
  gl.bindBuffer   (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.drawElements (gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);

}

// draw primitive
function drawSolid(model) { 
    
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.vertexAttribPointer (program.vertexPositionAttribute, 3, gl.FLOAT, false, 2*3*4,   0);
  gl.vertexAttribPointer (program.vertexNormalAttribute,   3, gl.FLOAT, false, 2*3*4, 3*4);
    
  gl.bindBuffer   (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.drawElements (gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);

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

  var colors = document.getElementsByTagName("input");

  for (var i = 0; i < colors.length; i++) {
      colors[i].addEventListener("change", function() {
          // Cambiar la luz correspondiente según el nombre del input
          switch (this.getAttribute("name")) {
              case "La1": 
                  setColor(program.lightUniforms[0].LaIndex, this.value, 0); break;
              case "Ld1": 
                  setColor(program.lightUniforms[0].LdIndex, this.value, 0); break;
              case "Ls1": 
                  setColor(program.lightUniforms[0].LsIndex, this.value, 0); break;
  
              case "La2": 
                  setColor(program.lightUniforms[1].LaIndex, this.value, 1); break;
              case "Ld2": 
                  setColor(program.lightUniforms[1].LdIndex, this.value, 1); break;
              case "Ls2": 
                  setColor(program.lightUniforms[1].LsIndex, this.value, 1); break;
  
              case "La3": 
                  setColor(program.lightUniforms[2].LaIndex, this.value, 2); break;
              case "Ld3": 
                  setColor(program.lightUniforms[2].LdIndex, this.value, 2); break;
              case "Ls3": 
                  setColor(program.lightUniforms[2].LsIndex, this.value, 2); break;
          }
          requestAnimationFrame(drawScene);
      }, false);
  }

  var lights = document.querySelectorAll("input[type=checkbox]");

  for (var i = 0; i < lights.length; i++) {
      lights[i].addEventListener("change", function() {
          var lightIndex = this.id.charAt(this.id.length - 1) - 1; // Para identificar la luz 1, 2 o 3
          updateLightState(lightIndex, this.checked);
          requestAnimationFrame(drawScene);
      }, false);
  }

    requestAnimationFrame(updateMovement);
}

function setColor(index, value, lightIndex) {
  var myColor = value.substr(1); // Para eliminar el # del #FCA34D

  var r = parseInt(myColor.charAt(0) + myColor.charAt(1), 16) / 255.0;
  var g = parseInt(myColor.charAt(2) + myColor.charAt(3), 16) / 255.0;
  var b = parseInt(myColor.charAt(4) + myColor.charAt(5), 16) / 255.0;

  gl.uniform3f(index, r, g, b); // Para la fuente de luz correspondiente
}

function updateLightState(lightIndex, isChecked) {
  // Si el checkbox está marcado, la luz está encendida; si no, apagada
  var lightUniform = program.lightUniforms[lightIndex];

  if (isChecked) {
      // Si la luz está encendida, mantén los valores de color actuales
      gl.uniform3f(lightUniform.LaIndex, lightUniform.La[0], lightUniform.La[1], lightUniform.La[2]);
      gl.uniform3f(lightUniform.LdIndex, lightUniform.Ld[0], lightUniform.Ld[1], lightUniform.Ld[2]);
      gl.uniform3f(lightUniform.LsIndex, lightUniform.Ls[0], lightUniform.Ls[1], lightUniform.Ls[2]);
  } else {
      // Si la luz está apagada, pon las intensidades a 0
      gl.uniform3f(lightUniform.LaIndex, 0.0, 0.0, 0.0);
      gl.uniform3f(lightUniform.LdIndex, 0.0, 0.0, 0.0);
      gl.uniform3f(lightUniform.LsIndex, 0.0, 0.0, 0.0);
  }
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
  requestAnimationFrame(drawScene);
}

initWebGL();