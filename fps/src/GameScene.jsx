import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import disparo from './assets/disparo.mp3';
import musica from './assets/musica.mp3';
import punto from './assets/punto.mp3';



function App() {
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const raycaster = new THREE.Raycaster();
  const [isLocked, setIsLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(200);
  const [disappearedCubes, setDisappearedCubes] = useState(0);




  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    camera.rotation.order = 'YXZ';
    cameraRef.current = camera;

    // Crear el contexto de audio y el objeto de audio
const listener = new THREE.AudioListener();
camera.add(listener);  // Agregar el oyente de audio a la cámara

// Crear el objeto de música de fondo
const backgroundMusic = new THREE.Audio(listener);

// Cargar la música de fondo
const audioLoader = new THREE.AudioLoader();
audioLoader.load(musica, (buffer) => {
  backgroundMusic.setBuffer(buffer);
  backgroundMusic.setLoop(true);  // Hacer que la música se repita en bucle
  backgroundMusic.setVolume(0.1);  // Ajustar el volumen (0.0 a 1.0)
  backgroundMusic.play();  // Reproducir la música
});

    // Añadir luz ambiental para iluminar todos los objetos de manera uniforme
    // Luz hemisférica: Simula luz ambiental suave y de dos colores
const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 1); // Color de luz superior, color inferior y intensidad
scene.add(hemisphereLight);


    // Añadir luz direccional para dar más profundidad a la escena
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Luz blanca
    directionalLight.position.set(5, 10, 7); // Ajusta la posición de la luz
    scene.add(directionalLight);

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Cargar la textura del suelo

    // Crear el suelo
    const floorGeometry = new THREE.PlaneGeometry(500, 500);
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

      // Crear el cuarto con paredes más pequeñas
    const wallMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });

    // Reducir las dimensiones del cuarto
    const wallWidth = 200;  // Ancho de las paredes
    const wallHeight = 100; // Altura de las paredes
    const wallDepth = 10;   // Grosor de las paredes

    // Pared frontal
    const frontWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth),
      wallMaterial
    );
    frontWall.position.z = -100; // Coloca la pared frente al usuario
    scene.add(frontWall);

    // Pared trasera
    const backWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallWidth, wallHeight, wallDepth),
      wallMaterial
    );
    backWall.position.z = 100;
    scene.add(backWall);

    // Pared izquierda
    const leftWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallDepth, wallHeight, wallWidth),
      wallMaterial
    );
    leftWall.position.x = -100;
    scene.add(leftWall);

    // Pared derecha
    const rightWall = new THREE.Mesh(
      new THREE.BoxGeometry(wallDepth, wallHeight, wallWidth),
      wallMaterial
    );
    rightWall.position.x = 100;
    scene.add(rightWall);

    // Techo
    const ceiling = new THREE.Mesh(
      new THREE.BoxGeometry(wallWidth, wallDepth, wallWidth),
      wallMaterial
    );
    ceiling.position.y = 45; // Eleva el techo hacia arriba
    scene.add(ceiling);

    // Piso (ya lo tenemos con el suelo creado antes)

    // Posicionar la cámara dentro del cuarto
    camera.position.set(0, 50, 150); // Cámara más cerca del centro
    camera.lookAt(new THREE.Vector3(0, 50, 0)); // Mirar al centro del cuarto

    // Objetos en la escena (varios cubos con materiales únicos)
    // Generación de cubos aleatorios
const objects = [];
const objectGeometry = new THREE.BoxGeometry(2, 2, 2);
const cubeVelocities = [];

const spawnCube = () => {
  const objectMaterial = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
  const tempCube = new THREE.Mesh(objectGeometry, objectMaterial);
  
  // Generar posiciones aleatorias dentro del cuarto
  tempCube.position.set(
    Math.random() * wallWidth - wallWidth / 2, // Aleatorio en el eje X
    Math.random() * (wallHeight - 10),        // Aleatorio en el eje Y (altura)
    Math.random() * wallWidth - wallWidth / 2 // Aleatorio en el eje Z
  );
  scene.add(tempCube);
  objects.push(tempCube);

  // Inicializar velocidad aleatoria para el cubo
  const velocity = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize().multiplyScalar(0.1);
  cubeVelocities.push(velocity);
};

// Llamar a spawnCube de manera infinita
const spawnInterval = setInterval(() => {
  spawnCube();
}, 250); // Genera un cubo cada 500 ms (ajusta a tu gusto)

    // Arma (cubo rojo)
    const weaponGeometry = new THREE.BoxGeometry(0.5, 0.5, 2);
    const weaponMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
    camera.add(weapon);
    scene.add(camera);
    weapon.position.set(0.5, -0.5, -1); // Posición relativa al POV

    camera.position.set(0, 5, 10); // Cámara inicial

    
    // Manejo de disparos

  const point = new Audio(punto); 
  const shootRay = () => {
  raycaster.setFromCamera({ x: 0, y: 0 }, cameraRef.current);
  const intersects = raycaster.intersectObjects(objects);

  if (intersects.length > 0) {
    const hitObject = intersects[0].object;

    // Cambiar el color a rojo
    point.play();
    hitObject.material.color.set(0xff0000);
    console.log('Impacto detectado en:', hitObject);

    // Incrementar el contador de cubos desaparecidos
    setDisappearedCubes(prev => prev + 1);

    // Eliminar el cubo después de 2 segundos
    setTimeout(() => {
      hitObject.material.color.set(0x00ff00); // Restaurar color
      hitObject.visible = false; // Hacerlo invisible
    }, 2000);
  } else {
    console.log('Sin impacto');
  }
};

    
    // Variables para movimiento y salto de la cámara
    const keysPressed = { w: false, a: false, s: false, d: false, space: false };
    const cameraSpeed = 0.5;

    let isJumping = false;
    let jumpVelocity = 0;
    const gravity = -0.015;
    const jumpForce = 0.6;
    const groundHeight = 5;

    // Manejo de teclas
    const handleKeyDown = (event) => {
      if (event.key === ' ') {
        event.preventDefault();
        if (!isJumping) {
          isJumping = true;
          jumpVelocity = jumpForce;
        }
      }
      if (event.key === 'w') keysPressed.w = true;
      if (event.key === 'a') keysPressed.a = true;
      if (event.key === 's') keysPressed.s = true;
      if (event.key === 'd') keysPressed.d = true;
    };

    const handleKeyUp = (event) => {
      if (event.key === 'w') keysPressed.w = false;
      if (event.key === 'a') keysPressed.a = false;
      if (event.key === 's') keysPressed.s = false;
      if (event.key === 'd') keysPressed.d = false;
    };

    const shootSound = new Audio(disparo); 

    // Event listener para el clic izquierdo
    const onMouseClick = (event) => {
      if (event.button === 0) { // 0 es el clic izquierdo
        shootRay(); // Dispara el rayo
        shootSound.play();
      }
    };

    // Añadir evento de clic izquierdo
    document.addEventListener('mousedown', onMouseClick);

    // Bloquear el cursor al hacer clic en el canvas
    const onClickCanvas = () => {
      const canvas = canvasRef.current;
      canvas.requestPointerLock(); // Solicitar el bloqueo del puntero
    };

    canvasRef.current.addEventListener('click', onClickCanvas);

    // Función para liberar el cursor
    const onPointerLockChange = () => {
      if (document.pointerLockElement === canvasRef.current) {
        setIsLocked(true); // Cambiar el estado cuando el cursor esté bloqueado
      } else {
        setIsLocked(false); // Cambiar el estado cuando el cursor se libera
      }
    };

    document.addEventListener('pointerlockchange', onPointerLockChange);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Manejo de movimiento del ratón para la cámara
    const onMouseMove = (event) => {
      if (!isLocked) return; // Solo procesar si el cursor está bloqueado

      const movementX = event.movementX || 0;
      const movementY = event.movementY || 0;

      // Rotar la cámara
      const camera = cameraRef.current;
      camera.rotation.y -= movementX / 500; // Movimiento horizontal (Y)
      camera.rotation.x -= movementY / 500; // Movimiento vertical (X)

      // Limitar la rotación vertical de la cámara para evitar voltear
      camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));
    };

    document.addEventListener('mousemove', onMouseMove);

    // Función de animación
    const animate = () => {
      requestAnimationFrame(animate);
    
      const camera = cameraRef.current;
    
      // Calcular dirección de la cámara sin afectar el eje Y (no mover hacia arriba o abajo)
      const direction = new THREE.Vector3();
      camera.getWorldDirection(direction); // Dirección en la que la cámara está mirando
    
      // Establecer la dirección en Y a 0 para evitar movimiento hacia arriba/abajo
      direction.y = 0; 
      direction.normalize(); // Normalizamos el vector
    
      // Calcular el vector 'right' para moverse horizontalmente en el eje X
      const right = new THREE.Vector3();
      right.crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();
    
      // Crear un vector de movimiento
      const movement = new THREE.Vector3();
    
      // Movimiento hacia adelante (W) o hacia atrás (S)
      if (keysPressed.w) movement.add(direction);  // Avanzar
      if (keysPressed.s) movement.sub(direction);  // Retroceder
      // Movimiento hacia la izquierda (A) o derecha (D)
      if (keysPressed.a) movement.sub(right);     // Mover a la izquierda
      if (keysPressed.d) movement.add(right);     // Mover a la derecha
    
      // Movimiento hacia arriba o hacia abajo (espacio o shift)
      if (keysPressed.space) camera.position.y += cameraSpeed;  // Subir
      if (keysPressed.shift) camera.position.y -= cameraSpeed;  // Bajar
    
      // Normalizar el movimiento y aplicarlo
      if (movement.length() > 0) {
        movement.normalize().multiplyScalar(cameraSpeed);
        camera.position.add(movement);  // Actualizamos la posición de la cámara
      }

      // Manejo del salto
      if (isJumping) {
        camera.position.y += jumpVelocity;
        jumpVelocity += gravity;
    
        if (camera.position.y <= groundHeight) {
          camera.position.y = groundHeight;
          isJumping = false;
        }
      } else {
        camera.position.y = groundHeight;
      }

      // Mover y rotar los cubos
      for (let i = 0; i < objects.length; i++) {
        const cube = objects[i];
        const velocity = new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize().multiplyScalar(0.6); // Movimiento más rápido

        // Mover cubo según su velocidad
        cube.position.add(velocity);

        // Rebotar cubos en los bordes (evitar que salgan de la escena)
        if (Math.abs(cube.position.x) > 25) velocity.x = -velocity.x;
        if (Math.abs(cube.position.z) > 25) velocity.z = -velocity.z;

        // Hacer que el cubo rote continuamente sobre sí mismo
        cube.rotation.x += 0.5; // Rotación sobre el eje X
        cube.rotation.y += 0.5; // Rotación sobre el eje Y
      }

      // Actualizar la posición de los cubos
objects.forEach((object, index) => {
  const velocity = cubeVelocities[index];
  object.position.add(velocity);

  // Eliminar cubos fuera de los límites del cuarto
  if (
    Math.abs(object.position.x) > wallWidth / 2 ||
    Math.abs(object.position.z) > wallWidth / 2 ||
    object.position.y < 0
  ) {
    scene.remove(object);
    objects.splice(index, 1);
    cubeVelocities.splice(index, 1);
  }
});


      renderer.render(scene, camera);
    };

    animate();

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseClick);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      clearInterval(spawnInterval);
      clearInterval(timer);
    };
  }, [isLocked]);

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
  
      {/* Mostrar el punto blanco en el centro de la pantalla */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '6px',
        height: '6px',
        backgroundColor: 'white',
        borderRadius: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none', // Evitar que interfiera con otros eventos
        border: '3px solid black' // Añadir un borde negro de 2px
      }} />
  
      {/* Mostrar el temporizador */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        color: 'Black',
        fontSize: '20px',
      }}>
        Tiempo restante: {timeLeft} s
      </div>
  
      {/* Mostrar el contador de cubos desaparecidos */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '10px',
        color: 'Black',
        fontSize: '20px',
      }}>
        Cubos desaparecidos: {disappearedCubes}
      </div>
    </div>
  );
}

export default App;