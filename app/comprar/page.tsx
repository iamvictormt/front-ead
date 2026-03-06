'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useCart, type CartItem } from '@/contexts/cart-context';
import { apiService } from '@/lib/api';
import { LoadingSpinner } from '@/components/loading-spinner';

function ComprarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { setCartItems, setPendingCourseIds, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCartLink = async () => {
      const coursesParam = searchParams.get('cursos');
      
      if (!coursesParam) {
        router.push('/cursos-disponiveis');
        return;
      }

      const courseIds = coursesParam.split(',').filter(id => id.trim());

      if (courseIds.length === 0) {
        router.push('/cursos-disponiveis');
        return;
      }

      // Se ainda está carregando auth, aguardar
      if (authLoading) {
        return;
      }

      // Se usuário não está logado, salvar IDs e redirecionar para login
      if (!user) {
        setPendingCourseIds(courseIds);
        router.push('/login?redirect=carrinho');
        return;
      }

      // Usuário está logado, buscar cursos e adicionar ao carrinho
      try {
        setIsProcessing(true);
        setError(null);
        
        // Limpar carrinho atual
        clearCart();

        // Buscar detalhes dos cursos
        const cartItems: CartItem[] = [];
        
        for (const courseId of courseIds) {
          try {
            const response = await apiService.getCourse(courseId);
            if (response.success && response.data) {
              const course = response.data;
              cartItems.push({
                id: course.id.toString(),
                title: course.title,
                price: course.price,
                thumbnailUrl: course.thumbnailUrl || '/placeholder.svg',
                instructor: {
                  name: course.instructor || 'Instrutor',
                  avatar: '/placeholder.svg',
                },
              });
            }
          } catch (err) {
            console.error(`Erro ao buscar curso ${courseId}:`, err);
          }
        }

        if (cartItems.length > 0) {
          setCartItems(cartItems);
          router.push('/aluno/carrinho');
        } else {
          setError('Não foi possível carregar os cursos selecionados.');
          setTimeout(() => {
            router.push('/cursos-disponiveis');
          }, 3000);
        }
      } catch (err) {
        console.error('Erro ao processar carrinho:', err);
        setError('Erro ao processar sua solicitação.');
        setTimeout(() => {
          router.push('/cursos-disponiveis');
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    processCartLink();
  }, [searchParams, user, authLoading, router, setCartItems, setPendingCourseIds, clearCart]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-300">{error}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Redirecionando...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <LoadingSpinner />
            <p className="text-gray-600 dark:text-gray-300">
              {authLoading ? 'Verificando autenticação...' : 'Preparando seu carrinho...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ComprarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="text-gray-600 dark:text-gray-300">Carregando...</p>
        </div>
      </div>
    }>
      <ComprarContent />
    </Suspense>
  );
}
