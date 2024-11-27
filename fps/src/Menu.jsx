
function Menu({ onStartGame }) {
  return (
    <div style={styles.menuContainer}>
      <h1 style={styles.title}>Bienvenido</h1>
      <button style={styles.startButton} onClick={onStartGame}>
        Iniciar
      </button>
    </div>
  );
}

const styles = {
    menuContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh', // Ocupa toda la altura del viewport
      width: '100vw',  // Ocupa toda la anchura del viewport
      backgroundColor: '#fff',
      color: '#040404',
      fontFamily: 'Arial, sans-serif',
      margin: 0, // Asegura que no haya márgenes por defecto
      padding: 0, // Asegura que no haya rellenos
    },
    title: {
      fontSize: '3rem',
      marginBottom: '20px',
    },
    startButton: {
      fontSize: '1.5rem',
      padding: '10px 20px',
      cursor: 'pointer',
      backgroundColor: '#f41a1a',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      transition: 'background-color 0.3s',
    },
  };
  
  // Asegúrate de que el body y html también tengan el 100% de altura
  document.body.style.margin = 0;
  document.body.style.height = '100%';
  document.documentElement.style.height = '100%';
  

export default Menu;
