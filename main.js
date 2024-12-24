//Gemma Reina Lara - u1987712
var gl, program;
var myZeta = 0.0, myPhi = Math.PI/2.0, radius = 4, fovy = 1.4;
var lightStates = [true, true, true]; // Estado de las luces (encendido/apagado)
var lightIntensities = [0.5, 0.5, 0.5]; // Intensidades de las luces

function getWebGLContext() {
  var canvas = document.getElementById("myCanvas");
  try {
    return canvas.getContext("webgl2");
  } catch (e) {}
  return null;
}

//Inicialización shaders
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
  
  //Creación y vinculación programa de shaders
  program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);
  
  //Uniformes
  program.vertexPositionAttribute = gl.getAttribLocation( program, "VertexPosition");
  gl.enableVertexAttribArray(program.vertexPositionAttribute);
  program.modelViewMatrixIndex  = gl.getUniformLocation( program, "modelViewMatrix");
  program.projectionMatrixIndex = gl.getUniformLocation( program, "projectionMatrix");
  
  //Normales
  program.vertexNormalAttribute = gl.getAttribLocation ( program, "VertexNormal");
  program.normalMatrixIndex     = gl.getUniformLocation( program, "normalMatrix");
  gl.enableVertexAttribArray(program.vertexNormalAttribute);

  //Material
  program.KaIndex               = gl.getUniformLocation( program, "Material.Ka");
  program.KdIndex               = gl.getUniformLocation( program, "Material.Kd");
  program.KsIndex               = gl.getUniformLocation( program, "Material.Ks");
  program.alphaIndex            = gl.getUniformLocation( program, "Material.alpha");

  //Fuentes de luz
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

//Inicialización render
function initRendering() { 
  gl.clearColor(0.95,0.95,0.95,1.0);
  gl.enable(gl.DEPTH_TEST);
  setShaderLight();
}

//Inicialización buffers
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

//Inicialización objetos de la escena
function initPrimitives() {
  initBuffers(examplePlane); //Planos
  initBuffers(exampleCube); //Cubo
  initBuffers(exampleSphere); //Esfera
  initBuffers(suzzane); //Suzzane
}

//Matriz de proyección en el shader
function setShaderProjectionMatrix(projectionMatrix) {
  gl.uniformMatrix4fv(program.projectionMatrixIndex, false, projectionMatrix);
}

//Matriz de modelo-vista en el shader
function setShaderModelViewMatrix(modelViewMatrix) {
  
  gl.uniformMatrix4fv(program.modelViewMatrixIndex, false, modelViewMatrix);
  
}

//Matriz de normales en el shader
function setShaderNormalMatrix(normalMatrix) {
  
  gl.uniformMatrix3fv(program.normalMatrixIndex, false, normalMatrix);
  
}

//Matriz de normales de una matriz de modelo-vista
function getNormalMatrix(modelViewMatrix) {
  
  return mat3.normalFromMat4(mat3.create(), modelViewMatrix);
  
}

//Matriz de proyección basada en los parámetros actuales
function getProjectionMatrix() {
  
  return mat4.perspective(mat4.create(), fovy, 1.0, 0.1, 100.0);
  
}

//Parámetros materiales en el shader
function setShaderMaterial(material) {
  gl.uniform3fv(program.KaIndex,    material.mat_ambient); //ambiental
  gl.uniform3fv(program.KdIndex,    material.mat_diffuse); //difuso
  gl.uniform3fv(program.KsIndex,    material.mat_specular); //especular
  gl.uniform1f (program.alphaIndex, material.alpha); //transparencia  
}

//Configuración las luces iniciales
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
}

//Modelo 3D sólido
function drawSolidOBJ(model) { 
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.vertexAttribPointer (program.vertexPositionAttribute, 3, gl.FLOAT, false, 0,   0);
  
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferNormals);
  gl.vertexAttribPointer (program.vertexNormalAttribute,   3, gl.FLOAT, false, 0, 0);
    
  gl.bindBuffer   (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.drawElements (gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
}

//Primitivas sólidas
function drawSolid(model) {    
  gl.bindBuffer (gl.ARRAY_BUFFER, model.idBufferVertices);
  gl.vertexAttribPointer (program.vertexPositionAttribute, 3, gl.FLOAT, false, 2*3*4,   0);
  gl.vertexAttribPointer (program.vertexNormalAttribute,   3, gl.FLOAT, false, 2*3*4, 3*4);
    
  gl.bindBuffer   (gl.ELEMENT_ARRAY_BUFFER, model.idBufferIndices);
  gl.drawElements (gl.TRIANGLES, model.indices.length, gl.UNSIGNED_SHORT, 0);
}

//Interacciones
function initHandlers() {
    const canvas = document.getElementById("myCanvas");
    const keys = {};
    let isMouseLocked = false;

    //Manejo de teclado
    document.addEventListener("keydown", (event) => {
        keys[event.key.toLowerCase()] = true;
    });

    document.addEventListener("keyup", (event) => {
        keys[event.key.toLowerCase()] = false;
    });

    //Control de ratón
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

    //Control de luces
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

    //Elementos de control
    var lightToggle1 = document.getElementById("light1-toggle");
    var lightToggle2 = document.getElementById("light2-toggle");
    var lightToggle3 = document.getElementById("light3-toggle");

    var intensitySlider1 = document.getElementById("light1-intensity");
    var intensitySlider2 = document.getElementById("light2-intensity");
    var intensitySlider3 = document.getElementById("light3-intensity");

    //Eventos para encender/apagar las luces
    lightToggle1.addEventListener("change", function() {
    lightStates[0] = this.checked;
    updateLight(0); // Actualizar la luz 1
    });

    lightToggle2.addEventListener("change", function() {
    lightStates[1] = this.checked;
    updateLight(1); // Actualizar la luz 2
    });

    lightToggle3.addEventListener("change", function() {
    lightStates[2] = this.checked;
    updateLight(2); // Actualizar la luz 3
    });

    //Eventos para cambiar la intensidad
    intensitySlider1.addEventListener("input", function() {
    lightIntensities[0] = parseFloat(this.value);
    updateLight(0); // Actualizar la luz 1
    });

    intensitySlider2.addEventListener("input", function() {
    lightIntensities[1] = parseFloat(this.value);
    updateLight(1); // Actualizar la luz 2
    });

    intensitySlider3.addEventListener("input", function() {
    lightIntensities[2] = parseFloat(this.value);
    updateLight(2); // Actualizar la luz 3
    });

    requestAnimationFrame(updateMovement);
}

//Cambiar color de la luz
function setColor(index, value, lightIndex) {
  var myColor = value.substr(1); // Para eliminar el # del #FCA34D

  var r = parseInt(myColor.charAt(0) + myColor.charAt(1), 16) / 255.0;
  var g = parseInt(myColor.charAt(2) + myColor.charAt(3), 16) / 255.0;
  var b = parseInt(myColor.charAt(4) + myColor.charAt(5), 16) / 255.0;

  gl.uniform3f(index, r, g, b); // Para la fuente de luz correspondiente
}

//Actualizar la luz (color, encendido/apagado, intensidad)
function updateLight(lightIndex) {
  var lightUniform = program.lightUniforms[lightIndex];
  var lightState = lightStates[lightIndex];
  var intensity = lightIntensities[lightIndex];

  if (!lightState) {
      // Apagar la luz
      gl.uniform3f(lightUniform.LaIndex, 0, 0, 0);
      gl.uniform3f(lightUniform.LdIndex, 0, 0, 0);
      gl.uniform3f(lightUniform.LsIndex, 0, 0, 0);
  } else {
      // Encender con intensidad
      gl.uniform3f(lightUniform.LaIndex, intensity, intensity, intensity);
      gl.uniform3f(lightUniform.LdIndex, intensity, intensity, intensity);
      gl.uniform3f(lightUniform.LsIndex, intensity, intensity, intensity);
  }
}

//Inicialización del programa
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
  // Llamada inicial para configurar las luces al inicio
  updateLight(0);
  updateLight(1);
  updateLight(2);
}

initWebGL();