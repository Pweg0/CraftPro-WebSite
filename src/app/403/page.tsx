import Link from 'next/link'
import { ShieldX } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-brand-primary flex items-center justify-center px-4">
      <div className="text-center">
        <ShieldX className="h-16 w-16 text-brand-accent mx-auto mb-6" />
        <h1 className="font-display text-2xl text-white mb-4">Acesso Negado</h1>
        <p className="text-white/60 max-w-md mx-auto mb-8">
          Você não tem permissão para acessar esta área. Fale com o super-admin se acredita que isso é um erro.
        </p>
        <Link href="/">
          <Button>Voltar ao site</Button>
        </Link>
      </div>
    </div>
  )
}
