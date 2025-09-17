'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    image:
      '/conceito-de-marketing-de-midia-social-para-marketing-com-aplicativos.jpg?height=800&width=800&text=Colaboração',
    title: 'Registe-se e descubra a nossa oferta formativa',
    description: 'Tenha acesso imediato ao curso gratuito de Marketing Digital para iniciante.',
  },
  {
    id: 2,
    image: '/icone-da-comunidade-digital-hub-de-midia.jpg?height=800&width=800&text=Analytics',
    title: 'Curso gratuito de Marketing Digital',
    description: 'Tenha acesso à melhor curso de marketing digital do mercado.',
  },
  {
    id: 3,
    image: '/maos-segurando-o-conceito-de-midia-social-smartphone.jpg?height=800&width=800&text=Projetos',
    title: 'Vantagens exclusivas da IMDN',
    description: 'Metodologia prática, conteúdos actualizados e formadores experientes.',
  },
  {
    id: 4,
    image: '/campaign-creators-yktK2qaiVHI-unsplash.jpg?height=800&width=800&text=Produtividade',
    title: 'Curso de Transformação Digital',
    description: 'Especialize-se em Marketing Online e prepare-se para os desafios do futuro.',
  },
];

export default function ImageSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Muda a cada 5 segundos

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative h-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out opacity"
        style={{
          backgroundImage: `url(${slides[currentSlide].image})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/50" />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/7" />

      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center items-center text-white p-12 z-10">
        <div className="max-w-lg text-center">
          {/* Content */}
          <h2 className="text-4xl font-bold mb-6 drop-shadow-lg">{slides[currentSlide].title}</h2>
          <p className="text-xl opacity-90 leading-relaxed drop-shadow-md">{slides[currentSlide].description}</p>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-6 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 backdrop-blur-sm cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-6 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 backdrop-blur-sm cursor-pointer"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Manter também a exportação nomeada para compatibilidade
export { ImageSlider };
