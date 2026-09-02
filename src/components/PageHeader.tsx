import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function PageHeader({ title, back = false }: { title: string; back?: boolean }) { return <header className="page-header">{back ? <Link to="/" aria-label="Voltar"><ChevronLeft size={22} /></Link> : <span /> }<h1>{title}</h1><span /></header> }
