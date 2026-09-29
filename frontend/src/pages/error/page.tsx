import { useNavigate } from "react-router-dom"
import { PATHS } from "@/routes/paths"
import { Button } from "@/components/ui/button"
import { FileQuestion, ShieldOff, ServerCrash } from "lucide-react"

type ErrorType = "not-found" | "unauthorized" | "server-error"

const ERROR_CONFIG: Record<ErrorType, {
  icon: React.ReactNode
  code: string
  title: string
  description: string
}> = {
  "not-found": {
    icon: <FileQuestion className="h-16 w-16 text-muted-foreground" />,
    code: "404",
    title: "Page not found",
    description: "The page you're looking for doesn't exist or has been moved.",
  },
  "unauthorized": {
    icon: <ShieldOff className="h-16 w-16 text-muted-foreground" />,
    code: "403",
    title: "Access denied",
    description: "You don't have permission to view this page.",
  },
  "server-error": {
    icon: <ServerCrash className="h-16 w-16 text-muted-foreground" />,
    code: "500",
    title: "Something went wrong",
    description: "An unexpected error occurred. Please try again later.",
  },
}

interface ErrorPageProps {
  type: ErrorType
}

export default function ErrorPage({ type }: ErrorPageProps) {
  const navigate = useNavigate()
  const { icon, code, title, description } = ERROR_CONFIG[type]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background text-center">
      <div className="flex flex-col items-center gap-3">
        {icon}
        <h1 className="text-6xl font-bold tracking-tight">{code}</h1>
        <p className="text-xl font-medium text-foreground">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      <Button onClick={() => navigate(PATHS.DASHBOARD)}>Go to Dashboard</Button>
    </div>
  )
}
