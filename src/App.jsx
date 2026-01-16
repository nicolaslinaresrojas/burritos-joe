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
  toppings: ["Rice", "Black Beans", "Guacamole", "Cheese", "Sour Cream", "Lettuce", "Coriander", "Jalapenos"],
  // AGREGA ESTO AL FINAL (OJO CON LA COMA ANTERIOR):
  extras: ["Meat", "Rice", "Black Beans", "Mild Salsa", "Medium Salsa", "Spicy Sauce", "Guacamole", "Cheese", "Lettuce", "Coriander", "Jalapenos", "Sour Cream"]
}

function App() {
  const [orden, setOrden] = useState([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const [productoActual, setProductoActual] = useState(null)
  const [impresoraConectada, setImpresoraConectada] = useState(false)
  
  const [seleccion, setSeleccion] = useState({
    orderRef: "", // <-- NUEVO: Para el numero de referencia
    size: "Large",
    filling: INGREDIENTES.fillings[0],
    sauce: "No Sauce",
    toppings: [],
    extras: []    // <-- NUEVO: Para los extras
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
  // --- 2. GENERADOR DE CÓDIGO ZPL (AJUSTADO: REF MAS PEQUEÑO Y BAJO) ---
  const generarZPL = (item, indice, total) => {
    // Preparar textos
    const exclusions = item.toppings.length > 0 ? item.toppings.join(", ") : "None"; 
    const extrasList = item.extras.length > 0 ? item.extras.join(", ") : "None";
    const refNumber = item.orderRef ? `#${item.orderRef}` : "N/A";
    const fecha = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    // ^PW832 = Ancho 104mm
    // ^LL406 = Alto 50.8mm
    return `
^XA
^PW832
^MNN
^LL382

^FX --- HEADER COMPACTO ---
^FO0,0^GB832,50,50^FS
^FO20,10^A0N,35,35^FR^FD BURRITO JOE ^FS
^FO550,10^A0N,25,25^FR^FD${indice}/${total}^FS

^FX --- INFO & REF (AJUSTADO AQUI) ---
^FO650,10^A0N,25,25^FR^FDTime: ${fecha}^FS

^FX "Ref Order:" un poquito mas abajo para alinear
^FO20,58^A0N,25,25^FDRef Order:^FS

^FX El Numero # un poco mas pequeño (28) y mas abajo (58)
^FO140,58^A0N,28,28^FD${refNumber}^FS

^FX --- LINEA SEPARADORA (Bajada a 90 para dar espacio) ---
^FO10,90^GB812,2,2^FS

^FX --- PRODUCTO ---
^FO20,100^A0N,45,45^FD${item.producto.toUpperCase()} (${item.size})^FS

^FX --- DETALLES ---
^FO20,150^A0N,25,25^FDFilling: ${item.filling}^FS
^FO20,180^A0N,25,25^FDSauce: ${item.sauce}^FS

^FX --- NO TOPPINGS ---
^FO20,250^A0N,25,25^FDREMOVE INGREDIENTS: ${exclusions}^FS

^FX --- EXTRAS ---
^FO20,215^A0N,25,25^FDEXTRAS: ${extrasList}^FS

^FX --- FOOTER ---
^FO20,360^A0N,20,20^FDCustomer Order - Thank You!^FS
^XZ`;
  }

  // --- 3. FUNCIÓN DE IMPRESIÓN REAL ---
  // --- 3. PRINT HANDLER (UPDATED FOR ZDESIGNER) ---
  // --- 3. PRINT HANDLER (NUCLEAR OPTION - DEFAULT PRINTER) ---
  // --- 3. PRINT HANDLER (BLINDADO CONTRA DESCONEXIONES) ---
  const manejarImpresion = async () => {
    if (orden.length === 0) return alert("Order is empty!");

    try {
      // PASO 0: VERIFICACIÓN DE SEGURIDAD (RESUCITACIÓN)
      // Si el puente se cayó, lo levantamos de nuevo aquí mismo.
      if (!qz.websocket.isActive()) {
        console.log("Connection lost... Reconnecting...");
        await qz.websocket.connect();
        setImpresoraConectada(true);
      }

      // PASO 1: BUSCAR IMPRESORA POR DEFECTO
      const defaultPrinter = await qz.printers.getDefault();
      const config = qz.configs.create(defaultPrinter); 

      const datosAImprimir = [];
      orden.forEach((item, index) => {
        datosAImprimir.push(generarZPL(item, index + 1, orden.length));
      });

      // PASO 2: ENVIAR
      await qz.print(config, datosAImprimir);
      
      alert(`Sent to printer! (${defaultPrinter}) 🖨️`);
      setOrden([]); 

    } catch (err) {
      console.error(err);
      // Si el error es justamente ese de "sendData", avisamos claro:
      if (err.message && err.message.includes("sendData")) {
        alert("Connection Error: QZ Tray seems closed. Please open the green printer icon and try again.");
      } else {
        alert("CRITICAL ERROR: " + err.message);
      }
      // Actualizamos el estado visual para que sepan que se cayó
      if (!qz.websocket.isActive()) setImpresoraConectada(false);
    }
  }

  // Lógica de interfaz (Modales, botones)...
  // Lógica de interfaz (Modales, botones)...
  const abrirModal = (producto) => {
    setProductoActual(producto)
    // REINICIAMOS TODO (INCLUYENDO REF Y EXTRAS)
    setSeleccion({ 
      orderRef: "", 
      size: "Large", 
      filling: INGREDIENTES.fillings[0], 
      sauce: "No Sauce", 
      toppings: [],
      extras: [] 
    })
    setModalAbierto(true)
  }

  const toggleTopping = (topping) => {
    setSeleccion(prev => {
        return prev.toppings.includes(topping) 
        ? { ...prev, toppings: prev.toppings.filter(t => t !== topping) } 
        : { ...prev, toppings: [...prev.toppings, topping] }
    })
  }

  // --- AGREGA ESTA FUNCION NUEVA AQUI ---
  const toggleExtra = (extra) => {
    setSeleccion(prev => {
        return prev.extras.includes(extra) 
        ? { ...prev, extras: prev.extras.filter(e => e !== extra) } 
        : { ...prev, extras: [...prev.extras, extra] }
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
        <h1 className="text-4xl font-extrabold text-red-700 tracking-wider">BURRITO JOE</h1>
        <p className="text-gray-500 font-medium">
          Printer Status: <span className={impresoraConectada ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
            {impresoraConectada ? "CONNECTED ✅" : "DISCONNECTED ❌"}
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
            Current Order <span className="bg-red-100 text-red-700 text-sm px-3 py-1 rounded-full font-bold">{orden.length} items</span>
          </h2>
          <div className="flex-1 min-h-[300px] max-h-[500px] overflow-y-auto space-y-3 mb-4">
             {orden.length === 0 && <div className="text-center text-gray-400 mt-10">Empty Order</div>}
             {orden.map((item) => (
                <div key={item.id} className="border p-3 rounded bg-gray-50 relative group">
                  <button onClick={() => eliminarItem(item.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 font-bold">X</button>
                  <div className="font-bold">#{item.orderRef} - {item.producto} ({item.size})</div>
                  <div className="text-sm text-gray-600">{item.filling}, {item.sauce}</div>
                  {item.extras.length > 0 && <div className="text-xs text-green-700 font-bold">Extra: {item.extras.join(", ")}</div>}
                  {item.toppings.length > 0 && <div className="text-xs text-red-600 font-bold">No: {item.toppings.join(", ")}</div>}
                </div>
             ))}
          </div>
          <button onClick={manejarImpresion} className="w-full bg-gray-900 text-white font-bold py-4 rounded-lg text-xl hover:bg-black transition shadow-lg">PRINT ORDER 🖨️</button>
        </div>
      </div>

      {/* MODAL */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            
            {/* 1. ORDER REFERENCE INPUT (NUEVO) */}
            <div className="mb-6 flex justify-between items-center border-b pb-4">
                <h3 className="text-2xl font-bold">{productoActual}</h3>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-700">Order Ref #:</span>
                    <input 
                        type="number" 
                        value={seleccion.orderRef}
                        onChange={(e) => setSeleccion({...seleccion, orderRef: e.target.value})}
                        className="border-2 border-gray-300 rounded-lg p-2 w-24 text-2xl font-bold text-center focus:border-orange-500 outline-none"
                        placeholder="0"
                    />
                </div>
            </div>
            
            <div className="space-y-4">
                {/* SIZE */}
                <div>
                    <p className="font-bold">Size:</p> 
                    <div className="flex gap-2">
                        {INGREDIENTES.sizes.map(s => (
                            <button key={s} onClick={() => setSeleccion({...seleccion, size: s})} 
                            className={`px-4 py-2 border rounded ${seleccion.size === s ? 'bg-orange-500 text-white' : ''}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* FILLING */}
                <div>
                    <p className="font-bold">Filling:</p> 
                    <div className="grid grid-cols-3 gap-2">
                        {INGREDIENTES.fillings.map(f => (
                            <button key={f} onClick={() => setSeleccion({...seleccion, filling: f})} 
                            className={`p-2 text-xs border rounded ${seleccion.filling === f ? 'bg-orange-100 border-orange-500' : ''}`}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* SAUCE */}
                <div>
                    <p className="font-bold">Sauce:</p> 
                    <div className="grid grid-cols-2 gap-2">
                        {INGREDIENTES.sauces.map(s => (
                            <button key={s} onClick={() => setSeleccion({...seleccion, sauce: s})} 
                            className={`p-2 text-xs border rounded ${seleccion.sauce === s ? 'bg-blue-100 border-blue-500' : ''}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* NO TOPPINGS */}
                <div>
                    <p className="font-bold text-red-600">No Toppings (Remove Ingredients):</p> 
                    <div className="grid grid-cols-3 gap-2">
                        {INGREDIENTES.toppings.map(t => (
                            <button key={t} onClick={() => toggleTopping(t)} 
                            className={`p-2 text-xs border rounded ${seleccion.toppings.includes(t) ? 'bg-red-100 border-red-500 text-red-800' : ''}`}>
                                {t} {seleccion.toppings.includes(t) && "❌"}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

                {/* EXTRAS (NUEVA SECCIÓN) */}
                <div>
                    <p className="font-bold text-green-700">Extras (Add):</p> 
                    <div className="grid grid-cols-3 gap-2">
                        {INGREDIENTES.extras.map(e => (
                            <button key={e} onClick={() => toggleExtra(e)} 
                            className={`p-2 text-xs border rounded ${seleccion.extras.includes(e) ? 'bg-green-100 border-green-500 text-green-800 font-bold' : ''}`}>
                                {e} {seleccion.extras.includes(e) && "➕"}
                            </button>
                        ))}
                    </div>
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