// Variables de cámara
var cameraPosition = [0.0, 2.0, 5.0];  // Posición inicial más cercana al suelo
var cameraFront = [0.0, 0.0, -1.0];    // Mirando hacia adelante por defecto
var cameraUp = [0.0, 1.0, 0.0];
var yaw = -90.0;                       // Rotación inicial
var pitch = 0.0;
var moveSpeed = 0.1;                   // Velocidad reducida para más control
var sensitivity = 0.1;

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
    // Dimensiones de la habitación
    const roomWidth = 20.0;
    const roomDepth = 20.0;
    const collisionMargin = 0.5;
    
    // Límites de la habitación
    const minX = -roomWidth/2 + collisionMargin;
    const maxX = roomWidth/2 - collisionMargin;
    const minZ = -roomDepth/2 + collisionMargin;
    const maxZ = roomDepth/2 - collisionMargin;
    
    // Dimensiones del cubo
    const cubePosition = [0.0, 0.5, 0.0];  // Posición del centro del cubo
    const cubeSize = 1.0;  // Tamaño del cubo
    const cubeMargin = collisionMargin;
    
    // Comprobar colisión con el cubo
    const distanceToCube = {
        x: Math.abs(newPosition[0] - cubePosition[0]),
        z: Math.abs(newPosition[2] - cubePosition[2])
    };
  
    // Si estamos dentro del área del cubo
    if (distanceToCube.x < (cubeSize/2 + cubeMargin) && 
        distanceToCube.z < (cubeSize/2 + cubeMargin)) {
        
        // Calcular la dirección desde la que venimos
        const fromDirection = vec3.subtract(vec3.create(), newPosition, cameraPosition);
        
        // Determinar en qué lado del cubo estamos y ajustar la posición
        if (distanceToCube.x > distanceToCube.z) {
            // Colisión en el eje X
            newPosition[0] = cubePosition[0] + 
                           (newPosition[0] > cubePosition[0] ? 1 : -1) * 
                           (cubeSize/2 + cubeMargin);
        } else {
            // Colisión en el eje Z
            newPosition[2] = cubePosition[2] + 
                           (newPosition[2] > cubePosition[2] ? 1 : -1) * 
                           (cubeSize/2 + cubeMargin);
        }
    }
    
    // Aplicar restricciones de la habitación
    return [
        Math.max(minX, Math.min(maxX, newPosition[0])),
        newPosition[1],
        Math.max(minZ, Math.min(maxZ, newPosition[2]))
    ];
}

function getCameraMatrix() {
    const target = vec3.create();
    vec3.add(target, cameraPosition, cameraFront);
    return mat4.lookAt(mat4.create(), cameraPosition, target, cameraUp);
}