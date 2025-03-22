import React, { useState, useEffect } from 'react';
import { Rocket, Sparkles, Bot, MessageSquareCode, ChevronRight, Youtube, MessageSquare, Send, X } from 'lucide-react';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { text: '¡Hola! Soy el asistente virtual de Albert Digital. ¿En qué puedo ayudarte hoy?', isBot: true }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Production webhook URL
  const WEBHOOK_URL = 'https://evolutionapi-n8n.v8gqyx.easypanel.host/webhook/4338972a-a0f6-4f5f-b530-fdb981975369';

  const sendWebhookRequest = async (payload: any, attempt = 0): Promise<any> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
        credentials: 'omit'
      });

      clearTimeout(timeoutId);

      if (response.status === 500) {
        throw new Error('El servidor está experimentando problemas temporales. Por favor, intenta de nuevo.');
      } else if (response.status === 429) {
        throw new Error('Demasiadas solicitudes. Por favor, espera un momento antes de intentar de nuevo.');
      } else if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Respuesta del servidor en formato incorrecto');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('La solicitud tardó demasiado tiempo. Por favor, intenta de nuevo.');
      }

      if (attempt < 2) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return sendWebhookRequest(payload, attempt + 1);
      }
      throw error;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    const newMessages = [...messages, { text: userMessage, isBot: false }];
    setMessages(newMessages);

    try {
      const payload = {
        text: userMessage,
        number: "whatsapp",
        type: "text"
      };

      const data = await sendWebhookRequest(payload);
      
      let botResponse = 'Entiendo tu mensaje. ¿Hay algo más en lo que pueda ayudarte?';

      if (data && Array.isArray(data) && data[0]) {
        if (typeof data[0].output === 'string' && data[0].output.trim() && data[0].output !== '{{ $json.output }}') {
          botResponse = data[0].output;
        } else if (data[0].error) {
          throw new Error(data[0].error);
        }
      }
      
      setMessages([...newMessages, { text: botResponse, isBot: true }]);
    } catch (error) {
      console.error('Error en la comunicación:', error instanceof Error ? error.message : 'Error desconocido');
      
      let errorMessage = 'Lo siento, hubo un problema al procesar tu mensaje. Por favor, intenta de nuevo en unos momentos.';
      
      if (error instanceof Error) {
        if (error.message.includes('tardó demasiado tiempo')) {
          errorMessage = 'La conexión está lenta. Por favor, intenta de nuevo.';
        } else if (error.message.includes('problemas temporales')) {
          errorMessage = 'El servicio está temporalmente no disponible. Por favor, intenta más tarde.';
        }
      }

      setMessages([...newMessages, { text: errorMessage, isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const chatWindowClasses = isMobile
    ? 'fixed inset-0 bg-black/95 z-50 flex flex-col'
    : 'fixed bottom-4 right-4 w-96 h-[500px] bg-black/95 border border-gray-500/20 rounded-2xl shadow-xl z-50 flex flex-col';

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-black to-black text-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/80"></div>
          <div className="absolute inset-0 animate-gradient" style={{
            backgroundImage: 'radial-gradient(circle at center, transparent 0%, transparent 50%, rgba(0,0,0,0.8) 100%), url("https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.4,
            mixBlendMode: 'screen'
          }}></div>
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/10 animate-float animate-glow" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-3/4 right-1/4 w-48 h-48 rounded-full bg-purple-500/10 animate-float animate-glow" style={{ animationDelay: '-2s' }}></div>
          <div className="absolute top-1/2 left-2/3 w-56 h-56 rounded-full bg-pink-500/10 animate-float animate-glow" style={{ animationDelay: '-4s' }}></div>
        </div>
        <nav className="absolute top-0 left-0 right-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-base sm:text-2xl font-bold tracking-[0.2em]" style={{ fontFamily: 'var(--font-logo)' }}>
                  ALBERT DIGITAL
                </span>
              </div>
              <button 
                onClick={() => setIsChatOpen(true)}
                className="px-5 py-2.5 bg-black/80 hover:bg-black border border-gray-500/20 hover:border-gray-500/40 rounded-full flex items-center space-x-2 transition-all backdrop-blur-sm text-sm sm:text-base"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                <span>Chatear con Asistente</span>
              </button>
            </div>
          </div>
        </nav>
        
        <div className="relative z-10 container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="relative inline-block">
              <h1 className="text-[2.5rem] sm:text-5xl md:text-6xl font-bold mb-6 tracking-wider leading-[1.2]" style={{ fontFamily: 'var(--font-modern)' }}>
                AUTOMATIZA Y<br />DOMINA EL FUTURO
              </h1>
              <div className="absolute -inset-1 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 blur-lg opacity-10 animate-gradient"></div>
            </div>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-10 mt-6">
              Comienza a generar más dinero y ahorrar tiempo con la ayuda de agentes autónomos y AI avanzada
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://www.youtube.com/@albertdigitalai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-4 bg-black/80 hover:bg-black border border-gray-500/20 hover:border-gray-500/40 rounded-full flex items-center justify-center space-x-3 transition-all backdrop-blur-sm group text-base"
              >
                <span>Aprender Gratis</span>
                <Youtube className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a 
                href="https://cal.com/albert-digital-n3oqsi/consulta-de-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-4 bg-black/80 hover:bg-black border border-gray-500/20 hover:border-gray-500/40 rounded-full flex items-center justify-center space-x-3 transition-all backdrop-blur-sm group text-base"
              >
                <span>Agenda una Consulta</span>
                <Rocket className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Owner Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black"></div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <div className="w-[250px] h-[250px]">
                <img 
                  src="https://scontent.fsju2-1.fna.fbcdn.net/v/t39.30808-6/485766228_8767534596684679_4533926456586124394_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=127cfc&_nc_ohc=oOUHGRnSHOAQ7kNvgEDkbhv&_nc_oc=AdnStPVgFjIcBJHRFG3Q585ECx48cAw6NfTuc4aetsJhPERRuqYpqTxNo3xnmxaVmVRUvgshL3DCnOLTWKg3mVkf&_nc_zt=23&_nc_ht=scontent.fsju2-1.fna&_nc_gid=2C6toekseyhPMgLMJVXsyg&oh=00_AYG3We2T33cpJg4HifcSEjC39ra9qOs6kgchpWc5w86tBw&oe=67E3E943" 
                  alt="Albert Digital - Founder" 
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-wider" style={{ fontFamily: 'var(--font-modern)' }}>
                EXPERTO EN AUTOMATIZACIÓN
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Con años de experiencia en el campo de la automatización y AI avanzada, 
                ayudo a empresas y emprendedores a transformar sus negocios mediante el poder de soluciones innovadoras.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Especialista en Automatización</h3>
                    <p className="text-gray-400">Desarrollo de soluciones con AI personalizadas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Consultor Estratégico</h3>
                    <p className="text-gray-400">Optimización de procesos empresariales</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/95 via-black to-black/95"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-500/5 animate-float animate-glow" style={{ animationDelay: '-2s' }}></div>
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-purple-500/5 animate-float animate-glow" style={{ animationDelay: '-4s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-wider mb-6" style={{ fontFamily: 'var(--font-modern)' }}>
              SERVICIOS DE AUTOMATIZACIÓN
            </h2>
            <p className="text-gray-400 text-lg">
              Soluciones innovadoras impulsadas por AI avanzada para transformar tu negocio
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group relative">
              <div className="absolute inset-0.5 bg-gradient-to-tr from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-black/90 p-8 rounded-2xl h-full border border-gray-800/50 hover:border-gray-700/50 transition-all duration-500">
                <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Bot className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold mb-4 tracking-wide" style={{ fontFamily: 'var(--font-modern)' }}>
                  Asistentes Virtuales
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Automatiza tareas repetitivas y mejora la eficiencia operativa con asistentes virtuales personalizados que se adaptan a tus necesidades específicas.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0.5 bg-gradient-to-tr from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-black/90 p-8 rounded-2xl h-full border border-gray-800/50 hover:border-gray-700/50 transition-all duration-500">
                <div className="w-14 h-14 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <MessageSquareCode className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-4 tracking-wide" style={{ fontFamily: 'var(--font-modern)' }}>
                  Consultoría AI
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Recibe orientación experta para implementar soluciones con AI que maximicen el potencial de tu empresa y optimicen tus procesos de negocio.
                </p>
              </div>
            </div>

            <div className="group relative sm:col-span-2 lg:col-span-1">
              <div className="absolute inset-0.5 bg-gradient-to-tr from-pink-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
              <div className="relative bg-black/90 p-8 rounded-2xl h-full border border-gray-800/50 hover:border-gray-700/50 transition-all duration-500">
                <div className="w-14 h-14 rounded-xl bg-pink-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Sparkles className="w-8 h-8 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold mb-4 tracking-wide" style={{ fontFamily: 'var(--font-modern)' }}>
                  Soluciones Avanzadas
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Desarrollamos sistemas inteligentes a medida que integran las últimas AI para impulsar la innovación en tu negocio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 container mx-auto px-4 sm:px-6">
        <div className="bg-black/60 backdrop-blur-sm border border-gray-500/20 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden max-w-4xl mx-auto">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-wider" style={{ fontFamily: 'var(--font-modern)' }}>
              COMIENZA TU TRANSFORMACIÓN DIGITAL
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Descubre cómo la AI avanzada puede revolucionar tu negocio. Agenda una consulta gratuita y da el primer paso hacia el futuro.
            </p>
            <a
              href="https://cal.com/albert-digital-n3oqsi/consulta-de-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300"
            >
              Agenda tu Consulta Gratis
              <ChevronRight className="w-5 h-5 ml-2" />
            </a>
          </div>
        </div>
      </section>

      {/* Chat Window */}
      {isChatOpen && (
        <div className={chatWindowClasses}>
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-500/20">
            <div className="flex items-center space-x-3">
              <Bot className="w-6 h-6 text-blue-400" />
              <span className="font-semibold">Asistente Virtual</span>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.isBot
                      ? 'bg-gray-800 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 text-white p-3 rounded-lg">
                  Escribiendo...
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-500/20">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !message.trim()}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;