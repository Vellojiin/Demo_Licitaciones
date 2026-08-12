import { LoginForm } from "@/src/modules/auth/ui/components/login-form";

export function LoginPage() {
  return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Logo / Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Licitaciones Giovanni
            </h1>
            <p className="text-gray-600">
              Sistema de Gestión de Licitaciones Comerciales
            </p>
          </div>

          {/* Form */}
          <LoginForm />
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>
            © 2026 Sistema de Licitaciones. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
    )
}