// Función auxiliar para crear programas de shader
function createShaderProgram(vertexId, fragmentId) {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, document.getElementById(vertexId).text);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(vertexShader));
        return null;
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, document.getElementById(fragmentId).text);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(fragmentShader));
        return null;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    return program;
}

// Función para configurar las ubicaciones de los atributos y uniformes
function setupShaderProgram(program) {
    gl.useProgram(program);
    
    program.vertexPositionAttribute = gl.getAttribLocation(program, "VertexPosition");
    gl.enableVertexAttribArray(program.vertexPositionAttribute);

    program.modelViewMatrixIndex = gl.getUniformLocation(program, "modelViewMatrix");
    program.projectionMatrixIndex = gl.getUniformLocation(program, "projectionMatrix");
    
    program.vertexNormalAttribute = gl.getAttribLocation(program, "VertexNormal");
    program.normalMatrixIndex = gl.getUniformLocation(program, "normalMatrix");
    gl.enableVertexAttribArray(program.vertexNormalAttribute);

    program.KaIndex = gl.getUniformLocation(program, "Material.Ka");
    program.KdIndex = gl.getUniformLocation(program, "Material.Kd");
    program.KsIndex = gl.getUniformLocation(program, "Material.Ks");
    program.alphaIndex = gl.getUniformLocation(program, "Material.alpha");

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

// Función para cambiar entre shaders
function toggleShader() {
    isPhongActive = !isPhongActive;
    currentProgram = isPhongActive ? phongProgram : toonProgram;
    setupShaderProgram(currentProgram);
    setShaderLight(); // Actualizar las luces para el nuevo shader
}