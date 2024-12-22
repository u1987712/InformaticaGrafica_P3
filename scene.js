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
    drawSolidOBJ(suzzane);
  
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