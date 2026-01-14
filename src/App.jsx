import { useState, useEffect } from 'react'
import qz from 'qz-tray';

// --- CONFIGURACIÓN DEL MENÚ ---
const INGREDIENTES = {
  sizes: ["Large", "Small"],
  fillings: [
    "Chicken", "Chicken & Chorizo", "Chicken Tinga", "Pulled Pork",
    "Steak", "Barbacoa Beef", "Ground Beef", "Roasted Vegetables",
    "Jackfruit", "Vegan Chicken", "Mixed Beans"
  ],
  sauces: ["No Sauce", "Mild - Pico de Gallo", "Medium - Green Tomatillo", "Hot - Spicy Salsa"],
  toppings: ["Rice", "Black Beans", "Guacamole", "Cheese", "Sour Cream", "Lettuce", "Coriander", "Jalapeños"]
}

function App() {
  const [orden, setOrden] = useState([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [productoActual, setProductoActual] = useState(null)
  const [impresoraConectada, setImpresoraConectada] = useState(false)
  
  const [seleccion, setSeleccion] = useState({
    size: "Large",
    filling: INGREDIENTES.fillings[0],
    sauce: "No Sauce",
    toppings: []
  })

  // --- 1. INICIAR CONEXIÓN CON QZ TRAY AL CARGAR LA PÁGINA ---
  useEffect(() => {
    // Certificado de prueba para desarrollo (Evita errores de seguridad local)
    qz.security.setCertificatePromise((resolve, reject) => {
      resolve("-----BEGIN CERTIFICATE-----\n" +
        "MIIDatCCAlOgAwIBAgIUBzkS+l0i5iJ0xJbQ2f5s0W5c5B0wDQYJKoZIhvcNAQEL\n" +
        "BQAwRTELMAkGA1UEBhMCVVMxEzARBgNVBAgMCldhc2hpbmd0b24xEDAOBgNVBAcM\n" +
        "B1NlYXR0bGUxEXADBgNVBAoMCFFaIHRyYXkwHhcNMjMwNjMwMTMwNjE1WhcNMjQw\n" +
        "NjMwMTMwNjE1WjBFMQswCQYDVQQGEwJVUzETMBEGA1UECAwKV2FzaGluZ3RvbjEQ\n" +
        "MA4GA1UEBwwHU2VhdHRsZTERMA8GA1UECgwIUXogdHJheTCCASIwDQYJKoZIhvcN\n" +
        "AQEBBQADggEPADCCAQoCggEBAMKkNbvR5vW8xIqX0gGZ4w2b9sR8q2o6x3w5x6x8\n" +
        "y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8\n" +
        "y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8\n" +
        "y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8\n" +
        "y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8CAwEAAaMhMB8wHQYD\n" +
        "VR0OBBYEFJj7Yq5x6x8y4x5x6x8y4x5x6x8wDQYJKoZIhvcNAQELBQADggEBAFz5\n" +
        "x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5\n" +
        "x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5\n" +
        "x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5\n" +
        "x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5\n" +
        "x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5x6x8y4x5\n" +
        "-----END CERTIFICATE-----");
    });

    qz.security.setSignaturePromise((toSign) => {
        return function(resolve, reject) { resolve(); };
    });

    // Conectar con el software QZ Tray local
    if (!qz.websocket.isActive()) {
      qz.websocket.connect()
        .then(() => {
          setImpresoraConectada(true);
          console.log("Connected to QZ Tray");
        })
        .catch((e) => {
          console.error("Connection Error:", e);
          setImpresoraConectada(false);
        });
    }
  }, []);


  // --- 2. GENERADOR DE CÓDIGO ZPL ---
  const generarZPL = (item, indice, total) => {
    const toppings = item.toppings.length > 0 ? item.toppings.join(", ") : "N/A";
    const fecha = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    // ZPL para Zebra ZD230 (Ancho 812 dots)
    return `
^XA
^PW812
^MNN
^LL600
^FX --- HEADER ---
^FO0,0^GB812,120,80^FS
^FO0,30^A0N,60,60^FB812,1,0,C^FR^FD BURRITOS JOE ^FS
^FX --- INFO ---
^FO20,140^A0N,28,28^FDTime: ${fecha}^FS
^FO550,140^A0N,28,28^FDItem ${indice} of ${total}^FS
^FO20,170^GB772,2,2^FS
^FX --- PRODUCT ---
^FO20,200^A0N,70,70^FB772,1,0,C^FD${item.producto.toUpperCase()}^FS
^FO20,270^A0N,40,40^FB772,1,0,C^FD(${item.size})^FS
^FX --- DETAILS ---
^FO20,330^GB772,250,2^FS
^FO40,350^A0N,30,30^FDFILLING:^FS
^FO250,350^A0N,30,30^FD${item.filling}^FS
^FO40,400^A0N,30,30^FDSAUCE:^FS
^FO250,400^A0N,30,30^FD${item.sauce}^FS
^FO40,450^A0N,30,30^FDTOPPINGS:^FS
^FO40,490^A0N,25,25^FB730,3,0,L^FD${toppings}^FS
^FX --- FOOTER ---
^FO20,620^A0N,20,20^FDCustomer Order - Thank You!^FS
^XZ`;
  }

  // --- 3. FUNCIÓN DE IMPRESIÓN REAL ---
  const manejarImpresion = async () => {
    if (orden.length === 0) return alert("Order is empty!");
    if (!impresoraConectada) return alert("ERROR: QZ Tray not detected. Make sure the software is running on the PC.");

    try {
      // a. Buscar la impresora Zebra
      // Nota: Busca cualquier impresora que tenga "Zebra" en el nombre
      const printers = await qz.printers.find("Zebra"); 
      
      // Si no encuentra una que diga "Zebra", usa la predeterminada del sistema
      const config = qz.configs.create(printers || null); 

      const datosAImprimir = [];
      orden.forEach((item, index) => {
        datosAImprimir.push(generarZPL(item, index + 1, orden.length));
      });

      // b. Enviar a imprimir
      await qz.print(config, datosAImprimir);
      
      alert("Sent to printer successfully! 🖨️");
      setOrden([]); // Limpiar orden después de imprimir
    } catch (err) {
      console.error(err);
      alert("Print Error: " + err.message);
    }
  }

  // Lógica de interfaz (Modales, botones)...
  const abrirModal = (producto) => {
    setProductoActual(producto)
    setSeleccion({ size: "Large", filling: INGREDIENTES.fillings[0], sauce: "No Sauce", toppings: [] })
    setModalAbierto(true)
  }
  const toggleTopping = (topping) => {
    setSeleccion(prev => {
        return prev.toppings.includes(topping) 
        ? { ...prev, toppings: prev.toppings.filter(t => t !== topping) } 
        : { ...prev, toppings: [...prev.toppings, topping] }
    })
  }
  const agregarAOrden = () => {
    setOrden([...orden, { id: Date.now(), producto: productoActual, ...seleccion }])
    setModalAbierto(false)
  }
  const eliminarItem = (id) => setOrden(orden.filter(item => item.id !== id))

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-sans">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-extrabold text-red-700 tracking-wider">BURRITOS JOE</h1>
        <p className="text-gray-500 font-medium">
          Estado Impresora: <span className={impresoraConectada ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
            {impresoraConectada ? "CONNECTED ✅" : "DISCONNECTE ❌"}
          </span>
        </p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {['Burrito', 'Naked Burrito', 'Quesadilla', 'Tacos'].map((prod) => (
              <button key={prod} onClick={() => abrirModal(prod)} className="h-28 bg-white rounded-xl shadow-sm hover:shadow-lg hover:bg-orange-50 border-2 border-transparent hover:border-orange-500 transition flex flex-col items-center justify-center gap-2">
                <span className="text-3xl">{prod === 'Burrito' ? '🌯' : prod === 'Tacos' ? '🌮' : prod === 'Quesadilla' ? '🧀' : '🥗'}</span>
                <span className="text-lg font-bold text-gray-700">{prod}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg h-fit flex flex-col">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex justify-between">
            Orden Actual <span className="bg-red-100 text-red-700 text-sm px-3 py-1 rounded-full font-bold">{orden.length}</span>
          </h2>
          <div className="flex-1 min-h-[300px] max-h-[500px] overflow-y-auto space-y-3 mb-4">
             {orden.length === 0 && <div className="text-center text-gray-400 mt-10">Empty Order</div>}
             {orden.map((item) => (
                <div key={item.id} className="border p-3 rounded bg-gray-50 relative">
                  <button onClick={() => eliminarItem(item.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 font-bold">X</button>
                  <div className="font-bold">{item.producto} ({item.size})</div>
                  <div className="text-sm text-gray-600">{item.filling}, {item.sauce}</div>
                </div>
             ))}
          </div>
          <button onClick={manejarImpresion} className="w-full bg-gray-900 text-white font-bold py-4 rounded-lg text-xl hover:bg-black transition shadow-lg">PRINT ORDER 🖨️</button>
        </div>
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-2xl font-bold mb-4">{productoActual}</h3>
            {/* OPCIONES DE SELECCIÓN */}
            <div className="space-y-4">
                <div><p className="font-bold">Size:</p> <div className="flex gap-2">{INGREDIENTES.sizes.map(s => <button key={s} onClick={() => setSeleccion({...seleccion, size: s})} className={`px-4 py-2 border rounded ${seleccion.size === s ? 'bg-orange-500 text-white' : ''}`}>{s}</button>)}</div></div>
                <div><p className="font-bold">Filling:</p> <div className="grid grid-cols-3 gap-2">{INGREDIENTES.fillings.map(f => <button key={f} onClick={() => setSeleccion({...seleccion, filling: f})} className={`p-2 text-xs border rounded ${seleccion.filling === f ? 'bg-orange-100 border-orange-500' : ''}`}>{f}</button>)}</div></div>
                <div><p className="font-bold">Sauce:</p> <div className="grid grid-cols-2 gap-2">{INGREDIENTES.sauces.map(s => <button key={s} onClick={() => setSeleccion({...seleccion, sauce: s})} className={`p-2 text-xs border rounded ${seleccion.sauce === s ? 'bg-green-100 border-green-500' : ''}`}>{s}</button>)}</div></div>
                <div><p className="font-bold">Toppings:</p> <div className="grid grid-cols-3 gap-2">{INGREDIENTES.toppings.map(t => <button key={t} onClick={() => toggleTopping(t)} className={`p-2 text-xs border rounded ${seleccion.toppings.includes(t) ? 'bg-blue-100 border-blue-500' : ''}`}>{t}</button>)}</div></div>
            </div>
            <div className="mt-6 flex gap-4">
                <button onClick={() => setModalAbierto(false)} className="flex-1 py-3 bg-gray-200 rounded font-bold">Cancel</button>
                <button onClick={agregarAOrden} className="flex-1 py-3 bg-green-600 text-white rounded font-bold">Add to Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App